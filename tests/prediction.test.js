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

// Ground-truth brute-force expectation, summing the finite series directly
// (only used here as an independent check on the closed form — this is
// exactly the kind of check that would catch a regression in the M / p
// algebra).
function bruteForceExpectedTrials(p, M) {
    const q = 1 - p;
    let sum = 0;
    for (let k = 0; k < M; k++) {
        sum += Math.pow(q, k);
    }
    return sum;
}

test('expectedTrialsPerSuccess matches brute-force series summation', () => {
    const cases = [
        { baseChance: '50', luck: 1 },   // small denom, pity threshold small enough to brute-force
        { baseChance: '733', luck: 1 },
        { baseChance: '2000', luck: 5 }
    ];
    for (const c of cases) {
        const drop = makeDrop({ baseChance: c.baseChance, type: 'Basic', cap: null });
        const denom = RS.Luck.effectiveDenominator(drop, c.luck);
        const M = RS.Pity.threshold(drop, c.luck);
        const p = 1 / denom;

        const closedForm = RS.Prediction.expectedTrialsPerSuccess(drop, c.luck);
        const bruteForce = bruteForceExpectedTrials(p, M);
        closeTo(closedForm, bruteForce, 1e-9, `baseChance=${c.baseChance} luck=${c.luck}`);
    }
});

test('a guaranteed drop (denominator 1) always takes exactly 1 trial', () => {
    const drop = makeDrop({ baseChance: '1', type: 'Basic', cap: null });
    assert.equal(RS.Prediction.expectedTrialsPerSuccess(drop, 1), 1);
});

test('predictCopies scales roughly linearly with copies (clone bonus aside)', () => {
    const drop = makeDrop({ baseChance: '10000', type: 'Basic', cap: null });
    const opts = { luckValue: 1, bulk: '100', speedSeconds: '0.1' };

    const one = RS.Prediction.predictCopies(drop, 1, opts);
    const hundred = RS.Prediction.predictCopies(drop, 100, opts);

    closeTo(hundred.expectedTotalTrials, one.expectedTotalTrials * 100, 1e-6, 'linearity of expected trials');
});

test('predictCopies applies the clone-chance discount to successes needed', () => {
    const drop = makeDrop({ baseChance: '10000', type: 'Basic', cap: null });
    const opts = { luckValue: 1, bulk: '1', speedSeconds: '1' };

    const eOne = RS.Prediction.expectedTrialsPerSuccess(drop, 1);
    const result = RS.Prediction.predictCopies(drop, 1000, opts);

    const expectedSuccessesNeeded = 1000 / (1 + RS.Config.CLONE_CHANCE);
    closeTo(result.expectedTotalTrials, expectedSuccessesNeeded * eOne, 1e-9, 'clone-chance discount');
});

test('predictCopies computes cost as costPerAction * openingActions', () => {
    const drop = makeDrop({ baseChance: '5000', type: 'Basic', cap: null });
    const openingRune = { cost: { currency: 'Fire', amount: '10' } };
    const result = RS.Prediction.predictCopies(drop, 50, {
        luckValue: 1, bulk: '4', speedSeconds: '0.5', openingRune
    });

    assert.equal(result.costPerAction, 10 * 4);
    assert.equal(result.currency, 'Fire');
    closeTo(result.expectedCost, result.costPerAction * result.expectedOpeningActions, 1e-9, 'expected cost');
});

test('expectedCopiesFromTrials is the exact inverse of predictCopies (round trip)', () => {
    const drop = makeDrop({ baseChance: '25000', type: 'Basic', cap: null });
    const opts = { luckValue: 3, bulk: '10', speedSeconds: '0.2' };

    for (const copies of [1, 2, 3, 17, 100, 101, 5000]) {
        const result = RS.Prediction.predictCopies(drop, copies, opts);
        const back = RS.Prediction.expectedCopiesFromTrials(drop, 3, result.expectedTotalTrials);
        closeTo(back, copies, 1e-9, `round trip for copies=${copies}`);
    }
});

test('expectedCopiesFromTrials returns 0 for 0 trials', () => {
    const drop = makeDrop({ baseChance: '1000', type: 'Basic', cap: null });
    assert.equal(RS.Prediction.expectedCopiesFromTrials(drop, 1, 0), 0);
});

test('predictCopies percentiles are ordered P1 <= P50 <= P99', () => {
    const drop = makeDrop({ baseChance: '50000', type: 'Basic', cap: null });
    const result = RS.Prediction.predictCopies(drop, 200, { luckValue: 1, bulk: '10', speedSeconds: '0.1' });

    const [p1, p50, p99] = result.percentiles;
    assert.equal(p1.p, 0.01);
    assert.equal(p50.p, 0.5);
    assert.equal(p99.p, 0.99);
    assert.ok(p1.trials <= p50.trials, 'P1 <= P50');
    assert.ok(p50.trials <= p99.trials, 'P50 <= P99');
});

test('predictCopies percentile median roughly tracks the mean for large copy counts', () => {
    const drop = makeDrop({ baseChance: '20000', type: 'Basic', cap: null });
    const result = RS.Prediction.predictCopies(drop, 500, { luckValue: 1, bulk: '10', speedSeconds: '0.1' });
    const p50 = result.percentiles.find((pt) => pt.p === 0.5);

    closeTo(p50.trials, result.expectedTotalTrials, 0.05, 'median vs mean for large X');
});

// Regression test: reported bug where tracking a single copy (copies=1) of
// a drop always showed 0ms for the P1 (1% lucky) time estimate, even with
// an ordinary Bulk where instantly getting the drop makes no sense. Root
// cause was in variance.js (see the test there) -- confirming it's fixed
// end-to-end through predictCopies, the actual path the UI calls.
test('predictCopies P1 for a single copy never implies 0 trials with a modest bulk', () => {
    const drop = makeDrop({ baseChance: '2e20', type: 'Noobinial', cap: null });
    const result = RS.Prediction.predictCopies(drop, 1, { luckValue: 1, bulk: '10', speedSeconds: '0.05' });

    const p1 = result.percentiles.find((pt) => pt.p === 0.01);
    assert.ok(p1.trials > 1, 'at least one individual open, and not collapsed to the bare floor');
    assert.ok(p1.seconds > 0, 'a single open at bulk=10 takes nonzero time, not 0ms');
});

// Regression test: reported bug where P1 (1% lucky) was identical no
// matter how many copies were requested, for a drop rare enough that
// Bulk swallows the difference between a few individual rune-opens in a
// single opening action. Asking for more copies should never make the
// "lucky" estimate stay put.
test('predictCopies P1 scales with copies even when Bulk dwarfs the per-copy trial count', () => {
    const drop = makeDrop({ baseChance: '2.5e66', type: 'Noobinial', cap: null });
    const opts = { luckValue: 1, bulk: '1e58', speedSeconds: '0.05' };

    const three = RS.Prediction.predictCopies(drop, 3, opts);
    const four = RS.Prediction.predictCopies(drop, 4, opts);

    const p1three = three.percentiles.find((pt) => pt.p === 0.01);
    const p1four = four.percentiles.find((pt) => pt.p === 0.01);

    assert.notEqual(p1three.trials, p1four.trials, 'P1 trial count should differ between 3 and 4 copies');
});
