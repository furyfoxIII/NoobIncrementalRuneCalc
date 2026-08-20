/*
 * prediction.js — mathematical (closed-form) predictions, as opposed to
 * brute-force simulation. This is what makes "time to get 100 Mirage" work
 * even when that would take longer than the browser could ever loop through.
 *
 * --- Expected trials for ONE success, accounting for pity ---------------
 * Let p = 1 / effectiveDenominator, M = pity threshold (in individual
 * rune-opens). Since a pitied roll is capped at M attempts, and
 * P(T > k) = (1-p)^k for k = 0..M-1, the expectation telescopes into the
 * closed form:
 *
 *     E[T] = SUM_{k=0}^{M-1} (1-p)^k = (1 - (1-p)^M) / p
 *
 * Computed stably via exp(M * log1p(-p)) rather than Math.pow, since p can
 * be astronomically small.
 *
 * --- Expected trials for X successes -------------------------------------
 * Assuming the pity counter resets after each success (independent
 * "cycles"), E[T_total] = X * E[T]. Clones give a small free bonus: each
 * success has an extra RS.Config.CLONE_CHANCE chance of counting as 2, so
 * the number of *successes* needed is reduced to X / (1 + CLONE_CHANCE).
 */
(function () {
    window.RS = window.RS || {};

    var Prediction = {};

    // Expected number of individual rune-opens for ONE success on `drop`.
    // `openingRune`, if supplied, enables bulk-contention normalization
    // (see Luck.normalizedChance) — pass it whenever the full sibling
    // drop table is available, which is everywhere in this app.
    Prediction.expectedTrialsPerSuccess = function (drop, luckValue, openingRune) {
        var p = Math.min(1, RS.Luck.normalizedChance(drop, luckValue, openingRune));
        var M = RS.Pity.threshold(drop, luckValue, openingRune);

        var logQM = M * Math.log1p(-p);
        var qM = Math.exp(logQM); // (1-p)^M, numerically stable
        return (1 - qM) / p;
    };

    // Percentiles reported alongside the mean prediction — see variance.js
    // for the Normal-approximation math behind these. P1/P99 give a wider,
    // more dramatic "best case / worst case" bracket than P10/P90.
    var PERCENTILES = [0.01, 0.5, 0.99];

    // Full prediction for "how long until I get `copies` of `drop`".
    // opts: { drop, luckValue, bulk, speedSeconds, openingRune }
    Prediction.predictCopies = function (drop, copies, opts) {
        var luckValue = opts.luckValue;
        var bulk = opts.bulk;
        var speedSeconds = opts.speedSeconds;
        var openingRune = opts.openingRune;

        var eTrialsPerSuccess = Prediction.expectedTrialsPerSuccess(drop, luckValue, openingRune);
        var yieldMultiplier = drop.yieldMultiplier || 1;
        var successesNeeded = Number(copies) / yieldMultiplier / (1 + RS.Config.CLONE_CHANCE);
        var expectedTrials = successesNeeded * eTrialsPerSuccess;

        var runesPerSecond = RS.Time.runesPerSecond(bulk, speedSeconds);
        var seconds = runesPerSecond > 0 ? expectedTrials / runesPerSecond : Infinity;
        var openingActions = RS.Time.openingActionsForRunes(bulk, expectedTrials);

        var varianceStats = RS.Variance.totalTrialsStats(drop, luckValue, copies, openingRune);

        var result = {
            dropName: drop.name,
            copiesRequested: Number(copies),
            effectiveDenominator: RS.Luck.effectiveDenominator(drop, luckValue),
            effectiveChance: RS.Luck.effectiveChance(drop, luckValue),
            normalizedDenominator: RS.Luck.normalizedDenominator(drop, luckValue, openingRune),
            normalizedChance: RS.Luck.normalizedChance(drop, luckValue, openingRune),
            pityThreshold: RS.Pity.threshold(drop, luckValue, openingRune),
            expectedTrialsPerSuccess: eTrialsPerSuccess,
            expectedTotalTrials: expectedTrials,
            expectedOpeningActions: openingActions,
            expectedSeconds: seconds,
            stdDevTotalTrials: varianceStats.stdDev,
            stdDevSeconds: runesPerSecond > 0 ? varianceStats.stdDev / runesPerSecond : Infinity
        };

        // Cost only reflects the runes actually opened -- expectedTrials --
        // multiplied by the per-rune cost. It is NOT rounded up to whole
        // bulk-batches (that would impose an artificial bulk*price minimum
        // even when far fewer than a full batch's worth of runes were
        // needed), matching how the Economy tab treats currency as buying
        // individual opens rather than whole actions.
        var costPerUnit;
        if (opts.openingRune) {
            costPerUnit = RS.Numbers.parse(opts.openingRune.cost.amount);
            result.currency = opts.openingRune.cost.currency;
            result.expectedCost = expectedTrials * costPerUnit;
        }

        // Percentiles: "if I get typical/lucky/unlucky rolls, how long (and
        // how much) does X copies actually take?" — the variance-driven
        // answer Monte Carlo used to provide, still closed-form.
        result.percentiles = PERCENTILES.map(function (pct) {
            var trials = RS.Variance.totalTrialsPercentile(drop, luckValue, copies, pct, openingRune);
            var pctSeconds = runesPerSecond > 0 ? trials / runesPerSecond : Infinity;
            var entry = { p: pct, trials: trials, seconds: pctSeconds };
            if (opts.openingRune) {
                entry.cost = trials * costPerUnit;
            }
            return entry;
        });

        return result;
    };

    // Expected number of copies of `drop` obtained from `trials` individual
    // rune-opens, accounting for pity via the renewal-reward rate.
    //
    // Pity means a success arrives faster than plain probability p would
    // suggest (it's GUARANTEED by the threshold M), so the long-run rate of
    // successes per trial is 1 / expectedTrialsPerSuccess, not p. Using
    // this rate makes this function the exact inverse of predictCopies —
    // predicting X copies and then reading the count back off `trials`
    // returns X, not some pity-deflated fraction of it.
    Prediction.expectedCopiesFromTrials = function (drop, luckValue, trials, openingRune) {
        var eTrialsPerSuccess = Prediction.expectedTrialsPerSuccess(drop, luckValue, openingRune);
        var expectedSuccesses = eTrialsPerSuccess > 0 ? trials / eTrialsPerSuccess : 0;
        var yieldMultiplier = drop.yieldMultiplier || 1;
        return expectedSuccesses * (1 + RS.Config.CLONE_CHANCE) * yieldMultiplier;
    };

    RS.Prediction = Prediction;
})();
