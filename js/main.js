/*
 * main.js — initializes the app, connects UI components, and coordinates
 * updates when state changes.
 */
(function () {
    document.addEventListener("DOMContentLoaded", function () {
        RS.Tabs.init();
        RS.RealmSelector.init();
        RS.OpeningRuneSelector.init();
        RS.PlayerInputs.init();
        RS.DropList.render();
        RS.PredictionPanel.init();
        RS.EconomyPanel.init();
        RS.OpeningInfoPanel.showPlaceholder();

        // Re-render everything whenever state changes (realm, rune, bulk,
        // speed, luck, ...). Keeps every panel in sync without manual wiring.
        RS.AppState.onChange(function () {
            RS.RealmSelector.sync();
            RS.OpeningRuneSelector.rebuild();
            RS.PlayerInputs.sync();
            RS.DropList.render();
            RS.EconomyPanel.updateLabel();
        });
    });
})();
