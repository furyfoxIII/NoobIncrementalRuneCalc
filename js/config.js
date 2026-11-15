/*
 * config.js — global constants and configurable settings.
 */
(function () {
    window.RS = window.RS || {};

    RS.Config = {
        // Clones are guaranteed: every successful drop also drops a clone, so
        // each success gives 2 copies. (Set to 1 for "no clones".) Must be a
        // whole number; see engine/clones.js.
        COPIES_PER_SUCCESS: 2,

        // Pity: after (PITY_MULTIPLIER * effectiveDenominator) consecutive
        // misses on a given rune, the next opening is a guaranteed drop.
        PITY_MULTIPLIER: 2,

        // Player input defaults.
        DEFAULT_BULK: "1",
        DEFAULT_SPEED: "0.05",    // seconds per opening action
        DEFAULT_LUCK: "1",

        // Fastest Speed (seconds per opening action) the app will accept.
        // Smaller inputs are clamped up to this, both when read from the
        // Speed field (appState.js) and inside the engine (time.js), so
        // the two can never disagree.
        MIN_SPEED_SECONDS: 0.001,

        // Number formatting.
        DEFAULT_DECIMALS: 3,

        // ---- Prism tab defaults ----
        // Prism currency: gained in bursts (DEFAULT_PRISM_PER_CYCLE) every
        // DEFAULT_PRISM_CYCLE_SECONDS, spent opening capsules one batch per
        // PRISM_INTERVAL_NORMAL seconds (or PRISM_INTERVAL_MINION_MASTER
        // with the Minion Master gamepass), up to PRISM_BULK_MAX capsules
        // per batch.
        DEFAULT_PRISM_PER_CYCLE: "1",
        DEFAULT_PRISM_CYCLE_SECONDS: "60",
        DEFAULT_PRISM_BULK: "1",
        DEFAULT_PRISM_COST_PER_CAPSULE: "1",
        DEFAULT_PRISM_STOCKPILE: "0",

        PRISM_BULK_MAX: 20,
        PRISM_INTERVAL_NORMAL: 1,
        PRISM_INTERVAL_MINION_MASTER: 0.9
    };
})();
