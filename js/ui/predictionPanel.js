/*
 * predictionPanel.js — Prediction controls, on the Opening tab. Uses
 * closed-form math (see engine/prediction.js), so it works at any scale
 * without looping. Results are rendered into the black Rune Info panel
 * (see openingInfoPanel.js) rather than inline here.
 */
(function () {
    window.RS = window.RS || {};

    var PredictionPanel = {};

    PredictionPanel.init = function () {
        document.getElementById("predictBtn").addEventListener("click", PredictionPanel.runPrediction);
    };

    PredictionPanel.runPrediction = function () {
        var openingRune = RS.AppState.currentOpeningRune();
        var idx = Number(document.getElementById("predictRuneSelector").value) || 0;
        var drop = openingRune.drops[idx];
        var copies = RS.Numbers.parse(document.getElementById("predictCopiesInput").value) || 1;

        var result = RS.Prediction.predictCopies(drop, copies, {
            luckValue: RS.AppState.luckNumber(),
            bulk: RS.AppState.bulkNumber(),
            speedSeconds: RS.AppState.speedNumber(),
            openingRune: openingRune
        });

        RS.OpeningInfoPanel.render(openingRune, result, RS.AppState.luckNumber());
    };

    RS.PredictionPanel = PredictionPanel;
})();
