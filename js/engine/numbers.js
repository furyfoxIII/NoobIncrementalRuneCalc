/*
 * numbers.js — parsing & formatting of game numbers.
 *
 * Suffix system (short scale, matches js/data/runes.js):
 *   K, M, B, T, Qd, Qn, Sx, Sp, Oc, No, De, UDe, DDe, TDe, QdDe, QnDe,
 *   SxDe, SpDe, OcDe, NoDe, Vt, UVt, DVt, ... and onward.
 *
 * Tier t (t >= 1) represents 10^(3t). For t <= 10 there's a unique base
 * name (K..No). For t > 10, the name is built as ONES[r] + TENS[g], where
 * g = floor((t-11)/10) and r = (t-11) % 10 — this exactly reproduces names
 * like UDe (t=12), NoDe (t=20), Vt (t=21), UVt (t=22), etc.
 */
(function () {
    window.RS = window.RS || {};

    var BASE_NAMES = ["", "K", "M", "B", "T", "Qd", "Qn", "Sx", "Sp", "Oc", "No"]; // t = 1..10
    var ONES = ["", "U", "D", "T", "Qd", "Qn", "Sx", "Sp", "Oc", "No"];
    var TENS = ["De", "Vt", "Tg", "Qg", "Qqg", "Sxg", "Spg", "Og", "Ng", "Ct"]; // groups of ten tiers

    var MAX_TIER = 10 + TENS.length * 10; // beyond this, fall back to scientific notation

    // Named suffixes are only used up to 10DTg (DTg = tier 33 = 1e99, so
    // 10DTg = 1e100). At and beyond 1e100 we switch to plain "eXXX"
    // scientific notation instead of continuing the named ladder
    // (TTg = 1e102, QTg, ...) — extreme values are more readable as an
    // exponent than as an ever-longer chain of suffix syllables.
    var SUFFIX_EXPONENT_CUTOFF = 100;

    function tierSuffix(t) {
        if (t <= 0) return "";
        if (t <= 10) return BASE_NAMES[t];
        var g = Math.floor((t - 11) / 10);
        var r = (t - 11) % 10;
        if (g >= TENS.length) return null; // out of range -> caller uses scientific
        return ONES[r] + TENS[g];
    }

    // Build a reverse lookup: suffix string (lowercase) -> tier number.
    var SUFFIX_TO_TIER = {};
    for (var t = 1; t <= MAX_TIER; t++) {
        var s = tierSuffix(t);
        if (s) SUFFIX_TO_TIER[s.toLowerCase()] = t;
    }

    var Numbers = {};

    // ---- Parsing -----------------------------------------------------

    // Parses a game-formatted number string ("333K", "43.5Qd", "300NoDe",
    // "2.5UVt", "1.23e45", "500", null/undefined -> 0) into a plain number.
    Numbers.parse = function (str) {
        if (str === null || str === undefined) return 0;
        if (typeof str === "number") return str;
        var s = String(str).trim();
        if (s === "") return 0;

        // Scientific notation, e.g. "1.23e45" — JS parses this natively.
        if (/^-?[\d.]+e[+-]?\d+$/i.test(s)) {
            return Number(s);
        }

        var m = s.match(/^(-?[\d.,]+)\s*([A-Za-z]*)$/);
        if (!m) return Number(s.replace(/,/g, "")) || 0;

        var mantissa = Number(m[1].replace(/,/g, ""));
        var suffix = m[2];
        if (!suffix) return mantissa;

        var tier = SUFFIX_TO_TIER[suffix.toLowerCase()];
        if (tier === undefined) return mantissa; // unknown suffix, treat as plain
        return mantissa * Math.pow(10, tier * 3);
    };

    // Parses into a BigNumber instance.
    Numbers.parseBig = function (str) {
        return new BigNumber(Numbers.parse(str));
    };

    // ---- Formatting ----------------------------------------------------

    // Formats a plain number (or BigNumber) into game suffix notation.
    Numbers.format = function (value, decimals) {
        if (decimals === undefined) decimals = RS.Config.DEFAULT_DECIMALS;
        var n = value instanceof BigNumber ? value.toNumber() : Number(value);

        if (!isFinite(n)) return n > 0 ? "Infinity" : (n < 0 ? "-Infinity" : "NaN");
        if (isNaN(n)) return "NaN";

        var sign = n < 0 ? "-" : "";
        n = Math.abs(n);

        if (n === 0) return "0";
        if (n < 1000) {
            return sign + trimNumber(n, n < 10 ? decimals : Math.max(0, decimals - 1));
        }

        // At and beyond 1e100 (10DTg), skip the named-suffix ladder entirely
        // and use scientific "eXXX" notation. This also sidesteps the fact
        // that a plain-double BigNumber (see lib/bignumber.min.js) loses
        // precision and eventually overflows well past this point, so
        // exponent notation is the more honest representation anyway.
        var exponent = Math.floor(Math.log10(n));
        if (exponent >= SUFFIX_EXPONENT_CUTOFF) {
            return sign + formatExponential(n, decimals);
        }

        var t = Math.floor(Math.log10(n) / 3);
        var mantissa = n / Math.pow(10, t * 3);

        // Rounding edge case: mantissa rounds up to 1000 -> bump tier.
        if (mantissa >= 1000) { mantissa /= 1000; t += 1; }

        // Bumping the tier above can push the exponent past the cutoff
        // (e.g. 999.999...DTg rounding up to 1000DTg = 1e102) — recheck.
        if (t * 3 >= SUFFIX_EXPONENT_CUTOFF) {
            return sign + formatExponential(n, decimals);
        }

        if (t > MAX_TIER) {
            return sign + formatExponential(n, decimals);
        }

        var suffix = tierSuffix(t);
        if (suffix === null) {
            return sign + formatExponential(n, decimals);
        }
        return sign + trimNumber(mantissa, decimals) + suffix;
    };

    // Formats n in "eXXX" style: a trimmed mantissa followed by a bare "e"
    // and the exponent (no "+" sign, matching the DTg/TTg-style examples).
    function formatExponential(n, decimals) {
        var exp = Math.floor(Math.log10(n));
        var mantissa = n / Math.pow(10, exp);
        // Rounding edge case: mantissa rounds up to 10 -> bump exponent.
        if (mantissa >= 10) { mantissa /= 10; exp += 1; }
        var trimmed = trimNumber(mantissa, decimals);
        // Edge case: decimal rounding itself pushes the trimmed string up
        // to "10" (e.g. 9.9996 at 3 decimals) -> bump exponent again.
        if (Number(trimmed) >= 10) {
            trimmed = trimNumber(mantissa / 10, decimals);
            exp += 1;
        }
        return trimmed + "e" + exp;
    }

    // Formats as "1 in X" style odds string from an effective denominator.
    Numbers.formatOdds = function (denominator, decimals) {
        return "1 / " + Numbers.format(denominator, decimals);
    };

    // Floors a value that is mathematically expected to land on (or very
    // near) a whole number, tolerating tiny floating-point round-trip
    // noise. Plain Math.floor is dangerous here: Prediction.predictCopies
    // and Prediction.expectedCopiesFromTrials are meant to be exact
    // inverses of each other (predict N copies, read N back off the trial
    // count), but the division-then-multiplication round trip can land a
    // hair under the true integer (e.g. 229.99999999999997 instead of
    // 230). A plain floor turns that into 229. This nudges by a
    // magnitude-scaled epsilon before flooring so genuine noise gets
    // absorbed while true fractional values (e.g. 5.4) are unaffected.
    Numbers.floorNear = function (n) {
        n = Number(n);
        if (!isFinite(n)) return n;
        // Relative term only needs to clear a handful of doubles' worth of
        // rounding error (~1e-15 relative per operation), so 1e-12 leaves
        // ample margin without meaningfully perturbing genuinely large
        // integers. The 1e-9 floor covers small values where a purely
        // relative epsilon would underflow to nothing.
        var eps = Math.max(1e-9, Math.abs(n) * 1e-12);
        return Math.floor(n + eps);
    };

    function trimNumber(n, decimals) {
        var fixed = n.toFixed(decimals);
        // Strip trailing zeros / trailing dot.
        if (fixed.indexOf(".") !== -1) {
            fixed = fixed.replace(/0+$/, "").replace(/\.$/, "");
        }
        return fixed;
    }

    RS.Numbers = Numbers;
})();
