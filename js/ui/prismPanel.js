/*
 * prismPanel.js — Prism tab UI: the global Prism-income settings (shared by
 * both calculators below), the "how much Prism in X time" calculator, and
 * the "how long can I keep opening capsules for" calculator.
 *
 * Pattern: each input's own event listener is the only thing that ever
 * calls AppState.set (committing exactly the field the player just edited).
 * Every render function below is a pure read of the current state, safe to
 * call as often as needed -- including from AppState.onChange in main.js --
 * without looping back into another AppState.set.
 */
(function () {
    window.RS = window.RS || {};

    var PrismPanel = {};

    var UNIT_SECONDS = {
        seconds: 1,
        minutes: 60,
        hours: 3600,
        days: 86400
    };

    PrismPanel.init = function () {
        byId("prismPerCycleInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.perCycle": e.target.value });
        });
        byId("prismCycleSecondsInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.cycleSeconds": e.target.value });
        });
        byId("prismMinionMasterCheckbox").addEventListener("change", function (e) {
            RS.AppState.set({ "prism.minionMaster": e.target.checked ? "true" : "false" });
        });
        byId("prismBulkInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.bulk": e.target.value });
        });
        byId("prismBulkInput").addEventListener("blur", function (e) {
            // Snap out-of-range values back into [1, PRISM_BULK_MAX] once the
            // player finishes typing, without fighting them mid-keystroke.
            var clamped = String(RS.Prism.clampBulk(e.target.value));
            if (clamped !== e.target.value) RS.AppState.set({ "prism.bulk": clamped });
        });
        byId("prismCostPerCapsuleInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.costPerCapsule": e.target.value });
        });
        byId("prismTimeframeValueInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.timeframeValue": e.target.value });
        });
        byId("prismTimeframeUnitSelect").addEventListener("change", function (e) {
            RS.AppState.set({ "prism.timeframeUnit": e.target.value });
        });
        byId("prismStockpileInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.stockpile": e.target.value });
        });

        PrismPanel.sync();
    };

    // Refreshes every input's displayed value to match AppState, then
    // re-renders the live rate display and both calculators. Called once at
    // startup and on every AppState change (realm switch, other tab's
    // edits, etc.) so the Prism tab is always current whenever it's shown.
    PrismPanel.sync = function () {
        var state = RS.AppState.get();

        setIfChanged(byId("prismPerCycleInput"), state["prism.perCycle"]);
        setIfChanged(byId("prismCycleSecondsInput"), state["prism.cycleSeconds"]);
        byId("prismMinionMasterCheckbox").checked = RS.AppState.prismMinionMaster();
        setIfChanged(byId("prismBulkInput"), state["prism.bulk"]);
        setIfChanged(byId("prismCostPerCapsuleInput"), state["prism.costPerCapsule"]);
        setIfChanged(byId("prismTimeframeValueInput"), state["prism.timeframeValue"]);
        setIfChanged(byId("prismTimeframeUnitSelect"), state["prism.timeframeUnit"]);
        setIfChanged(byId("prismStockpileInput"), state["prism.stockpile"]);

        PrismPanel.updateRateDisplay();
        PrismPanel.updateIncomeDisplay();
        PrismPanel.updateSustainDisplay();
    };

    PrismPanel.updateRateDisplay = function () {
        var state = RS.AppState.get();
        var incomePerSecond = RS.Prism.incomePerSecond(
            RS.Numbers.parse(state["prism.perCycle"]),
            RS.Numbers.parse(state["prism.cycleSeconds"])
        );
        var minionMaster = RS.AppState.prismMinionMaster();
        var capsulesPerSecond = RS.Prism.capsulesPerSecond(state["prism.bulk"], minionMaster);
        var consumptionPerSecond = RS.Prism.consumptionPerSecond(
            state["prism.bulk"], minionMaster, RS.Numbers.parse(state["prism.costPerCapsule"])
        );

        var el = byId("prismRateDisplay");
        el.innerHTML =
            row("Prism / sec (income)", RS.Numbers.format(incomePerSecond)) +
            row("Capsules / sec", RS.Numbers.format(capsulesPerSecond)) +
            row("Prism / sec (spent)", RS.Numbers.format(consumptionPerSecond));
    };

    // ---- Calculator 1: Prism earned over a timeframe --------------------

    PrismPanel.updateIncomeDisplay = function () {
        var state = RS.AppState.get();
        var timeframeValue = RS.Numbers.parse(state["prism.timeframeValue"]) || 0;
        var unitSeconds = UNIT_SECONDS[state["prism.timeframeUnit"]] || 1;
        var timeframeSeconds = timeframeValue * unitSeconds;

        var total = RS.Prism.projectedIncome(
            RS.Numbers.parse(state["prism.perCycle"]),
            RS.Numbers.parse(state["prism.cycleSeconds"]),
            timeframeSeconds
        );

        var el = byId("prismIncomeResult");
        el.innerHTML = row("Prism earned", RS.Numbers.format(total), true);
    };

    // ---- Calculator 2: how long capsule-opening is sustainable ----------

    PrismPanel.updateSustainDisplay = function () {
        var state = RS.AppState.get();
        var result = RS.Prism.evaluateSustain({
            stockpile: RS.Numbers.parse(state["prism.stockpile"]),
            perCycle: RS.Numbers.parse(state["prism.perCycle"]),
            cycleSeconds: RS.Numbers.parse(state["prism.cycleSeconds"]),
            bulk: state["prism.bulk"],
            minionMaster: RS.AppState.prismMinionMaster(),
            costPerCapsule: RS.Numbers.parse(state["prism.costPerCapsule"])
        });

        var el = byId("prismSustainResult");
        var durationText = result.sustainable ? "Indefinitely" : RS.Format.duration(result.timeSeconds);
        el.innerHTML = row("Duration", durationText, true);
    };

    // ---- helpers ----------------------------------------------------------

    function byId(id) { return document.getElementById(id); }

    function setIfChanged(el, value) {
        if (value === undefined) return;
        if (el.value !== value) el.value = value;
    }

    function row(label, value, highlight) {
        return '<div class="result-row' + (highlight ? ' highlight' : '') + '">' +
            '<span class="label">' + label + '</span><span class="value">' + value + '</span></div>';
    }

    RS.PrismPanel = PrismPanel;
})();
