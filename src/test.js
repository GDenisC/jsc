const LITERALS = [
    '1;',
    '3.14159;',
    '-1.5;',
    'Infinity;',
    '-NaN;',
    '"foo";',
    "'bar';",
    '"\"";',
    '"\\";',
    '/foo/;',
    '/bar/g;',
    '/baz/gi;',
    'true;',
    'false;',
    'null;',
    'undefined;'
];

const EXPRESSIONS = [
    'a;',
    '_b;',
    '_0;',
    '$0;',
    'this;',
    'a = b;',
    'a + b - c;',
    "10 + '';",
    'a + b * c;',
    '(a + b) * c;',
    '(((x)));',
    'a.b;',
    'this.a;',
    '[];',
    '[a];',
    '[a, b, c];',
    'foo();',
    'foo(x);',
    'foo(x, 1, "", [], this);',
    'foo(foo());',
    'new foo;',
    'new foo();',
    'new foo(x, 1, "", [], this);',
    'new foo(foo();)',
    'new foo(new foo());',
    'new foo().bar;',
    'new foo().bar();',
    'new foo().bar(x);',
    'new foo().bar(x, 1, "", [], this);',
    'new foo().bar(foo());',
    '({});',
    '({a: b});',
    '({a: b, c: 10});',
    '({a: "", b: null, c: undefined, d: this});',
    '({a: new foo()});',
    'x ? y : z'
];

const STATEMENTS = [
    ';;',
    'return x;',
    'break;',
    'continue;',
    '{}',
    '{;;}',
    'if (a) {}',
    'if (true) {} else {}',
    'for (;;) {}',
    'for (a; b; c) {}',
    'for (a in b) {}',
    'for (a of b) {}',
    'while (a) {}',
    'do {} while (a)',
    'switch (a) {}',
    'switch (a) { default: {} }',
    'switch (a) { case 1: {} }',
    'switch (a) { case 1: {} case 2: {} }',
    'switch (a) { case 1: {} case 2: {} default: {} }',
    'let x;',
    'let x = 0;',
    'var a, b, c;',
    'var a = 1, b, c = 2;',
    'const x = 100;',
    'function foo() {}',
    'function bar(x) {}',
    'function baz(x, y, z) {}',
    'class Foo {}',
    'class Foo extends Bar {}',
    'class Foo { bar() {} }',
    'class Foo { constructor() {} }',
    'class Foo { constructor(x) {} }',
    'class Foo { constructor(x, y, z) {} }'
];

import generate from './javascript/generator.js';
import { types } from './javascript/index.js'

let result;

console.time('generating code');
generate(types.CodeStatement([
    types.FunctionDeclaration(
        null,
        [],
        types.BlockStatement([
            types.ForStatement(
                types.VariableDeclaration('let', 'i', types.NumberLiteral(1000)),
                types.Operator(
                    null,
                    '--',
                    types.Identifier('i')
                ),
                null,
                types.YieldExpression(
                    types.CallExpression(
                        types.MemberExpression(
                            types.Identifier('Math'),
                            types.Identifier('pow')
                        ),
                        [
                            types.NumberLiteral(2),
                            types.Identifier('i')
                        ]
                    )
                )
            ),
        ]),
        false,
        true
    )
]));
console.timeEnd('generating code');

let code = '"\\""';

import lex from './javascript/lexer.js';

console.time('lexer')
result = lex(code);
console.timeEnd('lexer');

console.log(result);