'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRS, makeDrop } = require('./support/loadRS.js');

const RS = loadRS();

/*
 * Regression coverage for the reported bug: predicting X copies of a rune
 * and then reading the per-rune breakdown back off the resulting trial
 * count (exactly what openingInfoPanel.js does) should always show X for
 * the target rune — never X-1 — regardless of parity. The bug was a plain
 * Math.floor() choking on floating-point round-trip noise from the
 * predictCopies -> expectedCopiesFromTrials inversion.
 */

function replicateOpeningInfoPanelRow(drop, luckValue, copies, bulk, speedSeconds, openingRune) {
    const result = RS.Prediction.predictCopies(drop, copies, {
        luckValue, bulk, speedSeconds, openingRune
    });
    const expected = RS.Prediction.expectedCopiesFromTrials(drop, luckValue, result.expectedTotalTrials);
    return RS.Numbers.floorNear(expected);
}

test('predicting then reading back copies matches exactly, for many values including even ones', () => {
    const drop = makeDrop({ baseChance: '5000', type: 'Basic', cap: null });
    const openingRune = { cost: { currency: 'Sand', amount: '82.8' } };

    for (let copies = 1; copies <= 500; copies++) {
        const wholeCount = replicateOpeningInfoPanelRow(drop, 1, copies, '8.57', '0.05', openingRune);
        assert.equal(wholeCount, copies, `copies=${copies} rounded back to ${wholeCount}`);
    }
});

test('reproduces the exact reported scenario: 230 copies of a target rune', () => {
    // A denominator/luck/bulk combination in the same ballpark as the
    // screenshot that reported the bug (Realm 3, Sunfire -> Secrets of
    // Egypt, bulk 8.57Vt, luck 1).
    const drop = makeDrop({ name: 'Secrets of Egypt', baseChance: '3.2e11', type: 'Basic', cap: '3.2e11' });
    const openingRune = { cost: { currency: 'Sand', amount: '82.8' } };

    const wholeCount = replicateOpeningInfoPanelRow(drop, 1, 230, RS.Numbers.parse('8.57Vt'), '0.05', openingRune);
    assert.equal(wholeCount, 230);
});

test('even AND odd copy counts all round-trip correctly across varied denominators', () => {
    const denominators = ['500', '12345', '1e6', '3.2e11', '250'];
    for (const baseChance of denominators) {
        const drop = makeDrop({ baseChance, type: 'Basic', cap: null });
        for (let copies = 220; copies <= 240; copies++) {
            const wholeCount = replicateOpeningInfoPanelRow(drop, 1, copies, '10', '0.1', null);
            assert.equal(wholeCount, copies, `baseChance=${baseChance} copies=${copies}`);
        }
    }
});

test('Numbers.floorNear absorbs tiny float noise without rounding up real fractions', () => {
    assert.equal(RS.Numbers.floorNear(229.99999999999997), 230);
    assert.equal(RS.Numbers.floorNear(230.00000000000003), 230);
    assert.equal(RS.Numbers.floorNear(230), 230);
    assert.equal(RS.Numbers.floorNear(229.4), 229);
    assert.equal(RS.Numbers.floorNear(0.006), 0);
    assert.equal(RS.Numbers.floorNear(5.999), 5);
});
