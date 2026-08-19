/*
 * dropList.js — compact live list of all drops for the current Opening
 * Rune: colored rune name, "1/X" odds, and a rounded time-pill showing
 * average time to get one copy. Recomputes in real time whenever Bulk,
 * Speed, or Luck change. Also feeds the Prediction panel's target-rune
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
            var denom = RS.Luck.effectiveDenominator(drop, luck);
            var atCap = RS.Luck.isAtCap(drop, luck);
            var isNoobinial = drop.type === "Noobinial";
            var nameStyle = RS.RarityColor.styleForDrop(drop);

            var expectedTrials = RS.Prediction.expectedTrialsPerSuccess(drop, luck, rune);
            var avgSeconds = runesPerSecond > 0 ? expectedTrials / runesPerSecond : Infinity;
            var avgTimeText = formatAvgTime(avgSeconds);

            var row = document.createElement("div");
            row.className = "rune-row";
            if (atCap) row.classList.add("at-cap");
            if (isNoobinial) row.classList.add("noobinial-row");

            row.innerHTML =
                '<div class="rune-row-left">' +
                    '<span class="rune-row-name" style="' + nameStyle + '">' + drop.name + '</span>' +
                    '<span class="rune-row-odds">1/' + RS.Numbers.format(denom) + (atCap ? '<span class="cap-badge">CAP</span>' : '') + '</span>' +
                '</div>' +
                '<div class="time-pill">' + avgTimeText + '</div>';

            container.appendChild(row);
        });

        DropList.rebuildPredictSelector(rune);
    };

    function formatAvgTime(seconds) {
        if (!isFinite(seconds)) return "—";
        if (seconds < 1) return "Instant";
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
