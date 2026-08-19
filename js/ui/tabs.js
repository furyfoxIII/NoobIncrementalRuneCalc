/*
 * tabs.js — switch between Opening, Economy, and Statistics tabs.
 */
(function () {
    window.RS = window.RS || {};

    var Tabs = {};

    Tabs.init = function () {
        var buttons = document.querySelectorAll(".tab-btn");
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var target = btn.getAttribute("data-tab");
                Tabs.activate(target);
            });
        });
    };

    Tabs.activate = function (name) {
        document.querySelectorAll(".tab-btn").forEach(function (b) {
            b.classList.toggle("active", b.getAttribute("data-tab") === name);
        });
        document.querySelectorAll(".tab-panel").forEach(function (p) {
            p.classList.toggle("active", p.id === "tab-" + name);
        });
    };

    RS.Tabs = Tabs;
})();
