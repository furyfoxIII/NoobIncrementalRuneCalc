'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRS, makeDrop } = require('./support/loadRS.js');

const RS = loadRS();

test('luck divides the denominator for Basic drops', () => {
    const drop = makeDrop({ baseChance: '1000000', type: 'Basic', cap: null });
    assert.equal(RS.Luck.effectiveDenominator(drop, 1), 1000000);
    assert.equal(RS.Luck.effectiveDenominator(drop, 100), 10000);
    assert.equal(RS.Luck.effectiveDenominator(drop, 1000000), 1);
});

test('luck is clamped at the cap (README example: 1M base, cap 10)', () => {
    const drop = makeDrop({ baseChance: '1000000', type: 'Basic', cap: '10' });
    // 1,000,000 / 100,000 = 10 -> hits the cap exactly.
    assert.equal(RS.Luck.effectiveDenominator(drop, 100000), 10);
    // Beyond that, more luck does nothing further.
    assert.equal(RS.Luck.effectiveDenominator(drop, 10000000), 10);
    // Below the cap threshold, luck applies normally.
    assert.equal(RS.Luck.effectiveDenominator(drop, 10), 100000);
});

test('null cap means luck-affected with no floor', () => {
    const drop = makeDrop({ baseChance: '1e12', type: 'Basic', cap: null });
    assert.equal(RS.Luck.effectiveDenominator(drop, 1e9), 1000);
    assert.equal(RS.Luck.effectiveDenominator(drop, 1e12), 1);
});

test('Noobinial type is fully immune to luck', () => {
    const drop = makeDrop({ baseChance: '5000', type: 'Noobinial', cap: null });
    assert.equal(RS.Luck.effectiveDenominator(drop, 1), 5000);
    assert.equal(RS.Luck.effectiveDenominator(drop, 100000), 5000);
});

test('luck value below 1 is treated as 1 (no negative-luck exploit)', () => {
    const drop = makeDrop({ baseChance: '1000', type: 'Basic', cap: null });
    assert.equal(RS.Luck.effectiveDenominator(drop, 0), 1000);
    assert.equal(RS.Luck.effectiveDenominator(drop, -50), 1000);
});

test('effectiveChance is the reciprocal of effectiveDenominator', () => {
    const drop = makeDrop({ baseChance: '400', type: 'Basic', cap: null });
    const denom = RS.Luck.effectiveDenominator(drop, 4);
    assert.equal(RS.Luck.effectiveChance(drop, 4), 1 / denom);
});

test('isAtCap reports whether luck has hit the floor', () => {
    const drop = makeDrop({ baseChance: '1000000', type: 'Basic', cap: '10' });
    assert.equal(RS.Luck.isAtCap(drop, 100), false);
    assert.equal(RS.Luck.isAtCap(drop, 100000), true);
    assert.equal(RS.Luck.isAtCap(drop, 1000000), true);
});
