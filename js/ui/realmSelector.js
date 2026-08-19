/*
 * realmSelector.js — populate and manage the Realm <select>.
 */
(function () {
    window.RS = window.RS || {};

    var RealmSelector = {};

    RealmSelector.init = function () {
        var el = document.getElementById("realmSelector");
        el.innerHTML = "";
        RS.RuneDatabase.forEach(function (realm, i) {
            var opt = document.createElement("option");
            opt.value = i;
            opt.textContent = realm.name;
            el.appendChild(opt);
        });

        el.value = RS.AppState.get().realmIndex;

        el.addEventListener("change", function () {
            RS.AppState.set({ realmIndex: Number(el.value), openingRuneIndex: 0 });
        });
    };

    RealmSelector.sync = function () {
        document.getElementById("realmSelector").value = RS.AppState.get().realmIndex;
    };

    RS.RealmSelector = RealmSelector;
})();
