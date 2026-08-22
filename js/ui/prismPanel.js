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
        byId("prismTimeframeTextInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.timeframeText": e.target.value });
        });
        byId("prismTargetAmountInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.targetAmount": e.target.value });
        });
        byId("prismStockpileInput").addEventListener("input", function (e) {
            RS.AppState.set({ "prism.stockpile": e.target.value });
        });

        byId("prismModeForwardBtn").addEventListener("click", function () {
            RS.AppState.set({ "prism.overTimeMode": "forward" });
        });
        byId("prismModeReverseBtn").addEventListener("click", function () {
            RS.AppState.set({ "prism.overTimeMode": "reverse" });
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
        setIfChanged(byId("prismTimeframeTextInput"), state["prism.timeframeText"]);
        setIfChanged(byId("prismTargetAmountInput"), state["prism.targetAmount"]);
        setIfChanged(byId("prismStockpileInput"), state["prism.stockpile"]);

        var mode = state["prism.overTimeMode"] || "forward";
        byId("prismModeForwardBtn").classList.toggle("active", mode === "forward");
        byId("prismModeReverseBtn").classList.toggle("active", mode === "reverse");
        byId("prismForwardFields").style.display = mode === "forward" ? "" : "none";
        byId("prismReverseFields").style.display = mode === "reverse" ? "" : "none";
        byId("prismOverTimeSub").textContent = mode === "forward" ?
            "How much Prism will I have after a given timeframe?" :
            "How long will it take to earn a given amount of Prism?";

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

    // ---- Calculator 1: Prism over time, either direction -----------------
    // Forward mode: type a timeframe (free-text, e.g. "2h50min") -> see
    // how much Prism that earns. Reverse mode: type a target Prism amount
    // -> see how long it takes to earn.

    PrismPanel.updateIncomeDisplay = function () {
        var state = RS.AppState.get();
        var mode = state["prism.overTimeMode"] || "forward";
        var perCycle = RS.Numbers.parse(state["prism.perCycle"]);
        var cycleSeconds = RS.Numbers.parse(state["prism.cycleSeconds"]);
        var el = byId("prismIncomeResult");
        var timeframeInput = byId("prismTimeframeTextInput");

        if (mode === "forward") {
            var timeframeSeconds = RS.Format.parseDuration(state["prism.timeframeText"]);
            var valid = isFinite(timeframeSeconds) && !isNaN(timeframeSeconds);

            timeframeInput.classList.toggle("input-invalid", !valid && state["prism.timeframeText"] !== "");

            if (!valid) {
                el.innerHTML = row("Prism earned", "—", true);
                return;
            }

            var total = RS.Prism.projectedIncome(perCycle, cycleSeconds, timeframeSeconds);
            el.innerHTML =
                row("Duration", RS.Format.duration(timeframeSeconds)) +
                row("Prism earned", RS.Numbers.format(total), true);
        } else {
            timeframeInput.classList.remove("input-invalid");
            var targetAmount = RS.Numbers.parse(state["prism.targetAmount"]) || 0;
            var seconds = RS.Prism.timeForAmount(perCycle, cycleSeconds, targetAmount);
            var durationText = isFinite(seconds) ? RS.Format.duration(seconds) : "Never (no income)";
            el.innerHTML = row("Time needed", durationText, true);
        }
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
        var capsulesText = result.sustainable ? "∞" : RS.Numbers.format(Math.floor(result.totalCapsules));
        el.innerHTML =
            row("Duration", durationText, true) +
            row("Capsules opened", capsulesText);
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
