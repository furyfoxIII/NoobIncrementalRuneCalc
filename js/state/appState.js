/*
 * appState.js — single source of truth for the application's current state.
 * UI modules read from and write to this object; engine modules stay
 * stateless and simply consume plain values passed in.
 *
 * Bulk / Speed / Luck persist across reloads via localStorage, so the
 * player doesn't have to retype them every visit.
 *
 * Event runes (realm "Events" — e.g. Football, Halloween; each event rune
 * has its own track, named after the rune) and Prism runes (identified by cost.currency === "Prism" —
 * currently Cosmic Prism and Sunstorm Prism) each level up on their own
 * Bulk/Speed/Luck track, separate from the normal one and from each other
 * — matching the game's own per-event tracks and
 * "p.bulk"/"p.speed"/"p.luck" (prism) naming. Which track is active
 * switches automatically based on which opening rune is selected.
 */
(function () {
    window.RS = window.RS || {};

    var PERSISTED_KEYS = [
        "bulk", "speed", "luck",
        "p.bulk", "p.speed", "p.luck",

        "activeSection",

        "prism.perCycle", "prism.cycleSeconds", "prism.minionMaster",
        "prism.bulk", "prism.costPerCapsule", "prism.stockpile",
        "prism.overTimeMode", "prism.timeframeText", "prism.targetAmount"
    ];
    var STORAGE_PREFIX = "runeSimulator.";

    // ---- Event tracks ----
    // Every opening rune in the "Events" realm gets its OWN
    // Bulk/Speed/Luck track, keyed by the rune's name
    // (e.g. "event.Football.bulk", "event.Halloween.speed").
    // Adding a new event rune to the Events realm in runes.js is enough:
    // its keys are created here automatically.
    // An event rune can set `track: "Halloween"` in runes.js to use a track
    // named differently from the rune itself; otherwise the rune's name is used.
    function trackName(rune) { return rune.track || rune.name; }
    function eventKey(track, stat) { return "event." + track + "." + stat; }

    (function registerEventKeys() {
        var db = RS.RuneDatabase || [];
        for (var i = 0; i < db.length; i++) {
            if (db[i].name !== "Events") continue;
            for (var j = 0; j < db[i].openingRunes.length; j++) {
                var n = trackName(db[i].openingRunes[j]);
                if (PERSISTED_KEYS.indexOf(eventKey(n, "bulk")) !== -1) continue;
                PERSISTED_KEYS.push(eventKey(n, "bulk"), eventKey(n, "speed"), eventKey(n, "luck"));
            }
        }
    })();

    function loadPersisted() {
        var saved = {};
        try {
            for (var i = 0; i < PERSISTED_KEYS.length; i++) {
                var key = PERSISTED_KEYS[i];
                var v = window.localStorage.getItem(STORAGE_PREFIX + key);
                if (v !== null) saved[key] = v;
            }
        } catch (e) { /* localStorage unavailable — just skip persistence */ }
        return saved;
    }

    function persist(partial) {
        try {
            for (var i = 0; i < PERSISTED_KEYS.length; i++) {
                var key = PERSISTED_KEYS[i];
                if (partial.hasOwnProperty(key)) {
                    window.localStorage.setItem(STORAGE_PREFIX + key, partial[key]);
                }
            }
        } catch (e) { /* localStorage unavailable — just skip persistence */ }
    }

    var DEFAULT_BULK = RS.Config ? RS.Config.DEFAULT_BULK : "1";
    var DEFAULT_SPEED = RS.Config ? RS.Config.DEFAULT_SPEED : "1";
    var DEFAULT_LUCK = RS.Config ? RS.Config.DEFAULT_LUCK : "1";

    var cfg = RS.Config || {};

    var defaults = {
        realmIndex: 0,
        openingRuneIndex: 0,

        bulk: DEFAULT_BULK,
        speed: DEFAULT_SPEED,
        luck: DEFAULT_LUCK,

        "p.bulk": DEFAULT_BULK,
        "p.speed": DEFAULT_SPEED,
        "p.luck": DEFAULT_LUCK,

        currency: "0",

        // "rune" | "prism" — which top-level section is shown.
        activeSection: "rune",

        "prism.perCycle": cfg.DEFAULT_PRISM_PER_CYCLE || "1",
        "prism.cycleSeconds": cfg.DEFAULT_PRISM_CYCLE_SECONDS || "60",
        "prism.minionMaster": "false",
        "prism.bulk": cfg.DEFAULT_PRISM_BULK || "1",
        "prism.costPerCapsule": cfg.DEFAULT_PRISM_COST_PER_CAPSULE || "1",
        "prism.stockpile": cfg.DEFAULT_PRISM_STOCKPILE || "0",

        // "forward" = enter a timeframe, see how much Prism you'd earn.
        // "reverse" = enter a Prism amount, see how long it takes to earn.
        "prism.overTimeMode": "forward",
        "prism.timeframeText": "1h",
        "prism.targetAmount": "0"
    };

    // Event defaults (one track per event rune).
    for (var di = 0; di < PERSISTED_KEYS.length; di++) {
        var k = PERSISTED_KEYS[di];
        if (k.indexOf("event.") !== 0) continue;
        var stat = k.slice(k.lastIndexOf(".") + 1);
        defaults[k] = stat === "bulk" ? DEFAULT_BULK : stat === "speed" ? DEFAULT_SPEED : DEFAULT_LUCK;
    }

    var saved = loadPersisted();

    // Migration: values saved under the old Football-only keys
    // ("f.bulk" etc.) move to the new Football track.
    try {
        ["bulk", "speed", "luck"].forEach(function (st) {
            var oldV = window.localStorage.getItem(STORAGE_PREFIX + "f." + st);
            var newKey = eventKey("Football", st);
            if (oldV !== null && saved[newKey] === undefined && defaults.hasOwnProperty(newKey)) {
                saved[newKey] = oldV;
                window.localStorage.setItem(STORAGE_PREFIX + newKey, oldV);
            }
        });
    } catch (e) { /* ignore */ }

    var state = Object.assign({}, defaults, saved);

    var listeners = [];

    var AppState = {};

    AppState.get = function () { return state; };

    AppState.set = function (partial) {
        Object.assign(state, partial);
        persist(partial);
        AppState.notify();
    };

    AppState.onChange = function (fn) { listeners.push(fn); };

    AppState.notify = function () {
        for (var i = 0; i < listeners.length; i++) listeners[i](state);
    };

    // Convenience getters resolving the currently selected realm/rune objects.
    AppState.currentRealm = function () {
        return RS.RuneDatabase[state.realmIndex] || RS.RuneDatabase[0];
    };

    AppState.currentOpeningRune = function () {
        var realm = AppState.currentRealm();
        return realm.openingRunes[state.openingRuneIndex] || realm.openingRunes[0];
    };

    // "normal" | "event" | "prism" — which Bulk/Speed/Luck track applies to
    // the currently selected opening rune.
    AppState.currentRuneCategory = function () {
        var rune = AppState.currentOpeningRune();
        if (rune && rune.cost && rune.cost.currency === "Prism") return "prism";

        var realm = AppState.currentRealm();
        if (realm && realm.name === "Events") return "event";

        return "normal";
    };

    // The state key currently backing each input, based on
    // AppState.currentRuneCategory().
    AppState.activeBulkKey = function () {
        var category = AppState.currentRuneCategory();
        if (category === "event") return eventKey(trackName(AppState.currentOpeningRune()), "bulk");
        if (category === "prism") return "p.bulk";
        return "bulk";
    };

    AppState.activeSpeedKey = function () {
        var category = AppState.currentRuneCategory();
        if (category === "event") return eventKey(trackName(AppState.currentOpeningRune()), "speed");
        if (category === "prism") return "p.speed";
        return "speed";
    };

    AppState.activeLuckKey = function () {
        var category = AppState.currentRuneCategory();
        if (category === "event") return eventKey(trackName(AppState.currentOpeningRune()), "luck");
        if (category === "prism") return "p.luck";
        return "luck";
    };

    // Bulk and Luck are BigNumbers (they can be astronomically large);
    // Speed is a plain number of seconds-per-opening (always small).
    AppState.bulkNumber = function () { return RS.Numbers.parseBig(state[AppState.activeBulkKey()]); };
    AppState.speedNumber = function () { return Math.max(0.001, RS.Numbers.parse(state[AppState.activeSpeedKey()])); };
    AppState.luckNumber = function () { return BigNumber.max(1, RS.Numbers.parseBig(state[AppState.activeLuckKey()])); };

    // "prism.minionMaster" is persisted as the string "true"/"false" (same
    // scheme as every other persisted field) rather than a real boolean.
    AppState.prismMinionMaster = function () { return state["prism.minionMaster"] === "true"; };

    // Name of the event track the current opening rune uses (e.g. "Football", "Halloween").
    AppState.currentTrackName = function () { return trackName(AppState.currentOpeningRune()); };

    RS.AppState = AppState;
})();
