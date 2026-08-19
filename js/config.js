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
        DEFAULT_DECIMALS: 3
    };
})();
