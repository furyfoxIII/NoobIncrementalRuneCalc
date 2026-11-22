/*
 * clones.js — rune clones.
 *
 * Clones are guaranteed: every successful drop also drops a clone, so each
 * success gives RS.Config.COPIES_PER_SUCCESS copies (2). Getting X copies
 * therefore takes ceil(X / 2) successes -- always a whole number: one copy
 * still needs one success (you simply end up with two), five copies need
 * three (you end up with six).
 *
 * Event runes have no clone mechanic: an opening rune (or its realm) with
 * `clones: false` gives 1 copy per success, so X copies need X successes.
 *
 * Everything that works in "successes" (opens per success, pity, the
 * distribution of the total) is unchanged; this module is the only place
 * that converts between copies and successes.
 */
(function () {
    window.RS = window.RS || {};

    var Clones = {};

    // Copies gained per success: a whole number >= 1 (1 = no clones).
    // `openingRune` is optional; one with `clones: false` has no clones.
    Clones.copiesPerSuccess = function (openingRune) {
        if (openingRune && openingRune.clones === false) return 1;
        var n = Math.floor(Number(RS.Config.COPIES_PER_SUCCESS));
        return n >= 1 ? n : 1;
    };

    // Whole successes needed to end up with at least `copies` copies.
    Clones.successesNeeded = function (copies, openingRune) {
        copies = BigNumber.from(copies);
        var per = Clones.copiesPerSuccess(openingRune);
        return per === 1 ? copies : copies.div(per).ceil();
    };

    // Expected copies from an (expected) number of successes. The number of
    // successes may be fractional here: it is a long-run average, not a
    // count of actual drops.
    Clones.expectedCopies = function (successes, openingRune) {
        return BigNumber.from(successes).times(Clones.copiesPerSuccess(openingRune));
    };

    RS.Clones = Clones;
})();
