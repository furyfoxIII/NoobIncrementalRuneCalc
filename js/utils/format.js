/*
 * format.js — general formatting helpers (time, percentages, text).
 */
(function () {
    window.RS = window.RS || {};

    var Format = {};

    // Formats a duration in seconds into a human-readable string, e.g.
    // "3d 4h 12m 5s" or "2.35 years" for very large spans.
    Format.duration = function (seconds) {
        seconds = Number(seconds);
        if (!isFinite(seconds)) return "∞";
        if (isNaN(seconds)) return "—";
        if (seconds < 0) seconds = 0;

        var UNITS = [
            { label: "year", secs: 31557600 },
            { label: "day", secs: 86400 },
            { label: "hour", secs: 3600 },
            { label: "minute", secs: 60 },
            { label: "second", secs: 1 }
        ];

        // Extremely large spans -> express in years using suffix notation.
        var years = seconds / UNITS[0].secs;
        if (years >= 1e6) {
            return RS.Numbers.format(years, 3) + " years";
        }

        if (seconds < 1) {
            return (seconds * 1000).toFixed(1) + " ms";
        }

        var parts = [];
        var remaining = Math.floor(seconds);
        for (var i = 0; i < UNITS.length; i++) {
            var u = UNITS[i];
            var count = Math.floor(remaining / u.secs);
            if (count > 0) {
                parts.push(count + u.label.charAt(0));
                remaining -= count * u.secs;
            }
            if (parts.length >= 4) break;
        }
        if (parts.length === 0) return remaining.toFixed(2) + "s";
        return parts.join(" ");
    };

    // Parses a free-typed duration string into a number of seconds, e.g.
    // "2h50min", "3d 10h", "1day 1hour 1minute", "90s", "1.5h" all work.
    // Understands single-letter shorthand (d/h/m/s), abbreviations
    // (min, sec, hr), and full words (day(s), hour(s), minute(s),
    // second(s)) in any combination/order, with or without spaces.
    // A bare number with no unit is treated as seconds. Returns NaN for
    // strings it can't make sense of (empty input, no recognizable unit).
    var DURATION_UNIT_SECONDS = {
        y: 31557600, yr: 31557600, yrs: 31557600, year: 31557600, years: 31557600,
        d: 86400, day: 86400, days: 86400,
        h: 3600, hr: 3600, hrs: 3600, hour: 3600, hours: 3600,
        m: 60, min: 60, mins: 60, minute: 60, minutes: 60,
        s: 1, sec: 1, secs: 1, second: 1, seconds: 1
    };

    Format.parseDuration = function (str) {
        if (typeof str !== "string") return NaN;
        var s = str.trim().toLowerCase();
        if (s === "") return NaN;

        // Bare number (no letters at all) -> treat as plain seconds.
        if (/^[\d.]+$/.test(s)) {
            var n = parseFloat(s);
            return isNaN(n) ? NaN : n;
        }

        var re = /(\d+(?:\.\d+)?)\s*([a-z]+)/g;
        var match;
        var total = 0;
        var matchedAny = false;

        while ((match = re.exec(s)) !== null) {
            var unitSeconds = DURATION_UNIT_SECONDS[match[2]];
            if (unitSeconds === undefined) continue; // unrecognized unit token -> skip it
            total += parseFloat(match[1]) * unitSeconds;
            matchedAny = true;
        }

        if (!matchedAny) return NaN;
        return total;
    };

    Format.percent = function (fraction, decimals) {
        if (decimals === undefined) decimals = 4;
        if (!isFinite(fraction)) return "—";
        return (fraction * 100).toFixed(decimals) + "%";
    };

    Format.integer = function (n) {
        n = Math.round(Number(n));
        return n.toLocaleString("en-US");
    };

    RS.Format = Format;
})();
