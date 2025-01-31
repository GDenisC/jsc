import babel from '@babel/core';
import plugin from '../src/index.js';

const input = `
var Class = class {
	constructor() {}
};
`.trim();

console.log('------------ INPUT ------------');
console.log(input.replaceAll('\t', '  '));

console.log('------------ DEBUG ------------');
const result = babel.transformSync(input, {
	plugins: [[plugin, { classDestructuring: { debug: true } }]]
});

console.log('------------ OUTPUT -----------');
console.log(result.code);