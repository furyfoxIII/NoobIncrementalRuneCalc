'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRS, makeDrop } = require('./support/loadRS.js');

const RS = loadRS();

function closeTo(actual, expected, relTolerance, message) {
    const tol = Math.max(1e-9, Math.abs(expected) * relTolerance);
    assert.ok(
        Math.abs(actual - expected) <= tol,
        `${message}: expected ~${expected}, got ${actual} (tolerance ${tol})`
    );
}

// Independent ground truth: build the exact discrete distribution of T
// (pity-capped geometric) via direct enumeration and compute mean/variance
// from first principles. Only usable for small M, which is exactly what we
// want for a from-scratch cross-check of the closed-form algebra.
function bruteForceMeanVariance(p, M) {
    const q = 1 - p;
    let mean = 0;
    let meanSquare = 0;
    let probMass = 0;
    for (let k = 1; k < M; k++) {
        const prob = Math.pow(q, k - 1) * p;
        mean += k * prob;
        meanSquare += k * k * prob;
        probMass += prob;
    }
    const lastProb = 1 - probMass; // P(T = M), i.e. q^(M-1)
    mean += M * lastProb;
    meanSquare += M * M * lastProb;
    return { mean, variance: meanSquare - mean * mean };
}

test('singleTrialStats matches brute-force enumeration for small M', () => {
    const cases = [
        { baseChance: '30', luck: 1 },
        { baseChance: '400', luck: 1 },
        { baseChance: '1500', luck: 3 }
    ];
    for (const c of cases) {
        const drop = makeDrop({ baseChance: c.baseChance, type: 'Basic', cap: null });
        const denom = RS.Luck.effectiveDenominator(drop, c.luck);
        const M = RS.Pity.threshold(drop, c.luck);
        const p = 1 / denom;

        const closedForm = RS.Variance.singleTrialStats(drop, c.luck);
        const bruteForce = bruteForceMeanVariance(p, M);

        closeTo(closedForm.mean, bruteForce.mean, 1e-9, `mean baseChance=${c.baseChance}`);
        closeTo(closedForm.variance, bruteForce.variance, 1e-6, `variance baseChance=${c.baseChance}`);
    }
});

test('a guaranteed drop (p=1) has zero variance', () => {
    const drop = makeDrop({ baseChance: '1', type: 'Basic', cap: null });
    const stats = RS.Variance.singleTrialStats(drop, 1);
    assert.equal(stats.mean, 1);
    assert.equal(stats.variance, 0);
});

test('variance formula approaches the standard geometric formula (1-p)/p^2 as M -> infinity', () => {
    // Note: under this game's actual pity rule (M = 2 * effectiveDenominator,
    // i.e. M*p is always exactly 2), pity never asymptotically vanishes --
    // q^M sits at a constant e^-2 no matter how large the denominator gets.
    // That's a real property of the design, not a bug, so it can't be used
    // to exercise the M -> infinity limit through the public Pity API.
    // Instead, temporarily decouple M from p to confirm the variance
    // formula itself (independent of the game's pity policy) correctly
    // reduces to the textbook geometric-distribution variance as the pity
    // cap is relaxed -- this isolates the math in variance.js from the
    // M = 2*denom policy in pity.js.
    const drop = makeDrop({ baseChance: '1e6', type: 'Basic', cap: null });
    const originalThreshold = RS.Pity.threshold;
    try {
        RS.Pity.threshold = () => 1e9; // pity essentially never binds
        const stats = RS.Variance.singleTrialStats(drop, 1);
        const p = 1 / 1e6;
        const standardGeometricVariance = (1 - p) / (p * p);
        closeTo(stats.variance, standardGeometricVariance, 1e-6, 'geometric variance limit');
    } finally {
        RS.Pity.threshold = originalThreshold;
    }
});

test('totalTrialsStats variance scales linearly with copies (i.i.d. cycles)', () => {
    const drop = makeDrop({ baseChance: '5000', type: 'Basic', cap: null });
    const one = RS.Variance.totalTrialsStats(drop, 1, 1);
    const fifty = RS.Variance.totalTrialsStats(drop, 1, 50);
    closeTo(fifty.variance, one.variance * 50, 1e-6, 'variance additivity');
});

test('probit is the inverse standard normal CDF at known reference points', () => {
    closeTo(RS.Variance.probit(0.5), 0, 1e-6, 'probit(0.5)');
    closeTo(RS.Variance.probit(0.8413447460685429), 1, 1e-6, 'probit(Phi(1))');
    closeTo(RS.Variance.probit(0.15865525393145707), -1, 1e-6, 'probit(Phi(-1))');
    closeTo(RS.Variance.probit(0.9772498680518208), 2, 1e-6, 'probit(Phi(2))');
});

test('probit is monotonically increasing', () => {
    const points = [0.01, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 0.99];
    for (let i = 1; i < points.length; i++) {
        assert.ok(RS.Variance.probit(points[i]) > RS.Variance.probit(points[i - 1]));
    }
});

test('totalTrialsPercentile: P1 < P50 < P99 and stays within pity bounds', () => {
    const drop = makeDrop({ baseChance: '20000', type: 'Basic', cap: null });
    const copies = 100;
    const M = RS.Pity.threshold(drop, 1);

    const p1 = RS.Variance.totalTrialsPercentile(drop, 1, copies, 0.01);
    const p50 = RS.Variance.totalTrialsPercentile(drop, 1, copies, 0.5);
    const p99 = RS.Variance.totalTrialsPercentile(drop, 1, copies, 0.99);

    assert.ok(p1 <= p50);
    assert.ok(p50 <= p99);
    assert.ok(p1 >= copies);
    assert.ok(p99 <= copies * M);
});

// Regression test: reported bug where P1 (1% lucky) for a single tracked
// copy always displayed 0ms. Root cause was the old Normal approximation:
// for a single pity-capped trial, stdDev is comparable in size to the
// mean itself (a skewed, near-geometric distribution, not remotely
// Gaussian), so mean - 2.33*stdDev went deeply negative and got clamped
// to a nonsensical 0 trials, then floored up to exactly `copies`. That
// floor is a valid hard minimum (never below 1 trial per success), but it
// is NOT a meaningful 1st-percentile estimate on its own -- collapsing
// every heavily-pitied drop's "lucky" case down to that same bare minimum
// produced its own bug (see the next test). The fixed Gamma-based
// estimate should land comfortably above the floor and below the mean.
test('totalTrialsPercentile never drops below `copies`, and lands meaningfully above it for a heavily-pitied drop', () => {
    const drop = makeDrop({ baseChance: '200000000000000000000', type: 'Noobinial', cap: null });
    const stats = RS.Variance.totalTrialsStats(drop, 1, 1);
    const value = RS.Variance.totalTrialsPercentile(drop, 1, 1, 0.01);
    assert.ok(value >= 1, 'never below the hard floor of 1 trial');
    assert.ok(value > 1000, 'not collapsed to the bare floor for a huge-denominator drop');
    assert.ok(value < stats.mean, 'a 1%-lucky roll should still land below the mean');
});

test('totalTrialsPercentile clamps at `copies` for extreme low percentiles', () => {
    const drop = makeDrop({ baseChance: '50', type: 'Basic', cap: null });
    const value = RS.Variance.totalTrialsPercentile(drop, 1, 1, 0.0001);
    assert.ok(value >= 1);
});

// Regression test: reported bug where P1 (1% lucky) was IDENTICAL for
// different `copies` targets (e.g. asking for 3 vs. 4 copies of a
// heavily-pitied drop showed the exact same "lucky" time/cost). Root
// cause: the old Normal approximation swung negative for both, so both
// got clamped to their own tiny, barely-distinguishable floor once
// converted through a large Bulk into opening actions. A real percentile
// estimate should scale with `copies`, not degenerate to a copies-
// independent floor.
test('totalTrialsPercentile scales with `copies` even at the 1% (lucky) percentile', () => {
    const drop = makeDrop({ baseChance: '2.5e66', type: 'Noobinial', cap: null });
    const p1three = RS.Variance.totalTrialsPercentile(drop, 1, 3, 0.01);
    const p1four = RS.Variance.totalTrialsPercentile(drop, 1, 4, 0.01);
    assert.ok(p1four > p1three, `expected P1(4 copies)=${p1four} > P1(3 copies)=${p1three}`);
});
