/*
 * pity.js — guaranteed-drop mechanic.
 *
 * "If you did not get a rune after opening an amount of double its luck
 * [i.e. double its effective denominator], you are guaranteed to get it
 * on the next opening." Threshold = PITY_MULTIPLIER * effectiveDenominator,
 * measured in individual rune-opens (miss streaks).
 *
 * Noobinial-only: pity is confirmed to apply only to "Noobinial" type
 * drops. Every other type (e.g. "Basic") has NO pity — threshold returns
 * Infinity, meaning misses never force a guaranteed drop.
 *
 * Infinity (a BigNumber holding Infinity) is a deliberate, load-bearing
 * value, not a placeholder: prediction.js and variance.js test for it with
 * isFinite() and use the plain un-pitied geometric-distribution formulas
 * (mean 1/p, variance (1-p)/p^2) when it's seen. The threshold is
 * otherwise a BigNumber too, so it stays exact for astronomically rare
 * drops.
 *
 * This threshold feeds directly into the Prediction engine's closed-form
 * expected-value math (see prediction.js), which computes its per-roll
 * probability p from RS.Luck.normalizedChance — the bulk-contention-
 * adjusted chance (see luck.js), not the raw effectiveChance. M and p
 * MUST refer to the same distribution or the closed-form math silently
 * breaks: whenever `openingRune` is supplied, this uses the same
 * normalized denominator so pity triggers at the point the player
 * actually experiences (2x their REAL per-roll odds), not 2x a
 * pre-contention number that understates how rare the roll actually is.
 * Omitting openingRune falls back to the plain effectiveDenominator,
 * unchanged from before.
 */
(function () {
    window.RS = window.RS || {};

    var Pity = {};

    Pity.threshold = function (drop, luckValue, openingRune) {
        if (drop.type !== "Noobinial") {
            return new BigNumber(Infinity);
        }

        var denom = openingRune
            ? RS.Luck.normalizedDenominator(drop, luckValue, openingRune)
            : RS.Luck.effectiveDenominator(drop, luckValue);
        return BigNumber.max(1, denom.times(RS.Config.PITY_MULTIPLIER).round());
    };

    RS.Pity = Pity;
})();
