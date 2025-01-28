import babel from '@babel/core';
import plugin from '../src/index.js';

const reset = '\x1b[0m';

const bRed = '\x1b[41m';
const fYellow = '\x1b[33m';

export let lastTestId = 0;
let errorWasShowed = false;

function deepStrictEqual(actual, expected) {
    switch (typeof actual) {
        case 'string':
        case 'number':
        case 'bigint':
        case 'boolean':
        case 'symbol':
        case 'undefined':
            return actual === expected;
        case 'function':
            throw 'no.';
    }

    if (Array.isArray(actual)) {
        if (actual.length != expected.length) return false;

        for (let i = 0, l = actual.length; i < l; ++i) {
            if (!deepStrictEqual(actual[i], expected[i]))
                return false;
        }

        return true;
    }

    if (actual == null || expected == null) return false;

    let actualKeys = Object.keys(actual),
        expectedKeys = Object.keys(expected);

    let i = actualKeys.length + 1;
    while (--i) {
        let key = actualKeys[i - 1];
        if (key == 'loc' || key == 'start' || key == 'end' || key == 'innerComments' || key == 'trailingComments' || key == 'leadingComments') continue;
        if (!deepStrictEqual(actual[key], expected[expectedKeys[expectedKeys.indexOf(key)]]))
            return false;
    }

    return true;
}

const tests = [];

export const failedTests = new Set();

const asyncTest = async function(id, name, input, options, output) {
    input = input.trim();

    let actual, expected,
        label = 'Test `' + name + '` ';

    try {
        actual = babel.transform(input, { plugins: [[plugin, options]] });
        expected = babel.transform(output);
    } catch (e) {
        failedTests.add(id);
        if (!errorWasShowed) {
            console.error(
                label + bRed + 'FAILED' + reset + '\n'
                + (e.stack ?? e).split('\n').slice(0, 10).join('\n') + '\n'
            );
            console.log = () => {};
            errorWasShowed = true;
        }
        return;
    }

    if (actual.code !== expected.code) {
        failedTests.add(id);
        if (!errorWasShowed) {
            console.error(
                label + bRed + 'FAILED' + reset + '\n\n'
                + fYellow + '--- EXPECTED ---' + reset + '\n'
                + expected.code + '\n'
                + fYellow + '---- ACTUAL ----' + reset + '\n'
                + actual.code + '\n'
            );
            console.log = () => {};
            errorWasShowed = true;
        }
        return;
    }
}

export const runTest = function(name, input, options, output) {
    tests.push(asyncTest(++lastTestId, name, input, options, output));
}

export const awaitTests = function() {
    return Promise.all(tests);
}