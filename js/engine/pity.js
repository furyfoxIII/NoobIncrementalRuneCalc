/*
 * pity.js — guaranteed-drop mechanic.
 *
 * "If you did not get a rune after opening an amount of double its luck
 * [i.e. double its effective denominator], you are guaranteed to get it
 * on the next opening." Threshold = PITY_MULTIPLIER * effectiveDenominator,
 * measured in individual rune-opens (miss streaks), per drop — applies to
 * every drop type. effectiveDenominator already handles the per-type
 * differences (Noobinial ignores luck, Basic scales with it and respects
 * its own cap), so pity naturally follows suit with no extra branching
 * needed here.
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
        var denom = openingRune
            ? RS.Luck.normalizedDenominator(drop, luckValue, openingRune)
            : RS.Luck.effectiveDenominator(drop, luckValue);
        return Math.max(1, Math.round(denom * RS.Config.PITY_MULTIPLIER));
    };

    RS.Pity = Pity;
})();
