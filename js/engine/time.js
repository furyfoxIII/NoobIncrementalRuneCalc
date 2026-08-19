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

    Time.openingsPerSecond = function (speedSeconds) {
        speedSeconds = Math.max(1e-9, Number(speedSeconds) || 0);
        return 1 / speedSeconds;
    };

    Time.runesPerSecond = function (bulk, speedSeconds) {
        var b = bulk instanceof BigNumber ? bulk.toNumber() : Number(bulk);
        return b * Time.openingsPerSecond(speedSeconds);
    };

    Time.totalRunesOverTime = function (bulk, speedSeconds, seconds) {
        return Time.runesPerSecond(bulk, speedSeconds) * seconds;
    };

    // Seconds needed to individually-open `runeCount` runes at the given rate.
    Time.timeForRunes = function (bulk, speedSeconds, runeCount) {
        var rate = Time.runesPerSecond(bulk, speedSeconds);
        if (rate <= 0) return Infinity;
        var count = runeCount instanceof BigNumber ? runeCount.toNumber() : Number(runeCount);
        return count / rate;
    };

    // Number of opening actions (bulk-batches) needed to reach runeCount.
    Time.openingActionsForRunes = function (bulk, runeCount) {
        var b = bulk instanceof BigNumber ? bulk.toNumber() : Number(bulk);
        if (b <= 0) return Infinity;
        var count = runeCount instanceof BigNumber ? runeCount.toNumber() : Number(runeCount);
        return Math.ceil(count / b);
    };

    RS.Time = Time;
})();
