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

	static world() {
		return 100;
	}
}

let x = new Class();
console.log(x.hello(Class.world()));
`.trim();

console.log('------------ INPUT ------------');
console.log(input);

const result = babel.transformSync(input, {
	plugins: [[plugin, { classDestructuring: true }]]
});

console.log('------------ OUTPUT -----------');
console.log(result.code);