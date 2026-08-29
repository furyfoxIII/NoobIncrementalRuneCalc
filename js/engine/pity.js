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
 * Infinity is a deliberate, load-bearing value, not a placeholder: it
 * flows straight into the Prediction/Variance closed-form math (see
 * prediction.js, variance.js) and, via M*log1p(-p) -> -Infinity ->
 * exp(...) -> 0, correctly collapses those formulas back to the plain
 * un-pitied geometric-distribution mean (1/p). variance.js's variance
 * formula can't take that shortcut (it hits a 0*Infinity = NaN term), so
 * it special-cases M === Infinity explicitly — see the comment there.
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
            return Infinity;
        }

        var denom = openingRune
            ? RS.Luck.normalizedDenominator(drop, luckValue, openingRune)
            : RS.Luck.effectiveDenominator(drop, luckValue);
        return Math.max(1, Math.round(denom * RS.Config.PITY_MULTIPLIER));
    };

    RS.Pity = Pity;
})();
