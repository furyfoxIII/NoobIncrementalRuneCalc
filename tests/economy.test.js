'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRS, makeDrop } = require('./support/loadRS.js');

const RS = loadRS();

test('Economy.evaluate computes affordable trials from currency and cost', () => {
    const openingRune = {
        cost: { currency: 'Fire', amount: '10' },
        drops: [makeDrop({ baseChance: '1000', type: 'Basic', cap: null })]
    };

    const result = RS.Economy.evaluate({
        openingRune,
        currencyAmount: 1005,
        bulk: '1',
        speedSeconds: '1',
        luckValue: 1
    });

    // 1005 / 10 = 100.5 -> floor to 100 individual opens affordable.
    assert.equal(result.totalTrials, 100);
});

test('Economy.evaluate expected gains use the same math as Prediction (consistency)', () => {
    const drop = makeDrop({ baseChance: '500', type: 'Basic', cap: null });
    const openingRune = { cost: { currency: 'Fire', amount: '1' }, drops: [drop] };

    const result = RS.Economy.evaluate({
        openingRune,
        currencyAmount: 10000,
        bulk: '1',
        speedSeconds: '1',
        luckValue: 1
    });

    const direct = RS.Prediction.expectedCopiesFromTrials(drop, 1, result.totalTrials);
    assert.equal(result.expectedGains[0].expectedCopies, direct);
});

test('Economy.evaluate handles zero currency gracefully', () => {
    const openingRune = {
        cost: { currency: 'Fire', amount: '10' },
        drops: [makeDrop({ baseChance: '1000', type: 'Basic', cap: null })]
    };
    const result = RS.Economy.evaluate({
        openingRune, currencyAmount: 0, bulk: '1', speedSeconds: '1', luckValue: 1
    });
    assert.equal(result.totalTrials, 0);
    assert.equal(result.expectedGains[0].expectedCopies, 0);
});

// Currency buys individual opens at costPerUnit each, regardless of Bulk --
// Bulk is a throughput setting (runes attempted per action), not an
// affordability gate. A large Bulk relative to currency just means the
// affordable amount resolves within a small fraction of one action
// (practically instant), never zero just because a full bulk-batch isn't
// affordable.
test('Economy.evaluate is unaffected by Bulk when currency covers far fewer runes than one batch', () => {
    const openingRune = {
        cost: { currency: 'HackPoints', amount: '387' },
        drops: [makeDrop({ baseChance: '250000000000', type: 'Basic', cap: null })]
    };

    const currency = 5e57;  // "5OcDe" scale
    const bulk = 1.54e63;   // "1.54Vt" scale -- one full batch costs far more than `currency`

    const result = RS.Economy.evaluate({
        openingRune, currencyAmount: currency, bulk: bulk, speedSeconds: '0.05', luckValue: 7.909e28
    });

    const expectedTrials = Math.floor(currency / 387);
    assert.equal(result.totalTrials, expectedTrials);
    assert.ok(result.totalTrials > 0, 'currency this large should still buy plenty of individual opens');
    // Far less than one full bulk-batch's worth of runes -> resolves
    // near-instantly, not "zero actions afforded."
    assert.ok(result.affordableActions < 1e-6);
    assert.ok(result.timeSeconds < 1e-6);
});

test('Economy.evaluate: enough currency for exactly one individual open works with no bulk dependency', () => {
    const openingRune = {
        cost: { currency: 'HackPoints', amount: '387' },
        drops: [makeDrop({ baseChance: '1000', type: 'Basic', cap: null })]
    };
    // Only enough for 1 open, even though bulk asks for a much bigger batch.
    const result = RS.Economy.evaluate({
        openingRune, currencyAmount: 500, bulk: '1000000', speedSeconds: '0.05', luckValue: 1
    });
    assert.equal(result.totalTrials, 1);
});
