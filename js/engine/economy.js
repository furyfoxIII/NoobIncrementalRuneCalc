/*
 * economy.js — currency calculations.
 * "I have X currency. How many openings can I afford, and what are my
 * expected rune gains?"
 *
 * Currency buys individual rune-opens at a fixed cost of costPerUnit each
 * -- it is NOT gated to whole bulk-batches. Bulk only controls how many
 * runes get attempted per opening action (i.e. opening speed/throughput),
 * not whether you can afford to open at all. So if your currency covers
 * fewer runes than a single bulk-batch would attempt, you still get
 * however many individual opens it covers, and that happens well within
 * a single action -- practically instantly, not "zero, because you can't
 * afford a full batch." `affordableActions` reflects that: it's allowed
 * to be a fraction well below 1.
 */
(function () {
    window.RS = window.RS || {};

    var Economy = {};

    // opts: { openingRune, currencyAmount, bulk, speedSeconds, luckValue }
    Economy.evaluate = function (opts) {
        var openingRune = opts.openingRune;
        var currency = Number(opts.currencyAmount) || 0;
        var costPerUnit = RS.Numbers.parse(openingRune.cost.amount);
        var bulk = opts.bulk;
        var speedSeconds = opts.speedSeconds;
        var luckValue = opts.luckValue;

        var bulkNum = bulk instanceof BigNumber ? bulk.toNumber() : Number(bulk);
        var costPerAction = costPerUnit * bulkNum; // cost of one full bulk-batch (informational)

        // Individual rune-opens your currency actually covers.
        var totalTrials = costPerUnit > 0 ? Math.floor(currency / costPerUnit) : 0;

        // Expressed in "opening actions" too -- can be a small fraction if
        // your currency doesn't stretch to a full bulk-batch, meaning it
        // all resolves within (well under) one action.
        var affordableActions = bulkNum > 0 ? totalTrials / bulkNum : 0;

        var runesPerSecond = RS.Time.runesPerSecond(bulk, speedSeconds);
        var timeSeconds = runesPerSecond > 0 ? totalTrials / runesPerSecond : 0;

        var expectedGains = [];
        var dropList = openingRune.drops;
        for (var i = 0; i < dropList.length; i++) {
            var drop = dropList[i];
            var expected = RS.Prediction.expectedCopiesFromTrials(drop, luckValue, totalTrials, openingRune);
            expectedGains.push({
                name: drop.name,
                type: drop.type,
                expectedCopies: expected
            });
        }

        return {
            currency: currency,
            costPerAction: costPerAction,
            affordableActions: affordableActions,
            totalTrials: totalTrials,
            timeSeconds: timeSeconds,
            expectedGains: expectedGains
        };
    };

    RS.Economy = Economy;
})();
