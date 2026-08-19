'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRSWithState, makeLocalStorageStub } = require('./support/loadRS.js');

function selectRuneByName(RS, realmName, runeName) {
    const realmIndex = RS.RuneDatabase.findIndex((r) => r.name === realmName);
    const openingRuneIndex = RS.RuneDatabase[realmIndex].openingRunes.findIndex((o) => o.name === runeName);
    RS.AppState.set({ realmIndex, openingRuneIndex });
}

test('defaults to the normal bulk/speed/luck track', () => {
    const RS = loadRSWithState();
    assert.equal(RS.AppState.currentRuneCategory(), 'normal');
    assert.equal(RS.AppState.activeBulkKey(), 'bulk');
    assert.equal(RS.AppState.activeSpeedKey(), 'speed');
    assert.equal(RS.AppState.activeLuckKey(), 'luck');
});

test('selecting a Prism rune (cost.currency === "Prism") switches to the p. track', () => {
    const RS = loadRSWithState();
    selectRuneByName(RS, 'Realm 1', 'Cosmic Prism');
    assert.equal(RS.AppState.currentRuneCategory(), 'prism');
    assert.equal(RS.AppState.activeBulkKey(), 'p.bulk');
    assert.equal(RS.AppState.activeSpeedKey(), 'p.speed');
    assert.equal(RS.AppState.activeLuckKey(), 'p.luck');
});

test('the other Prism rune in the data also resolves to the prism track', () => {
    const RS = loadRSWithState();
    selectRuneByName(RS, 'Realm 3', 'Sunstorm Prism');
    assert.equal(RS.AppState.currentRuneCategory(), 'prism');
});

test('selecting an Events-realm rune switches to the f. track', () => {
    const RS = loadRSWithState();
    selectRuneByName(RS, 'Events', 'Football');
    assert.equal(RS.AppState.currentRuneCategory(), 'event');
    assert.equal(RS.AppState.activeBulkKey(), 'f.bulk');
    assert.equal(RS.AppState.activeSpeedKey(), 'f.speed');
    assert.equal(RS.AppState.activeLuckKey(), 'f.luck');
});

test('a normal opening rune (e.g. Hacker) stays on the normal track', () => {
    const RS = loadRSWithState();
    selectRuneByName(RS, 'Realm 1', 'Hacker');
    assert.equal(RS.AppState.currentRuneCategory(), 'normal');
});

test('bulkNumber()/speedNumber()/luckNumber() read from the active track', () => {
    const RS = loadRSWithState();

    RS.AppState.set({ bulk: '5', speed: '0.05', luck: '2' });
    RS.AppState.set({ 'p.bulk': '999', 'p.speed': '0.5', 'p.luck': '111' });

    selectRuneByName(RS, 'Realm 1', 'Cosmic Prism');
    assert.equal(RS.AppState.bulkNumber(), 999);
    assert.equal(RS.AppState.speedNumber(), 0.5);
    assert.equal(RS.AppState.luckNumber(), 111);

    selectRuneByName(RS, 'Realm 1', 'Hacker');
    assert.equal(RS.AppState.bulkNumber(), 5);
    assert.equal(RS.AppState.speedNumber(), 0.05);
    assert.equal(RS.AppState.luckNumber(), 2);
});

test('switching categories never clobbers the other tracks\' saved values', () => {
    const RS = loadRSWithState();

    selectRuneByName(RS, 'Realm 1', 'Hacker');
    RS.AppState.set({ bulk: '10', speed: '0.1', luck: '3' });

    selectRuneByName(RS, 'Events', 'Football');
    RS.AppState.set({ 'f.bulk': '20', 'f.speed': '0.2', 'f.luck': '4' });

    selectRuneByName(RS, 'Realm 1', 'Cosmic Prism');
    RS.AppState.set({ 'p.bulk': '30', 'p.speed': '0.3', 'p.luck': '5' });

    // Now hop back through each and confirm nothing bled into another track.
    selectRuneByName(RS, 'Realm 1', 'Hacker');
    assert.equal(RS.AppState.get().bulk, '10');
    assert.equal(RS.AppState.get().speed, '0.1');
    assert.equal(RS.AppState.get().luck, '3');

    selectRuneByName(RS, 'Events', 'Football');
    assert.equal(RS.AppState.get()['f.bulk'], '20');
    assert.equal(RS.AppState.get()['f.speed'], '0.2');
    assert.equal(RS.AppState.get()['f.luck'], '4');

    selectRuneByName(RS, 'Realm 1', 'Cosmic Prism');
    assert.equal(RS.AppState.get()['p.bulk'], '30');
    assert.equal(RS.AppState.get()['p.speed'], '0.3');
    assert.equal(RS.AppState.get()['p.luck'], '5');
});

test('Speed is also split per track, same as Bulk/Luck', () => {
    const RS = loadRSWithState();
    selectRuneByName(RS, 'Realm 1', 'Hacker');
    RS.AppState.set({ speed: '0.2' });

    selectRuneByName(RS, 'Realm 1', 'Cosmic Prism');
    // Prism speed should still be at its own default, unaffected by the
    // normal-track edit above.
    assert.notEqual(RS.AppState.get()['p.speed'], '0.2');
});

test('all nine tracked values persist independently across a reload (localStorage)', () => {
    const sharedStorage = makeLocalStorageStub();

    const RS1 = loadRSWithState(sharedStorage);
    RS1.AppState.set({
        bulk: '7', speed: '0.07', luck: '2',
        'f.bulk': '8', 'f.speed': '0.08', 'f.luck': '3',
        'p.bulk': '9', 'p.speed': '0.09', 'p.luck': '4'
    });

    // Simulate a page reload: fresh sandbox/module state, same underlying
    // localStorage.
    const RS2 = loadRSWithState(sharedStorage);
    const state = RS2.AppState.get();
    assert.equal(state.bulk, '7');
    assert.equal(state.speed, '0.07');
    assert.equal(state.luck, '2');
    assert.equal(state['f.bulk'], '8');
    assert.equal(state['f.speed'], '0.08');
    assert.equal(state['f.luck'], '3');
    assert.equal(state['p.bulk'], '9');
    assert.equal(state['p.speed'], '0.09');
    assert.equal(state['p.luck'], '4');
});
