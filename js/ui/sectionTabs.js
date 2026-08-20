/*
 * sectionTabs.js — top-level switcher between the "Rune" and "Prism"
 * sections of the app (distinct from tabs.js, which switches between the
 * Opening/Economy sub-tabs inside the Rune section). The Opening/Economy
 * tab bar itself is only relevant while the Rune section is showing, so
 * it hides along with the rest of the Rune section when Prism is active.
 *
 * The active section persists across reloads via AppState, same as every
 * other durable setting.
 */
(function () {
    window.RS = window.RS || {};

    var SectionTabs = {};

    SectionTabs.init = function () {
        var buttons = document.querySelectorAll(".section-tab-btn");
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var target = btn.getAttribute("data-section");
                RS.AppState.set({ activeSection: target });
            });
        });

        SectionTabs.sync();
    };

    SectionTabs.sync = function () {
        var active = RS.AppState.get().activeSection || "rune";

        document.querySelectorAll(".section-tab-btn").forEach(function (b) {
            b.classList.toggle("active", b.getAttribute("data-section") === active);
        });
        document.querySelectorAll(".app-section").forEach(function (s) {
            s.classList.toggle("active", s.id === "section-" + active);
        });

        // The Opening/Economy sub-tab bar belongs to the Rune section only.
        var subTabs = document.getElementById("tabs");
        if (subTabs) subTabs.style.display = active === "rune" ? "" : "none";
    };

    RS.SectionTabs = SectionTabs;
})();
