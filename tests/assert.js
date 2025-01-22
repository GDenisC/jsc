import babel from '@babel/core';
import plugin from '../src/index.js';

const reset = '\x1b[0m';

const bRed = '\x1b[41m';
const bGreen = '\x1b[42m';

const fBlack = '\x1b[30m';
const fWhite = '\x1b[37m';
const fYellow = '\x1b[33m';

let testUniqueId = 0;

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

export const runTest = async function(name, input, options, output) {
    input = input.trim();

    let id = ++testUniqueId,
        actual, expected,
        label = 'Test `' + name + '` ',
        time = performance.now();

    try {
        actual = babel.transform(input, { plugins: [[plugin, options]], ast: true, comments: false, parserOpts: { ranges: false } });
        expected = babel.transform(output, { ast: true, comments: false, parserOpts: { ranges: false } });
    } catch (e) {
        return console.log(
            label + bRed + fWhite + 'FAILED' + reset + ' (' + id + ')\n'
            + (e.stack ?? e).split('\n').slice(0, 6).join('\n')
        );
    }

    if (!deepStrictEqual(actual.ast.program.body, expected.ast.program.body)) {
        return console.log(
            '\n' + label + bRed + fWhite + 'FAILED' + reset + ' (' + id + ')' + '\n\n'
            + fYellow + '--- EXPECTED ---' + reset + '\n'
            + expected.code + '\n'
            + fYellow + '---- ACTUAL ----' + reset + '\n'
            + actual.code
        );
    }

    const left = (performance.now() - time).toFixed(3) + 'ms';

    console.log(label + bGreen + fBlack + 'COMPLETED' + reset + ' in ' + left + ' (' + id + ')');
}