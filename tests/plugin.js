import babel from '@babel/core';
import plugin from '../src/index.js';

const input = `
class Keys {
	static master = "Hello, World";

	static getMaster() {
		return Keys.master;
	}
}

console.log(Keys.master, Keys.getMaster());
`.trim();

console.log('------------ INPUT ------------');
console.log(input.replaceAll('\t', '  '));

const result = babel.transformSync(input, {
	plugins: [[plugin, { classDestructuring: true }]]
});

console.log('------------ OUTPUT -----------');
console.log(result.code);