import babel from '@babel/core';
import plugin from '../src/index.js';

const input = `
class Class {
	constructor() {
		this.x = 1;
	}

	hello(a) {
		return this.x + a;
	}
}

let x = new Class();
console.log(x.hello(10));
`.trim();

console.log('------------ INPUT ------------');
console.log(input);

const result = babel.transformSync(input, {
	plugins: [[plugin, { classDestructing: true }]]
});

console.log('------------ OUTPUT -----------');
console.log(result.code);