/*
 * openingRuneSelector.js — populate and manage the Opening Rune <select>.
 * Rebuilds its option list whenever the selected Realm changes.
 */
(function () {
    window.RS = window.RS || {};

    var OpeningRuneSelector = {};

    OpeningRuneSelector.init = function () {
        var el = document.getElementById("openingRuneSelector");
        el.addEventListener("change", function () {
            RS.AppState.set({ openingRuneIndex: Number(el.value) });
        });
        OpeningRuneSelector.rebuild();
    };

    OpeningRuneSelector.rebuild = function () {
        var el = document.getElementById("openingRuneSelector");
        var realm = RS.AppState.currentRealm();
        el.innerHTML = "";
        realm.openingRunes.forEach(function (rune, i) {
            var opt = document.createElement("option");
            opt.value = i;
            opt.textContent = rune.name;
            el.appendChild(opt);
        });
        el.value = RS.AppState.get().openingRuneIndex;
        OpeningRuneSelector.updateCostDisplay();
    };

    OpeningRuneSelector.updateCostDisplay = function () {
        var rune = RS.AppState.currentOpeningRune();
        var bulk = RS.AppState.bulkNumber();
        var speed = RS.AppState.speedNumber();
        var costPerUnit = RS.Numbers.parse(rune.cost.amount);
        var costPerAction = costPerUnit * bulk;
        var costPerSecond = costPerAction / speed;

        var el = document.getElementById("costDisplay");
        el.innerHTML =
            '<div class="row"><span>Cost / rune</span><span>' +
            RS.Numbers.format(costPerUnit) + " " + rune.cost.currency +
            '</span></div>' +
            '<div class="row"><span>Cost / second</span><span>' +
            RS.Numbers.format(costPerSecond) + " " + rune.cost.currency +
            '</span></div>' +
            '<div class="row"><span>Drops</span><span>' + rune.drops.length + ' runes</span></div>';
    };

    RS.OpeningRuneSelector = OpeningRuneSelector;
})();
