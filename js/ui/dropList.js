/*
 * dropList.js — compact live list of all drops for the current Opening
 * Rune: colored rune name, "1/X" odds, and a rounded time-pill showing
 * average time to get one copy. Recomputes in real time whenever Bulk,
 * Speed, or Luck change. The 1/X shown and the
 * time pill both come from the same (active) odds model. Also feeds the Prediction panel's target-rune
 * selector.
 */
(function () {
    window.RS = window.RS || {};

    var DropList = {};

    DropList.render = function () {
        var rune = RS.AppState.currentOpeningRune();
        var luck = RS.AppState.luckNumber();
        var bulk = RS.AppState.bulkNumber();
        var speed = RS.AppState.speedNumber();
        var runesPerSecond = RS.Time.runesPerSecond(bulk, speed);

        var container = document.getElementById("dropList");
        container.innerHTML = "";

        rune.drops.forEach(function (drop) {
            // Odds shown are the ones the time pill is computed from, so
            // 1/X and the time always agree.
            var rawDenom = RS.Luck.effectiveDenominator(drop, luck);
            var denom = RS.Luck.normalizedDenominator(drop, luck, rune);
            var atCap = RS.Luck.isAtCap(drop, luck);
            var isNoobinial = drop.type === "Noobinial";
            var nameStyle = RS.RarityColor.styleForDrop(drop);

            var expectedTrials = RS.Prediction.expectedTrialsPerSuccess(drop, luck, rune);
            var avgSeconds = runesPerSecond.gt(0) ? expectedTrials.div(runesPerSecond) : new BigNumber(Infinity);
            var avgTimeText = formatAvgTime(avgSeconds);

            // When the table's shared roll is lowering this drop's odds
            // (see Luck.normalizedChance), show the raw odds beside them.
            var rawNote = "";
            if (RS.Luck.isContended(drop, luck, rune) && denom.isFinite() && denom.gt(0) &&
                denom.div(rawDenom).minus(1).abs().gt(0.0005)) {
                rawNote = '<span class="rune-row-raw" title="Raw odds, before the shared roll is scaled to 100%">raw 1/' +
                    RS.Numbers.formatNamed(rawDenom) + '</span>';
            }

            var pillTitle = "Average time to get one copy at these odds";
            if (isNoobinial) {
                pillTitle += " (includes the pity guarantee after " +
                    RS.Numbers.formatNamed(RS.Pity.threshold(drop, luck, rune)) + " opens, so it is a little shorter than 1/odds \u00f7 rate)";
            }

            var row = document.createElement("div");
            row.className = "rune-row";
            if (atCap) row.classList.add("at-cap");
            if (isNoobinial) row.classList.add("noobinial-row");

            row.innerHTML =
                '<div class="rune-row-left">' +
                    '<span class="rune-row-name" style="' + nameStyle + '">' + drop.name + '</span>' +
                    '<span class="rune-row-odds">1/' + RS.Numbers.formatNamed(denom) + (atCap ? '<span class="cap-badge">CAP</span>' : '') + '</span>' +
                    rawNote +
                '</div>' +
                '<div class="time-pill" title="' + pillTitle + '">' + avgTimeText + '</div>';

            container.appendChild(row);
        });

        DropList.rebuildPredictSelector(rune);
    };

    function formatAvgTime(seconds) {
        if (!seconds.isFinite()) return "—";
        if (seconds.lt(1)) return "Instant";
        return RS.Format.duration(seconds);
    }

    DropList.rebuildPredictSelector = function (rune) {
        var el = document.getElementById("predictRuneSelector");
        var prevValue = el.value;
        el.innerHTML = "";
        rune.drops.forEach(function (drop, i) {
            var opt = document.createElement("option");
            opt.value = i;
            opt.textContent = drop.name;
            el.appendChild(opt);
        });
        if (prevValue && Number(prevValue) < rune.drops.length) el.value = prevValue;
    };

    RS.DropList = DropList;
})();
