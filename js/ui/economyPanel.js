/*
 * economyPanel.js — currency calculator UI.
 */
(function () {
    window.RS = window.RS || {};

    var EconomyPanel = {};

    EconomyPanel.init = function () {
        document.getElementById("economyBtn").addEventListener("click", EconomyPanel.calculate);
        EconomyPanel.updateLabel();
    };

    EconomyPanel.updateLabel = function () {
        var rune = RS.AppState.currentOpeningRune();
        document.getElementById("currencyLabel").textContent =
            "Currency Available (" + rune.cost.currency + ")";
    };

    EconomyPanel.calculate = function () {
        var rune = RS.AppState.currentOpeningRune();
        var currency = RS.Numbers.parse(document.getElementById("currencyInput").value) || 0;

        var result = RS.Economy.evaluate({
            openingRune: rune,
            currencyAmount: currency,
            bulk: RS.AppState.bulkNumber(),
            speedSeconds: RS.AppState.speedNumber(),
            luckValue: RS.AppState.luckNumber()
        });

        var el = document.getElementById("economyResult");
        el.innerHTML =
            row("Cost per bulk opening", RS.Numbers.format(result.costPerAction) + " " + rune.cost.currency) +
            row("Individual runes opened", RS.Numbers.format(result.totalTrials), true) +
            row("Opening actions (approx)", RS.Numbers.format(result.affordableActions, 2)) +
            row("Time to spend it all", RS.Format.duration(result.timeSeconds));

        var tbody = document.querySelector("#economyTable tbody");
        tbody.innerHTML = "";
        result.expectedGains.forEach(function (g) {
            var tagClass = g.type === "Noobinial" ? "tag-noobinial" : "tag-basic";
            var tr = document.createElement("tr");
            tr.innerHTML =
                '<td class="rune-name-cell">' + g.name + '</td>' +
                '<td><span class="tag ' + tagClass + '">' + g.type + '</span></td>' +
                '<td>' + RS.Numbers.format(RS.Numbers.floorNear(g.expectedCopies)) + '</td>';
            tbody.appendChild(tr);
        });
    };

    function row(label, value, highlight) {
        return '<div class="result-row' + (highlight ? ' highlight' : '') + '">' +
            '<span class="label">' + label + '</span><span class="value">' + value + '</span></div>';
    }

    RS.EconomyPanel = EconomyPanel;
})();
