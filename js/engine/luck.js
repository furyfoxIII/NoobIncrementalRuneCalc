/*
 * luck.js — apply luck to drop odds while respecting caps, and share the
 * roll between the drops of a table.
 *
 * Rule (from spec): baseChance is a denominator (e.g. "1M" = 1-in-1,000,000).
 * Luck DIVIDES that denominator, making the drop more common, down to a
 * floor set by the rune's cap denominator. Example: baseChance 1M, cap 10,
 * luck 100000 -> 1M / 100000 = 10 = cap already reached; more luck does
 * nothing further.
 *
 * "Noobinial" type runes ignore luck entirely (and have no cap).
 *
 * A drop with no cap (the property is missing, null, or an empty / blank
 * string) is "uncapped": luck keeps dividing its denominator with no floor.
 */
(function () {
    window.RS = window.RS || {};

    var Luck = {};

    // The drop's cap denominator as a BigNumber, or null when it has none.
    // Missing, null, "" and whitespace-only all mean "no cap" -- they must
    // all behave identically (a blank string used to be parsed as a cap of
    // 0, which counted the drop as capped for pooling but never limited it).
    function capOf(drop) {
        var raw = drop.cap;
        if (raw === null || raw === undefined) return null;
        if (typeof raw === "string" && raw.trim() === "") return null;
        return RS.Numbers.parseBig(raw);
    }

    Luck.hasCap = function (drop) {
        return drop.type !== "Noobinial" && capOf(drop) !== null;
    };

    // Returns the effective denominator (a BigNumber) for a drop, given
    // the player's current Luck stat. This is the RAW odds: what the
    // drop's own luck and cap say, before the table's shared roll is
    // taken into account (see normalizedChance below).
    //
    // Only "Noobinial" type is luck-immune. "Basic" type is ALWAYS affected
    // by luck — having no cap just means no floor has been set yet (the
    // game hasn't published one), not that luck stops applying. In that
    // case luck keeps dividing the denominator with no clamp.
    Luck.effectiveDenominator = function (drop, luckValue) {
        var base = RS.Numbers.parseBig(drop.baseChance);

        if (drop.type === "Noobinial") {
            return base;
        }

        var effective = base.div(luckAtLeastOne(luckValue));

        var cap = capOf(drop);
        if (cap === null) return effective;

        return BigNumber.max(cap, effective);
    };

    // The player's luck as a BigNumber, floored at 1 (NaN/garbage -> 1).
    function luckAtLeastOne(luckValue) {
        var luck = BigNumber.from(luckValue);
        if (luck.isNaN()) return new BigNumber(1);
        return BigNumber.max(1, luck);
    }

    Luck.effectiveChance = function (drop, luckValue) {
        var denom = Luck.effectiveDenominator(drop, luckValue);
        return denom.gt(0) ? new BigNumber(1).div(denom) : new BigNumber(0);
    };

    // --- Shared roll ("contention") ---------------------------------------
    //
    // Every rune-open is ONE roll against the whole drop table. Luck pushes
    // Basic drops towards their caps (often 1/10 or so), and once enough of
    // them are that likely the table's raw chances add up to more than 100%.
    // The fixed-odds Noobinials then lose out: the game's developers say that
    // in Realm 3 and below, a rune luck of 1 gives ~1.5x more Noobinials than
    // high luck, caused by runes being pushed down to 1/10 odds, and that
    // runes without this are not affected (Realm 4+ no longer have it).
    //
    // Modeled by scaling the table back down to 100% when -- and only when --
    // its raw chances exceed it: each pooled drop's per-roll chance is
    //
    //     raw chance / max(1, sum of raw chances over the pooled drops)
    //
    // A table whose chances add up to 1 or less is left exactly at its
    // published odds. On the first Realm 1 rune this reproduces the
    // developers' number: Luck 1 gives ~1.5x the Noobinials of maximum
    // Luck. (The exact formula, as opposed to the effect's size and where it
    // applies, is a model rather than something the developers have stated.)
    //
    // EXCLUDED FROM THE POOL: Basic-type drops with no cap. A capped drop's
    // share is bounded (it can only climb to 1/cap), so scaling it against
    // its siblings is stable. An uncapped drop's raw chance has no ceiling;
    // as luck rises it would eventually dominate the very sum it is divided
    // by and be driven towards "guaranteed every roll" purely as an artifact
    // of dividing a fast-growing number by itself. These ultra-rare endgame
    // drops are treated as independent checks outside the pool.
    function isPooled(drop) {
        return drop.type === "Noobinial" || capOf(drop) !== null;
    }

    Luck.totalWeight = function (openingRune, luckValue) {
        return openingRune.drops.reduce(function (sum, d) {
            if (!isPooled(d)) return sum;
            return sum.plus(Luck.effectiveChance(d, luckValue));
        }, new BigNumber(0));
    };

    // Whether the shared roll is lowering this drop's odds right now: it is
    // in the pool and the pool's raw chances exceed 100%.
    Luck.isContended = function (drop, luckValue, openingRune) {
        if (!openingRune || !isPooled(drop)) return false;
        return Luck.totalWeight(openingRune, luckValue).gt(1);
    };

    // The per-roll chance the app uses for every prediction (name kept for
    // the many call sites in pity/variance/prediction). Equals the raw
    // effectiveChance unless the shared roll applies. Falls back to the raw
    // chance when no openingRune is supplied.
    Luck.normalizedChance = function (drop, luckValue, openingRune) {
        var raw = Luck.effectiveChance(drop, luckValue);
        if (!openingRune || !isPooled(drop)) return raw;

        var totalWeight = Luck.totalWeight(openingRune, luckValue);
        return totalWeight.gt(1) ? raw.div(totalWeight) : raw;
    };

    Luck.normalizedDenominator = function (drop, luckValue, openingRune) {
        var chance = Luck.normalizedChance(drop, luckValue, openingRune);
        return chance.gt(0) ? new BigNumber(1).div(chance) : new BigNumber(Infinity);
    };

    // Whether this drop's odds are currently capped (informational, for UI).
    Luck.isAtCap = function (drop, luckValue) {
        if (!Luck.hasCap(drop)) return false;
        var base = RS.Numbers.parseBig(drop.baseChance);
        return base.div(luckAtLeastOne(luckValue)).lte(capOf(drop));
    };

    RS.Luck = Luck;
})();
