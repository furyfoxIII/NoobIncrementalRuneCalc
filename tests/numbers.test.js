'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRS } = require('./support/loadRS.js');

const RS = loadRS();

test('parse handles suffix notation', () => {
    assert.equal(RS.Numbers.parse('333K'), 333000);
    assert.equal(RS.Numbers.parse('43.5Qd'), 43.5e15);
    assert.equal(RS.Numbers.parse('2.5UVt'), 2.5 * Math.pow(10, 22 * 3));
    assert.equal(RS.Numbers.parse('500'), 500);
    assert.equal(RS.Numbers.parse(null), 0);
    assert.equal(RS.Numbers.parse(undefined), 0);
});

test('parse handles scientific notation', () => {
    assert.equal(RS.Numbers.parse('1.23e10'), 1.23e10);
});

test('format round-trips through parse for round numbers', () => {
    const n = RS.Numbers.parse('333K');
    assert.equal(RS.Numbers.format(n), '333K');
});

test('floorNear absorbs floating point noise near an integer', () => {
    assert.equal(RS.Numbers.floorNear(99.999999999999994), 100);
    assert.equal(RS.Numbers.floorNear(100.00000000000003), 100);
});

test('floorNear does not distort genuine fractional values', () => {
    assert.equal(RS.Numbers.floorNear(4.99), 4);
    assert.equal(RS.Numbers.floorNear(4.01), 4);
    assert.equal(RS.Numbers.floorNear(0), 0);
});

test('floorNear absorbs realistic round-trip noise at moderately large magnitudes', () => {
    // Mirrors the actual bug scenario at larger scale: a value that should
    // be exactly 100000 but landed a hair under it due to float noise.
    const noisy = 100000 * (1 - 1e-13);
    assert.equal(RS.Numbers.floorNear(noisy), 100000);
});

test('floorNear does not meaningfully perturb exact large integers', () => {
    // The relative epsilon component is tiny (1e-12) specifically so it
    // doesn't distort already-correct large integers by more than a
    // negligible fraction -- unlike a naive 1e-9 relative epsilon would.
    const exact = 1e15;
    const result = RS.Numbers.floorNear(exact);
    assert.ok(Math.abs(result - exact) <= exact * 1e-12 + 1);
});

test('floorNear passes through non-finite values unchanged', () => {
    assert.equal(RS.Numbers.floorNear(Infinity), Infinity);
    assert.equal(RS.Numbers.floorNear(-Infinity), -Infinity);
    assert.ok(Number.isNaN(RS.Numbers.floorNear(NaN)));
});
