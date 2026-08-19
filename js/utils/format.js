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
