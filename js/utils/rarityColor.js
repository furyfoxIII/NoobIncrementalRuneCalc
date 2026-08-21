/*
 * rarityColor.js — assigns each drop rune a color based on its rarity
 * (using baseChance, NOT the luck-adjusted chance, so colors stay stable
 * as the player's Luck stat changes).
 *
 * We don't have per-rune custom art colors in the data, so this uses a
 * conventional rarity gradient (common -> white, through teal/blue/violet,
 * up to legendary orange/red and secret gold) based on log10(denominator).
 */
(function () {
    window.RS = window.RS || {};

    var BANDS = [
        { max: 1.5, color: "#eef1fb" },      // common — near white
        { max: 10, color: "#3fe0c5" },       // teal
        { max: 100, color: "#45c8ff" },      // cyan/blue
        { max: 1e4, color: "#7c9fff" },      // blue-violet
        { max: 1e7, color: "#b18bfc" },      // violet
        { max: 1e12, color: "#e17ae0" },     // magenta
        { max: 1e20, color: "#f5b94d" },     // orange/gold
        { max: 1e35, color: "#ff7a90" },     // rose/red
        { max: Infinity, color: "#ffd76a" }  // secret — gold
    ];

    var RarityColor = {};

    // Converts a "#rrggbb" hex color into an "r, g, b" triplet string so it
    // can be dropped into an rgba(...) text-shadow with its own alpha.
    function hexToRgbTriplet(hex) {
        var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!m) return "255, 255, 255";
        return parseInt(m[1], 16) + ", " + parseInt(m[2], 16) + ", " + parseInt(m[3], 16);
    }

    RarityColor.forDrop = function (drop) {
        var custom = RS.RuneColors && RS.RuneColors[drop.name];
        if (custom) {
            return Array.isArray(custom) ? custom[0] : custom;
        }

        var denom = RS.Numbers.parse(drop.baseChance);
        for (var i = 0; i < BANDS.length; i++) {
            if (denom <= BANDS[i].max) return BANDS[i].color;
        }
        return BANDS[BANDS.length - 1].color;
    };

    // Returns an inline CSS style string for a name element: solid color +
    // neon glow for plain colors, or a real transparent-background gradient
    // (background-clip:text) for runes with a top-to-bottom gradient.
    RarityColor.styleForDrop = function (drop) {
        var custom = RS.RuneColors && RS.RuneColors[drop.name];

        if (Array.isArray(custom)) {
            var stops = custom.join(", ");
            var glowRgb = hexToRgbTriplet(custom[0]);
            return "background-image: linear-gradient(to bottom, " + stops + ");" +
                   "background-color: transparent;" +
                   "-webkit-background-clip: text;" +
                   "background-clip: text;" +
                   "color: transparent;" +
                   "-webkit-text-fill-color: transparent;" +
                   "filter: drop-shadow(0 0 2px rgba(" + glowRgb + ", 0.7)) drop-shadow(0 0 5px rgba(" + glowRgb + ", 0.55)) drop-shadow(0 0 10px rgba(" + glowRgb + ", 0.35));" +
                   "text-shadow: none;";
        }

        var color = RarityColor.forDrop(drop);
        var rgb = hexToRgbTriplet(color);
        return "color: " + color + ";" +
               "text-shadow: 0 0 2px rgba(" + rgb + ", 0.75), 0 0 5px rgba(" + rgb + ", 0.6), 0 0 10px rgba(" + rgb + ", 0.35);";
    };

    RS.RarityColor = RarityColor;
})();
