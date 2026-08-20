/*
 * prism.js — Prism currency & capsule-opening calculations.
 *
 * Prism is gained in bursts: `perCycle` Prism every `cycleSeconds`. It's
 * spent opening capsules (for minions) one batch of `bulk` capsules every
 * `intervalSeconds` (1s normally, 0.9s with the Minion Master gamepass),
 * at a fixed Prism cost per capsule.
 *
 * All functions are pure & stateless — they take plain numbers in and
 * return plain numbers/plain objects, matching the style of time.js and
 * economy.js.
 */
(function () {
    window.RS = window.RS || {};

    var Prism = {};

    // ---- Income --------------------------------------------------------

    Prism.incomePerSecond = function (perCycle, cycleSeconds) {
        var per = Number(perCycle) || 0;
        var secs = Math.max(1e-9, Number(cycleSeconds) || 0);
        return per / secs;
    };

    // How much Prism you'll have earned after `timeframeSeconds`.
    Prism.projectedIncome = function (perCycle, cycleSeconds, timeframeSeconds) {
        var rate = Prism.incomePerSecond(perCycle, cycleSeconds);
        var t = Math.max(0, Number(timeframeSeconds) || 0);
        return rate * t;
    };

    // ---- Capsule opening throughput ------------------------------------

    Prism.capsuleIntervalSeconds = function (minionMaster) {
        return minionMaster ? RS.Config.PRISM_INTERVAL_MINION_MASTER : RS.Config.PRISM_INTERVAL_NORMAL;
    };

    // Clamps bulk into the game's allowed [1, PRISM_BULK_MAX] range.
    Prism.clampBulk = function (bulk) {
        var b = Math.floor(Number(bulk) || 0);
        if (!isFinite(b) || b < 1) b = 1;
        if (b > RS.Config.PRISM_BULK_MAX) b = RS.Config.PRISM_BULK_MAX;
        return b;
    };

    Prism.capsulesPerSecond = function (bulk, minionMaster) {
        var interval = Prism.capsuleIntervalSeconds(minionMaster);
        return Prism.clampBulk(bulk) / interval;
    };

    Prism.consumptionPerSecond = function (bulk, minionMaster, costPerCapsule) {
        var cost = Math.max(0, Number(costPerCapsule) || 0);
        return Prism.capsulesPerSecond(bulk, minionMaster) * cost;
    };

    // ---- Sustainability --------------------------------------------------
    // Given a starting Prism stockpile and the player's income/consumption
    // rates, how long can capsule-opening continue, and how many capsules
    // does that add up to?
    //
    // Over time t: prism spent = consumptionPerSecond * t
    //              prism available = stockpile + incomePerSecond * t
    // Setting spent = available and solving for t gives the moment the
    // stockpile hits zero (only meaningful when consumption > income --
    // otherwise income covers the cost forever and it never runs out).
    //
    // Capsule-opening isn't continuous, though -- it resolves once per
    // capsuleIntervalSeconds tick (1s, or 0.9s with Minion Master),
    // however many capsules are in that batch. So the moment the
    // stockpile actually runs dry always lands on a whole tick: if you
    // can afford to open at all, that batch still takes a full interval,
    // never a fraction of one. The continuous-time estimate above is
    // rounded up to the next whole interval to reflect that (and comes
    // out to exactly 0 only when the stockpile can't even start, i.e.
    // stockpile is 0).
    //
    // opts: { stockpile, perCycle, cycleSeconds, bulk, minionMaster, costPerCapsule }
    Prism.evaluateSustain = function (opts) {
        var stockpile = Math.max(0, Number(opts.stockpile) || 0);
        var incomePerSecond = Prism.incomePerSecond(opts.perCycle, opts.cycleSeconds);
        var bulk = Prism.clampBulk(opts.bulk);
        var intervalSeconds = Prism.capsuleIntervalSeconds(opts.minionMaster);
        var capsulesPerSecond = Prism.capsulesPerSecond(bulk, opts.minionMaster);
        var consumptionPerSecond = Prism.consumptionPerSecond(bulk, opts.minionMaster, opts.costPerCapsule);
        var netPerSecond = incomePerSecond - consumptionPerSecond;

        var sustainable = netPerSecond >= 0;
        var timeSeconds;
        if (sustainable) {
            timeSeconds = Infinity;
        } else {
            var rawTimeSeconds = stockpile / -netPerSecond;
            timeSeconds = Math.ceil(rawTimeSeconds / intervalSeconds) * intervalSeconds;
        }
        var totalCapsules = sustainable ? Infinity : capsulesPerSecond * timeSeconds;

        return {
            bulk: bulk,
            capsulesPerSecond: capsulesPerSecond,
            incomePerSecond: incomePerSecond,
            consumptionPerSecond: consumptionPerSecond,
            netPerSecond: netPerSecond,
            sustainable: sustainable,
            timeSeconds: timeSeconds,
            totalCapsules: totalCapsules
        };
    };

    RS.Prism = Prism;
})();
