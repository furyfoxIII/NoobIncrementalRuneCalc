/*
 * openingInfoPanel.js — the black "Rune Info" square. Shows the key
 * Prediction figures (expected opens/copy, time, cost) plus a full
 * per-rune breakdown of what you'd expect to get along the way, for
 * however many individual opens the last Prediction required. Reuses
 * RS.Prediction.expectedCopiesFromTrials — the same math the Economy tab
 * uses — just driven by the Prediction's trial count instead of currency.
 *
 * Per-rune counts are floored to whole numbers — you can't have obtained
 * a fractional rune, so an expectation like 0.006 is shown as 0.
 */
(function () {
    window.RS = window.RS || {};

    var OpeningInfoPanel = {};

    OpeningInfoPanel.showPlaceholder = function () {
        var el = document.getElementById("openingInfoPanel");
        el.innerHTML = '<p class="opening-info-placeholder">Run a prediction to see a full opening breakdown here.</p>';
    };

    // predictionResult: the object returned by RS.Prediction.predictCopies
    OpeningInfoPanel.render = function (openingRune, predictionResult, luckValue) {
        var el = document.getElementById("openingInfoPanel");
        var totalTrials = predictionResult.expectedTotalTrials;

        var statsHtml =
            statRow("Expected opens / copy", RS.Numbers.format(predictionResult.expectedTrialsPerSuccess)) +
            statRow("Estimated time", RS.Format.duration(predictionResult.expectedSeconds));

        if (predictionResult.expectedCost !== undefined) {
            statsHtml += statRow("Estimated cost",
                RS.Numbers.format(predictionResult.expectedCost) + " " + predictionResult.currency);
        }

        if (predictionResult.percentiles && predictionResult.percentiles.length) {
            statsHtml += sectionLabel("Variance — by luck");
            statsHtml += predictionResult.percentiles.map(function (pt) {
                var value = RS.Format.duration(pt.seconds);
                if (pt.cost !== undefined) {
                    value += " · " + RS.Numbers.format(pt.cost) + " " + predictionResult.currency;
                }
                return statRow(percentileLabel(pt.p), value);
            }).join("");
        }

        var rows = openingRune.drops.map(function (drop) {
            var expected = RS.Prediction.expectedCopiesFromTrials(drop, luckValue, totalTrials, openingRune);
            var wholeCount = RS.Numbers.floorNear(expected);
            var nameStyle = RS.RarityColor.styleForDrop(drop);
            return '<div class="opening-info-row">' +
                '<span class="opening-info-count">x' + RS.Numbers.format(wholeCount) + '</span>' +
                '<span class="opening-info-name" style="' + nameStyle + '">' + drop.name + '</span>' +
                '</div>';
        }).join("");

        el.innerHTML =
            '<div class="opening-info-title">Rune Info</div>' +
            '<div class="opening-info-stats">' + statsHtml + '</div>' +
            '<div class="opening-info-list">' + rows + '</div>';
    };

    function statRow(label, value) {
        return '<div class="result-row"><span class="label">' + label + '</span><span class="value">' + value + '</span></div>';
    }

    function sectionLabel(text) {
        return '<div class="opening-info-section-label">' + text + '</div>';
    }

    // p=0.01 -> "fast rolls", p=0.5 -> the median, p=0.99 -> "slow rolls" —
    // this is the variance info a gacha player actually cares about: not
    // just the average, but the lucky-run and unlucky-run bookends.
    function percentileLabel(p) {
        if (p === 0.01) return "P1 (lucky)";
        if (p === 0.5) return "P50 (median)";
        if (p === 0.99) return "P99 (unlucky)";
        return "P" + Math.round(p * 100);
    }

    RS.OpeningInfoPanel = OpeningInfoPanel;
})();
