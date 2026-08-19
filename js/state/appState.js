/*
 * appState.js — single source of truth for the application's current state.
 * UI modules read from and write to this object; engine modules stay
 * stateless and simply consume plain values passed in.
 *
 * Bulk / Speed / Luck persist across reloads via localStorage, so the
 * player doesn't have to retype them every visit.
 *
 * Event runes (realm "Events" — currently just Football, but the game may
 * add more) and Prism runes (identified by cost.currency === "Prism" —
 * currently Cosmic Prism and Sunstorm Prism) each level up on their own
 * Bulk/Speed/Luck track, separate from the normal one and from each other
 * — matching the game's own "f.bulk"/"f.speed"/"f.luck" (event) and
 * "p.bulk"/"p.speed"/"p.luck" (prism) naming. Which track is active
 * switches automatically based on which opening rune is selected.
 */
(function () {
    window.RS = window.RS || {};

    var PERSISTED_KEYS = [
        "bulk", "speed", "luck",
        "f.bulk", "f.speed", "f.luck",
        "p.bulk", "p.speed", "p.luck"
    ];
    var STORAGE_PREFIX = "runeSimulator.";

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

    var defaults = {
        realmIndex: 0,
        openingRuneIndex: 0,

        bulk: DEFAULT_BULK,
        speed: DEFAULT_SPEED,
        luck: DEFAULT_LUCK,

        "f.bulk": DEFAULT_BULK,
        "f.speed": DEFAULT_SPEED,
        "f.luck": DEFAULT_LUCK,

        "p.bulk": DEFAULT_BULK,
        "p.speed": DEFAULT_SPEED,
        "p.luck": DEFAULT_LUCK,

        currency: "0"
    };

    var state = Object.assign({}, defaults, loadPersisted());

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
        if (category === "event") return "f.bulk";
        if (category === "prism") return "p.bulk";
        return "bulk";
    };

    AppState.activeSpeedKey = function () {
        var category = AppState.currentRuneCategory();
        if (category === "event") return "f.speed";
        if (category === "prism") return "p.speed";
        return "speed";
    };

    AppState.activeLuckKey = function () {
        var category = AppState.currentRuneCategory();
        if (category === "event") return "f.luck";
        if (category === "prism") return "p.luck";
        return "luck";
    };

    AppState.bulkNumber = function () { return RS.Numbers.parse(state[AppState.activeBulkKey()]); };
    AppState.speedNumber = function () { return Math.max(0.001, RS.Numbers.parse(state[AppState.activeSpeedKey()])); };
    AppState.luckNumber = function () { return Math.max(1, RS.Numbers.parse(state[AppState.activeLuckKey()])); };

    RS.AppState = AppState;
})();
