/*
 * config.js — global constants and configurable settings.
 */
(function () {
    window.RS = window.RS || {};

    RS.Config = {
        // Base 1-in-100,000 chance for ANY successful drop to clone into 2.
        CLONE_CHANCE: 1 / 100000,

        // Pity: after (PITY_MULTIPLIER * effectiveDenominator) consecutive
        // misses on a given rune, the next opening is a guaranteed drop.
        PITY_MULTIPLIER: 2,

        // Player input defaults.
        DEFAULT_BULK: "1",
        DEFAULT_SPEED: "0.05",    // seconds per opening action
        DEFAULT_LUCK: "1",

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
