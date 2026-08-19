'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRS, makeDrop } = require('./support/loadRS.js');

const RS = loadRS();

test('pity threshold is 2x the effective (post-luck) denominator', () => {
    const drop = makeDrop({ baseChance: '1000', type: 'Basic', cap: null });
    assert.equal(RS.Pity.threshold(drop, 1), 2000);
    assert.equal(RS.Pity.threshold(drop, 10), 200);
});

test('pity threshold respects luck caps (uses the clamped denominator)', () => {
    const drop = makeDrop({ baseChance: '1000000', type: 'Basic', cap: '10' });
    // effective denom clamped to 10 -> threshold = 20, not 2 * 1,000,000.
    assert.equal(RS.Pity.threshold(drop, 1000000), 20);
});

test('pity threshold never goes below 1', () => {
    const drop = makeDrop({ baseChance: '1', type: 'Basic', cap: null });
    assert.equal(RS.Pity.threshold(drop, 1000000000), 1);
});

test('pity threshold is a rounded integer, not fractional', () => {
    const drop = makeDrop({ baseChance: '333', type: 'Basic', cap: null });
    const threshold = RS.Pity.threshold(drop, 1);
    assert.equal(threshold, Math.round(threshold));
    assert.equal(threshold, 666);
});
