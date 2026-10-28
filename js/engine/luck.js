/*
 * luck.js — apply luck to drop odds while respecting caps.
 *
 * Rule (from spec): baseChance is a denominator (e.g. "1M" = 1-in-1,000,000).
 * Luck DIVIDES that denominator, making the drop more common, down to a
 * floor set by the rune's cap denominator. Example: baseChance 1M, cap 10,
 * luck 100000 -> 1M / 100000 = 10 = cap already reached; more luck does
 * nothing further.
 *
 * "Noobinial" type runes ignore luck entirely (and have no cap).
 */
(function () {
    window.RS = window.RS || {};

    var Luck = {};

    // Returns the effective denominator (a BigNumber) for a drop, given
    // the player's current Luck stat.
    //
    // Only "Noobinial" type is luck-immune. "Basic" type is ALWAYS affected
    // by luck — cap:null just means no floor has been set yet (the game
    // hasn't published one), not that luck stops applying. In that case
    // luck keeps dividing the denominator with no clamp.
    Luck.effectiveDenominator = function (drop, luckValue) {
        var base = RS.Numbers.parseBig(drop.baseChance);

        if (drop.type === "Noobinial") {
            return base;
        }

        var effective = base.div(luckAtLeastOne(luckValue));

        var hasCap = drop.cap !== null && drop.cap !== undefined;
        if (!hasCap) return effective;

        var cap = RS.Numbers.parseBig(drop.cap);
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

    // --- Bulk contention -------------------------------------------------
    //
    // CONFIRMED (player-reported): "Noobinial" drops aren't affected by
    // luck directly, but raising luck still hurts them indirectly, because
    // every individual rune-open is a shared pool across the WHOLE drop
    // table for that Opening Rune. "Basic" type odds scale with luck (up to
    // their own cap), so as luck rises they claim a bigger share of every
    // roll, leaving less of the roll "left over" for the (fixed-odds)
    // Noobinial checks — even though the Noobinial drop's own raw chance
    // never changes. Lowering luck shrinks the Basic types' share and
    // frees more of the pool back up for Noobinials.
    //
    // Modeled as a normalized multinomial: each drop's real per-roll
    // chance is its raw chance divided by the sum of raw chances across
    // every drop in the table (order-independent, no double counting).
    // At luck values low enough that nothing is near its cap, raw chances
    // sum to ~1 by design and this normalization barely matters; it starts
    // to bite once Basic-type odds climb toward their caps and the table's
    // total exceeds 1.
    //
    // EXCLUDED FROM THE POOL: Basic-type drops with cap:null. A capped
    // drop's share of the pool is bounded (it can only climb to 1/cap), so
    // normalizing it against its siblings is stable. An uncapped drop's
    // raw chance has no ceiling at all — as luck rises it would eventually
    // dominate the sum it's being divided by, making its OWN normalized
    // chance climb toward "guaranteed every roll" purely as an artifact of
    // dividing a fast-growing number by itself, not because the drop is
    // actually that common. Since these are exactly the ultra-rare endgame
    // rewards where this matters most, treating them as independent
    // long-tail checks outside the shared pool (rather than a pool
    // participant with an artificial floor) avoids that runaway while
    // still letting capped/Noobinial siblings normalize against each other
    // normally.
    function isPooled(drop) {
        var hasCap = drop.cap !== null && drop.cap !== undefined;
        return drop.type === "Noobinial" || hasCap;
    }

    Luck.totalWeight = function (openingRune, luckValue) {
        return openingRune.drops.reduce(function (sum, d) {
            if (!isPooled(d)) return sum;
            return sum.plus(Luck.effectiveChance(d, luckValue));
        }, new BigNumber(0));
    };

    // The real, contention-adjusted per-roll chance for `drop`, given the
    // full sibling drop table it shares a bulk pool with. Falls back to
    // the plain (unnormalized) chance if no openingRune is supplied, so
    // existing call sites without it keep working. Uncapped drops are not
    // pool participants (see isPooled above) and so are never normalized —
    // they get their own raw chance, uncontended.
    Luck.normalizedChance = function (drop, luckValue, openingRune) {
        var raw = Luck.effectiveChance(drop, luckValue);
        if (!openingRune || !isPooled(drop)) return raw;

        var totalWeight = Luck.totalWeight(openingRune, luckValue);
        return totalWeight.gt(0) ? raw.div(totalWeight) : new BigNumber(0);
    };

    Luck.normalizedDenominator = function (drop, luckValue, openingRune) {
        var chance = Luck.normalizedChance(drop, luckValue, openingRune);
        return chance.gt(0) ? new BigNumber(1).div(chance) : new BigNumber(Infinity);
    };

    // Whether this drop's odds are currently capped (informational, for UI).
    Luck.isAtCap = function (drop, luckValue) {
        var hasCap = drop.type !== "Noobinial" && drop.cap !== null && drop.cap !== undefined;
        if (!hasCap) return false;
        var base = RS.Numbers.parseBig(drop.baseChance);
        var cap = RS.Numbers.parseBig(drop.cap);
        return base.div(luckAtLeastOne(luckValue)).lte(cap);
    };

    RS.Luck = Luck;
})();
