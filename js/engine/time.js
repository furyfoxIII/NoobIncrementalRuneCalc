/*
 * time.js — time calculations.
 *
 * "Speed" is treated as seconds-per-opening-action (the crate's own open
 * animation/cooldown). "Bulk" is how many individual runes are opened per
 * action. So:
 *   openings/sec (actions)  = 1 / speed
 *   runes/sec (individual)  = bulk / speed
 * This matches the example in the spec: 100M bulk, 0.10s speed -> 1B runes/sec.
 */
(function () {
    window.RS = window.RS || {};

    var Time = {};

    // All of these return BigNumbers so rates/totals never overflow.

    Time.openingsPerSecond = function (speedSeconds) {
        speedSeconds = Math.max(1e-9, Number(speedSeconds) || 0);
        return new BigNumber(1).div(speedSeconds);
    };

    Time.runesPerSecond = function (bulk, speedSeconds) {
        return BigNumber.from(bulk).times(Time.openingsPerSecond(speedSeconds));
    };

    Time.totalRunesOverTime = function (bulk, speedSeconds, seconds) {
        return Time.runesPerSecond(bulk, speedSeconds).times(seconds);
    };

    // Seconds needed to individually-open `runeCount` runes at the given rate.
    Time.timeForRunes = function (bulk, speedSeconds, runeCount) {
        var rate = Time.runesPerSecond(bulk, speedSeconds);
        if (!rate.gt(0)) return new BigNumber(Infinity);
        return BigNumber.from(runeCount).div(rate);
    };

    // Number of opening actions (bulk-batches) needed to reach runeCount.
    Time.openingActionsForRunes = function (bulk, runeCount) {
        var b = BigNumber.from(bulk);
        if (!b.gt(0)) return new BigNumber(Infinity);
        return BigNumber.from(runeCount).div(b).ceil();
    };

    RS.Time = Time;
})();
