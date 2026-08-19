/*
 * runeColors.js — custom per-rune colors that override the generic
 * rarity-band gradient in rarityColor.js. Keyed by exact drop name.
 *
 * These are hand-matched to the actual in-game "Rune Content" screens
 * so the calculator's colors look the same as the real game, rather
 * than falling back to the generic common->secret gradient.
 *
 * A value can be either:
 *   - a plain hex string, for a solid color, or
 *   - an array of 2+ hex strings, for a top-to-bottom (vertical) gradient,
 *     rendered with a real background-clip:text gradient (transparent
 *     background outside the letters — no colored box behind the text).
 *
 * Realm 1 only for now — extend RS.RuneColors as more realms are matched.
 */
(function () {
    window.RS = window.RS || {};

    RS.RuneColors = {

        // ---- Basic ----
        "Rookie":         "#666666",
        "Learner":        "#1a8927",
        "Trained":        "#1a5989",
        "Skilled":        "#400f57",
        "Expert":         "#815913",
        "Master":         "#811313",
        "Grandmaster":    "#813a13",
        "Celestial":      "#5b215f",
        "Immortal":       "#215e57",
        "Shadow":         "#3a215e",
        "Phantom":        ["#700de7", "#b63e72"],
        "Atomic":         ["#3e72b6", "#55be67", "#a64da8"],
        "Chronos Core":   ["#ff6300", "#ffef00", "#3cfe13"],

        // ---- Super ----
        "Initiate":       "#ffe0f5",
        "Adept":          "#3dff5e",
        "Veteran":        "#ffb300",
        "Elite":          "#ff6300",
        "Champion":       "#ffd700",
        "Ascended":       "#00d8ff",
        "Transcendent":   "#ff7d93",
        "Universal":      "#ff2fef",
        "Omnipotent":     "#d400ff",
        "Eclipse":        "#7a00e0",
        "Void":           ["#57008f", "#c317ff"],
        "Primordial":     ["#7a3ad9", "#2e5fff", "#2ecc71"],
        "Oblivion Sigil": ["#ff5500", "#ffce73"],

        // ---- Advanced ----
        "Little":            "#ff6fff",
        "Lesser":            "#4c31d0",
        "Standard":          "#8e9cff",
        "Greater":           "#ff00c4",
        "Superior":          "#00d13b",
        "Prime":             "#5701ff",
        "Apex":              "#970000",
        "Ethereal":          ["#2e82ff", "#e343ff"],
        "Divine":            ["#f3ceff", "#eecfdf"],
        "Infinite":          ["#ff1f00", "#ffb000"],
        "Abyss":             ["#d011ff", "#d700f1"],
        "Enigma":            ["#d1c91f", "#09b1ff"],
        "Seraphim's Tear":   ["#ff36d0", "#ff8bff", "#ff36d0"],
        "Aetherion":         ["#6333ff", "#c92dff", "#6333ff"],

        // ---- Cosmic Prism ----
        "Luscent":       ["#009eff", "#8b94ff"],
        "Chroma":        ["#f3003d", "#1874ff"],
        "Fractal":       ["#e8a82b", "#6fcdf9"],
        "Refraction":    ["#f1040d", "#1b7491"],
        "Tessellation":  ["#ffc800", "#ffa372"],
        "Hyperlight":    ["#00b8ff", "#1a0aff"],
        "Prism God":     ["#026dff", "#83beff"],
        "Void Glass":    ["#ac00ff", "#e50fff", "#ac00ff"],
        "Godshard":      ["#facf9b", "#ff92ac", "#fbcb88"],
        "Ultimate Shard": ["#ff1eff", "#6666ff", "#ffa92b"],

        // ---- Hacker ----
        "Script":              "#22e600",
        "Protocol":            "#00a8ff",
        "Cypher":              "#00f8ff",
        "Expliot":             "#c34dff",
        "Kernel":              "#d600b3",
        "Root":                "#f45200",
        "Backdoor":            "#ffa000",
        "Rootkit":             ["#ffd700", "#ff8c00"],
        "Masterkey":           "#f653e8",
        "Stuxnet":             ["#e8ff9e", "#c400ff"],
        "Glitched":            ["#ff00ff", "#8000ff"],
        "Firewall":            ["#ff8c00", "#ff3b00"],
        "Connor Hacked It":    ["#e8e8f0", "#9a9aa8"],
        "Anti-Cheat":          ["#00f0ff", "#00a8a0"],
        "Unstoppable Virus":   ["#00ff44", "#006622"]
    };

})();
