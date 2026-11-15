/*
 * clones.js — rune clones.
 *
 * Clones are guaranteed: every successful drop also drops a clone, so each
 * success gives RS.Config.COPIES_PER_SUCCESS copies (2). Getting X copies
 * therefore takes ceil(X / 2) successes -- always a whole number: one copy
 * still needs one success (you simply end up with two), five copies need
 * three (you end up with six).
 *
 * Everything that works in "successes" (opens per success, pity, the
 * distribution of the total) is unchanged; this module is the only place
 * that converts between copies and successes.
 */
(function () {
    window.RS = window.RS || {};

    var Clones = {};

    // Copies gained per success: a whole number >= 1 (1 = no clones).
    Clones.copiesPerSuccess = function () {
        var n = Math.floor(Number(RS.Config.COPIES_PER_SUCCESS));
        return n >= 1 ? n : 1;
    };

    // Whole successes needed to end up with at least `copies` copies.
    Clones.successesNeeded = function (copies) {
        copies = BigNumber.from(copies);
        var per = Clones.copiesPerSuccess();
        return per === 1 ? copies : copies.div(per).ceil();
    };

    // Expected copies from an (expected) number of successes. The number of
    // successes may be fractional here: it is a long-run average, not a
    // count of actual drops.
    Clones.expectedCopies = function (successes) {
        return BigNumber.from(successes).times(Clones.copiesPerSuccess());
    };

    RS.Clones = Clones;
})();
