import { runTest, awaitTests, failedTests, lastTestId } from './assert.js';

const time = performance.now();

runTest(
    'Empty Class',
    'class Class {}',
    { classDestructuring: {} },
    ''
);

runTest(
    'Empty Class Expression',
    'var Class = class {}',
    { classDestructuring: {} },
    ''
);

runTest(
    'Class Constructor',
    'class Class { constructor() {} }',
    { classDestructuring: {} },
    'function Class_constructor() { var self = {}; return self; }'
);

runTest(
    'Class Method',
    'class Class { method() {} }',
    { classDestructuring: {} },
    'function Class_method(self) {}'
);

runTest(
    'Class Private Method',
    'class Class { #method() {} }',
    { classDestructuring: {} },
    'function Class_private_method(self) {}'
);

runTest(
    'Class Static Method',
    'class Class { static method() {} }',
    { classDestructuring: {} },
    'function Class_static_method() {}'
);

runTest(
    'Class Private Static Method',
    'class Class { static #method() {} }',
    { classDestructuring: {} },
    'function Class_static_private_method() {}'
);

runTest(
    'Class Property (with constructor)',
    'class Class { prop = null; constructor() {} }',
    { classDestructuring: {} },
    'function Class_constructor() { var self = { prop: null }; return self; }'
);

runTest(
    'Class Property (without constructor)',
    'class Class { prop = null; }',
    { classDestructuring: {} },
    'function Class_constructor() { var self = { prop: null }; return self; }'
);

runTest(
    'Class Many Properties',
    'class Class { a = 1; b = 2; c = this.a + this.b; }',
    { classDestructuring: {} },
    'function Class_constructor() { var self = { a: 1, b: 2, c: null }; self.c = self.a + self.b; return self; }'
);

runTest(
    'Class Private Property',
    'class Class { #prop = null; }',
    { classDestructuring: {} },
    'function Class_constructor() { var self = { private_prop: null }; return self; }'
);

runTest(
    'Class Static Property',
    'class Class { static prop = 123; }',
    { classDestructuring: {} },
    'var Class_static_prop = 123;'
);

runTest(
    'Class Private Static Property',
    'class Class { static #prop = 123; }',
    { classDestructuring: {} },
    'var Class_static_private_prop = 123;'
);

runTest(
    'Class x prop + method',
    'class Class { constructor(x) { this.x = x } method() { return this.x; } }',
    { classDestructuring: {} },
    'function Class_constructor(x) { var self = {}; self.x = x; return self; } function Class_method(self) { return self.x; }'
);

runTest(
    'Class x prop + method (2)',
    'class Class { x = 1; method() { return this.x; } }',
    { classDestructuring: {} },
    'function Class_constructor() { var self = { x: 1 }; return self; } function Class_method(self) { return self.x; }'
);

runTest(
    'Class method outer usage via calls (with constructor)',
    'class Class { constructor() {} method() {} } new Class().method();',
    { classDestructuring: {} },
    'function Class_constructor() { var self = {}; return self; } function Class_method(self) {} Class_method(Class_constructor());'
);

runTest(
    'Class method outer usage via calls (without constructor)',
    'class Class { method() {} } new Class().method();',
    { classDestructuring: {} },
    'function Class_method(self) {} Class_method({});'
)

runTest(
    'Class method outer usage via variables (with constructor)',
    'class Class { constructor() {} method() {} } let a = new Class(); a.method();',
    { classDestructuring: {} },
    'function Class_constructor() { var self = {}; return self; } function Class_method(self) {} let a = Class_constructor(); Class_method(a);'
);

runTest(
    'Class method outer usage via variables (without constructor)',
    'class Class { method() {} } let a = new Class(); a.method();',
    { classDestructuring: {} },
    'function Class_method(self) {} let a = {}; Class_method(a);'
);

/*
import fs from 'node:fs';

runTest(
    'Concepting: Class',
    fs.readFileSync('./concepting/classSource.js', 'utf8'),
    { classDestructuring: { variableKind: 'const' } },
    fs.readFileSync('./concepting/classDestructured.js', 'utf8')
);
*/

awaitTests().then(() => console.warn(
    'All tests took ' + (performance.now() - time).toFixed(3) + 'ms.\n'
    + 'Failed tests: ' + failedTests.size + '/' + lastTestId
    + ' (' + (failedTests.size / lastTestId * 100).toFixed(1) + '%' + ')'
))