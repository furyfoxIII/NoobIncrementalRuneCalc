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

        // ---- Realm 1: Basic ----
        "Rookie":         "#858585",
        "Learner":        "#31d845",
        "Trained":        "#3190d8",
        "Skilled":        "#a42edb",
        "Expert":         "#e09d2a",
        "Master":         "#e02a2a",
        "Grandmaster":    "#e06a2a",
        "Celestial":      "#bf41c8",
        "Immortal":       "#41c8b8",
        "Shadow":         "#7841c8",
        "Phantom":        ["#7b17f2", "#c8417c"],
        "Atomic":         ["#417cc8", "#49ca5f", "#c541c8"],
        "Chronos Core":   ["#ff690a", "#fff00a", "#3cfe13"],

        // ---- Realm 1: Super ----
        "Initiate":       "#3acf5f",
        "Adept":          "#cfae3a",
        "Veteran":        "#a73acf",
        "Elite":          "#cf493a",
        "Champion":       "#9bcf3a",
        "Ascended":       "#3acccf",
        "Transcendent":   "#cf443a",
        "Universal":      ["#ef1a8b", "#c035d4"],
        "Omnipotent":     ["#cbef1a", "#b2c841"],
        "Eclipse":        ["#cb1aef", "#e12873"],
        "Void":           ["#d50aff", "#ad31d8"],
        "Primordial":     ["#a8a8a8", "#636ad4", "#41c89b", "#41c86a", "#4ac841"],
        "Oblivion Sigil": ["#ffb74b", "#ff470a", "#ffb74b", "#ff470a", "#ffb74b"],

        // ---- Realm 1: Advanced ----
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

        // ---- Realm 1: Cosmic Prism ----
        "Luscent":        ["#009eff", "#8b94ff"],
        "Chroma":         ["#f3003d", "#1874ff"],
        "Fractal":        ["#e8a82b", "#6fcdf9"],
        "Refraction":     ["#f1040d", "#1b7491"],
        "Tessellation":   ["#ffc800", "#ffa372"],
        "Hyperlight":     ["#00b8ff", "#1a0aff"],
        "Prism God":      ["#026dff", "#83beff"],
        "Void Glass":     ["#ac00ff", "#e50fff", "#ac00ff"],
        "Godshard":       ["#facf9b", "#ff92ac", "#fbcb88"],
        "Ultimate Shard": ["#ff1eff", "#6666ff", "#ffa92b"],

        // ---- Realm 1: Hacker ----
        "Script":              "#e0dfd0",
        "Protocol":            "#00ff00",
        "Cypher":              "#00c0f5",
        "Expliot":             "#2bfffa",
        "Kernel":              "#f252ff",
        "Root":                ["#a9009a", "#ff0092"],
        "Backdoor":            "#f75e00",
        "Rootkit":             ["#ff2a00", "#ffdc00"],
        "Masterkey":           ["#00ffb0", "#00ffef"],
        "Stuxnet":             ["#8a92cd", "#efed99", "#ff5ff5", "#fce362", "#b3f533"],
        "Glitched":            ["#ff00ff", "#8000ff"],
        "Firewall":            ["#ff8c00", "#ff3b00"],
        "Connor Hacked It":    ["#e8e8f0", "#9a9aa8"],
        "Anti-Cheat":          ["#00f0ff", "#00a8a0"],
        "Unstoppable Virus":   ["#00ff44", "#006622"],

        // ---- Realm 2: Snowy ----
        "Snow":           "#ffefff",
        "Frost":          "#41ffff",
        "Ice":            "#00d6ff",
        "Hail":           ["#0fe900", "#9cda5f"],
        "Glacier":        ["#00caff", "#a869ff"],
        "Blizzard":       ["#ffb200", "#ffc863"],
        "Tundra":         ["#ff8000", "#f31a00"],
        "Artic":          ["#009cff", "#004cff", "#009cff"],
        "Permafrost":     ["#0e71ff", "#5137ff", "#0e71ff"],
        "Whiteout":       ["#ffa2f3", "#ff83eb", "#ffa2f3"],
        "Icebound":       ["#00e2ff", "#003bff"],
        "Everfrost":      ["#00e7ff", "#00b2c8", "#00e7ff"],

        // ---- Realm 2: Deepcore ----
        "Dust":           "#d5c6ab",
        "Pebble":         "#b39dc2",
        "Hollow":         "#fdf000",
        "Echo":           "#00f1ff",
        "Stalagmite":     ["#4082ff", "#35bafd"],
        "Cavern":         "#f05300",
        "Crystalborn":    ["#faa7ef", "#ff69f8"],
        "Earthshaker":    ["#8300cf", "#c000ff"],
        "Golemheart":     "#ea00ff",
        "Stone Titan":    ["#b1a8ff", "#ffffff", "#8d87ff"],
        "Cave Guardian":  ["#ffff00", "#ffbf00", "#ff8400", "#ff3800", "#ffa400", "#ffff00"],
        "Deep Spirit":    ["#ff00ff", "#d500ff", "#ff00ff", "#ff008f"],

        // ---- Realm 2: Shard ----
        "Air Shard":        "#dadeef",
        "Water Shard":      "#00b5ff",
        "Earth Shard":      "#b24500",
        "Fire Shard":       "#ff0000",
        "Ice Shard":        "#54f7ff",
        "Poison Shard":     "#00f200",
        "Metal Shard":      ["#6d88e7", "#91a9fc"],
        "Light Shard":      "#f1ee03",
        "Shadow Shard":     ["#ae00ff", "#8800ff"],
        "Galactic Shard":   ["#ef00ff", "#df00ff", "#f300ff"],
        "Elemental Shard":  ["#ff0002", "#ff0002", "#7beae6", "#00b329"],
        "Dragon Shard":     ["#ff5800", "#fdb400", "#ff5800", "#fdb400", "#ff5800", "#fdb400"],

        // ---- Realm 3: Dunes ----
        "Marrow":            "#bf73c9",
        "Femur":             "#b54f4f",
        "Skull":             "#6f4f39",
        "Dune":              "#c8621e",
        "Oasis":             "#9a2d09",
        "Mirage":            ["#e75a0d", "#f77d5f"],
        "Sunspire":          ["#c51616", "#8f1414"],
        "Eternal Sand":      ["#e7ad0d", "#ffbb00", "#e7ad0d"],
        "Sphinx":            ["#ff5400", "#ffb200", "#ff5400", "#ffb200", "#ff5400"],
        "Anubis":            ["#9562f3", "#4f00dc", "#9562f3"],
        "Ancient Fragment":  ["#dc5600", "#f0b247", "#dc5600"],

        // ---- Realm 3: Sunfire ----
        "Ashen":             "#6f4ede",
        "Parched":           "#fbd534",
        "Cactus":            "#00ceaa",
        "Scorch":            "#d8acc0",
        "Spark":             "#ffba00",
        "Flare":             "#d90000",
        "Desert Jewel":      ["#ded5b0", "#f4cd00", "#f4cd00", "#ded5b0"],
        "Solar Titan":       ["#d74d00", "#ff8600", "#ff8600", "#d74d00"],
        "Immortal Sun":      ["#ff1b00", "#ff0000", "#ff0000", "#ff1b00"],
        "Pharaoh":           ["#f7d000", "#ff2800"],
        "Horus":             ["#ff00ff", "#5300a9", "#ff00ff", "#5300a9"],
        "Secrets Of Egypt":  ["#744900", "#efc500", "#744900"],

        // ---- Realm 3: Sunstorm Prism ----
        "Cinderfall":   "#cd3500",
        "Shadowflare":  ["#8500ff", "#9b05ff"],
        "Dawnshard":    "#00e5ff",
        "Lumina":       "#ff6d00",
        "Pyrestone":    "#ff0300",
        "Helios":       ["#f8de6d", "#fbe000"],
        "Starforge":    "#ff00ff",
        "Celestia":     "#0000ff",
        "Eternis":      "#ff0000",
        "Omnira":       ["#3c3300", "#3c3300", "#f4d900", "#f4d900", "#3c3300", "#3c3300"],

        // ---- Realm 4: Starlight ----
        "Moonlight":            ["#7f64cf", "#9c7fe6"],
        "Sunlight":             ["#ffd100", "#ffe600"],
        "Invasion":             "#ff0000",
        "Alien":                "#00f000",
        "Universe":             ["#f818ff", "#ff00ff"],
        "Gravity":              ["#c8aafe", "#997ee4"],
        "Dimensional":          ["#f200ff", "#cc00ff"],
        "Meteor":               ["#ff2400", "#ff5b00", "#ff8900"],
        "Nebula":               ["#1300ff", "#5200ff", "#8700ff"],
        "Supernova":            ["#9100ff", "#ea00ff", "#9100ff", "#ea00ff"],
        "Galactic Chaos":       ["#0000d7", "#0000d7", "#6300ba", "#0000d7", "#0000d7"], 
        "Chaotic Destruction":  ["#b60000", "#b60000", "#ff0000", "#ff0000", "#ff0000", "#b60000", "#b60000"],

        // ---- Realm 4: Cosma ----
        "Asteroid":            "#6377ca",
        "Comet":               "#55f0ff",
        "Satellite":           "#1bcaff",
        "Orbit":               ["#ff09ff", "#ff7cff"],
        "Cluster":             "#f700d5",
        "Quasar":              ["#ffc400", "#ff7000"],
        "Pulsar":              ["#0097ff", "#00e2ff"],
        "Black Hole":          ["#4400a3", "#4400a3", "#290070", "#4400a3", "#4400a3"],
        "Magnetar":            ["#cae5ad", "#00d3c8", "#cae5ad", "#00d3c8"],
        "Event Horizon":       ["#ffe2ae", "#ffe2ae", "#d1e5ff", "#ffe2ae", "#ffe2ae"],
        "Elemental Creation":  ["#c5ed00", "#c5ed00", "#ffe700", "#c5ed00", "#c5ed00"],

        // // ---- Realm 4: Light ----
        "White":              "#efdce6",
        "Divine Light":       ["#f6e5e3", "#f2e5c7"],
        "Daylight":           "#ffef00",
        "Elemental Of Light": ["#ffe600", "#ffcc00"],
        "Protected":          "#00f3ff",
        "Creation":           ["#00e3ff", "#00e3ff", "#00c8ff", "#00e3ff", "#00e3ff"],
        "Angelic Goodness":   ["#f9e567", "#f9e567", "#f8e5e2", "#f9e567", "#f9e567"],
        "Absolute Divinity":  ["#ffc185", "#ffc185", "#fce27d", "#ffc185", "#ffc185"],
        "Light Genesis":      ["#ff6600", "#ffeb00", "#ff6600", "#ffeb00", "#ff6600"],

        // ---- Realm 4: Dark ----
        "Black":               ["#181618", "#464145"],
        "Infinite Darkness":  ["#08080a", "#403b3e"],
        "Midnight":           ["#260057", "#52009f"],
        "Dark Elemental":     ["#390060", "#1a0f1f", "#1a0f1f", "#1a0f1f", "#390060"],
        "Doomed":             ["#131214", "#131214", "#131214", "#585256", "#131214", "#131214", "#131214"],
        "Destruction":        ["#d00000", "#d00000", "#ff0000", "#d00000", "#d00000"],
        "Demonic Evil":       ["#cf0000", "#cf0000", "#880000", "#cf0000", "#cf0000"],
        "Absolute Darkness":  ["#2d005f", "#2d005f", "#7000be", "#2d005f", "#2d005f"],
        "Dark Genesis":       ["#3c00cd", "#b200c6", "#3c00cd", "#b200c6", "#3c00cd", "#b200c6"],

        // ---- Event: Football ----
        "Scuff":         "#debdd4",
        "Fade":          "#cd752d",
        "Stitch":        "#ff465d",
        "Kickoff":       "#00fb00",
        "Dribble":       "#00b1ff",
        "Tackle":        "#ff0000",
        "Corner":        "#ff8400",
        "Volley":        "#ff00ff",
        "Header":        "#f9db00",
        "Finale":        ["#f09c26", "#f65900"],
        "Victory":       ["#4ea200", "#f98e00", "#f81a1d", "#f81a1d"],
        "Iconic":        ["#0022a6", "#0084fd", "#0022a6"]
    };

})();
