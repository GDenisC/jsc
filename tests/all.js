import { runTest } from './assert.js';

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
    'Class Property',
    'class Class { prop = null; }',
    { classDestructuring: {} },
    'function Class_constructor(self) { var self = { prop: null }; return self; }'
);

runTest(
    'Class Method',
    'class Class { method() {} }',
    { classDestructuring: {} },
    'function Class_method(self) {}'
);

runTest(
    'Class Methods usage',
    'class Class { constructor(x) { this.x = x } method() { return this.x; } }',
    { classDestructuring: {} },
    'function Class_constructor(x) { var self = {}; self.x = x; return self; } function Class_method(self) { return self.x }'
);

runTest(
    'Class Static Method',
    'class Class { static method() {} }',
    { classDestructuring: {} },
    'function Class_static_method() {}'
);

runTest(
    'Class Static Methods usage',
    'class Class { static method() { return 123; } }',
    { classDestructuring: {} },
    'function Class_static_method() { return 123; }'
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