/*
 * playerInputs.js — manage Bulk, Speed, and Luck input fields.
 *
 * Bulk, Speed, and Luck aren't single values — there's a separate
 * normal/event/prism track for each (see appState.js), matching the game's
 * own "f.bulk"/"f.speed"/"f.luck" (event) and "p.bulk"/"p.speed"/"p.luck"
 * (prism) naming. Which track the inputs read from and write to switches
 * automatically based on the selected opening rune, and each field's label
 * renames itself to match (e.g. "Bulk" -> "f.bulk") so it's always clear
 * which value you're editing.
 */
(function () {
    window.RS = window.RS || {};

    var PlayerInputs = {};

    var LABELS = {
        normal: { bulk: "Rune Bulk", speed: "Rune Speed", luck: "Rune Luck" },
        event: { bulk: "F.Rune Bulk", speed: "F.Rune Speed", luck: "F.Rune Luck" },
        prism: { bulk: "P.Rune Bulk", speed: "P.Rune Speed", luck: "P.Rune Luck" }
    };

    PlayerInputs.init = function () {
        var bulkEl = document.getElementById("bulkInput");
        var speedEl = document.getElementById("speedInput");
        var luckEl = document.getElementById("luckInput");

        bulkEl.addEventListener("input", function () {
            var partial = {};
            partial[RS.AppState.activeBulkKey()] = bulkEl.value;
            RS.AppState.set(partial);
        });
        speedEl.addEventListener("input", function () {
            var partial = {};
            partial[RS.AppState.activeSpeedKey()] = speedEl.value;
            RS.AppState.set(partial);
        });
        luckEl.addEventListener("input", function () {
            var partial = {};
            partial[RS.AppState.activeLuckKey()] = luckEl.value;
            RS.AppState.set(partial);
        });

        PlayerInputs.sync();
    };

    // Refreshes the Bulk/Speed/Luck fields (and their labels) to whichever
    // track is currently active (normal/event/prism). Called on every state
    // change so switching opening runes swaps the displayed numbers and
    // labels automatically, without ever losing the other tracks' values.
    PlayerInputs.sync = function () {
        var bulkEl = document.getElementById("bulkInput");
        var speedEl = document.getElementById("speedInput");
        var luckEl = document.getElementById("luckInput");

        var bulkLabelEl = document.getElementById("bulkLabelText");
        var speedLabelEl = document.getElementById("speedLabelText");
        var luckLabelEl = document.getElementById("luckLabelText");

        var state = RS.AppState.get();
        var category = RS.AppState.currentRuneCategory();
        var labels = LABELS[category];

        // Only touch .value if it actually needs to change, so we don't
        // fight the caret position while the player is mid-edit in the
        // still-active field.
        setIfChanged(bulkEl, state[RS.AppState.activeBulkKey()]);
        setIfChanged(speedEl, state[RS.AppState.activeSpeedKey()]);
        setIfChanged(luckEl, state[RS.AppState.activeLuckKey()]);

        setLabel(bulkLabelEl, labels.bulk, category !== "normal");
        setLabel(speedLabelEl, labels.speed, category !== "normal");
        setLabel(luckLabelEl, labels.luck, category !== "normal");

        PlayerInputs.updateRateDisplay();
    };

    function setIfChanged(el, value) {
        if (el.value !== value) el.value = value;
    }

    function setLabel(el, text, isVariableStyle) {
        if (!el) return;
        el.textContent = text;
        el.classList.toggle("stat-key", isVariableStyle);
    }

    PlayerInputs.updateRateDisplay = function () {
        var bulk = RS.AppState.bulkNumber();
        var speed = RS.AppState.speedNumber();
        var openingsPerSec = RS.Time.openingsPerSecond(speed);
        var runesPerSec = RS.Time.runesPerSecond(bulk, speed);

        var el = document.getElementById("rateDisplay");
        el.innerHTML =
            '<div class="row"><span>Openings / sec</span><span>' + RS.Numbers.format(openingsPerSec) + '</span></div>' +
            '<div class="row"><span>Runes / sec</span><span>' + RS.Numbers.format(runesPerSec) + '</span></div>';
    };

    RS.PlayerInputs = PlayerInputs;
})();
