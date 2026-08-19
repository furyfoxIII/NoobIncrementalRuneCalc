'use strict';

/*
 * loadRS.js — test harness that loads the project's plain <script>-style
 * engine files into a shared VM context, the same way index.html loads them
 * (globals attaching to `window`, in file order). This lets the unit tests
 * exercise the real production code (numbers.js, luck.js, pity.js,
 * variance.js, prediction.js, economy.js) with zero changes to those files
 * and no build step / bundler / npm dependency.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');

// Order matters — mirrors the <script> order in index.html.
const FILES = [
    'lib/bignumber.min.js',
    'js/config.js',
    'js/engine/numbers.js',
    'js/engine/time.js',
    'js/engine/luck.js',
    'js/engine/pity.js',
    'js/engine/variance.js',
    'js/engine/prediction.js',
    'js/engine/economy.js'
];

function loadRS() {
    const sandbox = {};
    sandbox.window = sandbox; // so `window.RS = window.RS || {}` works AND
                               // bare globals like BigNumber/RS resolve too
    sandbox.console = console;
    vm.createContext(sandbox);

    for (const relPath of FILES) {
        const fullPath = path.join(ROOT, relPath);
        const code = fs.readFileSync(fullPath, 'utf8');
        vm.runInContext(code, sandbox, { filename: fullPath });
    }

    return sandbox.RS;
}

// In-memory localStorage stand-in (appState.js only calls getItem/setItem).
function makeLocalStorageStub() {
    const store = new Map();
    return {
        getItem(key) { return store.has(key) ? store.get(key) : null; },
        setItem(key, value) { store.set(key, String(value)); },
        removeItem(key) { store.delete(key); },
        clear() { store.clear(); }
    };
}

// Like loadRS(), but also loads the real js/data/runes.js and
// js/state/appState.js (with a stubbed localStorage) -- for tests that
// need real realm/rune data and the state layer, e.g. AppState's
// normal/event/prism Bulk & Luck track switching.
const STATE_FILES = FILES.slice(0, 2) // bignumber.min.js, config.js
    .concat(['js/data/runes.js'])
    .concat(FILES.slice(2))           // numbers.js .. economy.js
    .concat(['js/state/appState.js']);

function loadRSWithState(localStorageStub) {
    const sandbox = {};
    sandbox.window = sandbox;
    sandbox.console = console;
    sandbox.localStorage = localStorageStub || makeLocalStorageStub();
    vm.createContext(sandbox);

    for (const relPath of STATE_FILES) {
        const fullPath = path.join(ROOT, relPath);
        const code = fs.readFileSync(fullPath, 'utf8');
        vm.runInContext(code, sandbox, { filename: fullPath });
    }

    return sandbox.RS;
}

// A small, deliberately simple synthetic drop table — decoupled from
// js/data/runes.js so tests stay stable even as game content changes.
function makeDrop(overrides) {
    return Object.assign({
        name: 'TestDrop',
        baseChance: '1000',
        type: 'Basic',
        cap: null
    }, overrides || {});
}

module.exports = { loadRS, loadRSWithState, makeDrop, makeLocalStorageStub, ROOT };
