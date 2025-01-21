import babel from '@babel/core';
import plugin from '../src/index.js';

const input = `
class Vault {
	#data;
	constructor(data) {
		this.#data = data;
	}

	get value() {
		return this.#data;
	}
}

let vault = new Vault(123);

vault.value;
`.trim();

console.log('------------ INPUT ------------');
console.log(input.replaceAll('\t', '  '));

console.log('------------ DEBUG ------------');
const result = babel.transformSync(input, {
	plugins: [[plugin, { classDestructuring: { debug: true } }]]
});

console.log('------------ OUTPUT -----------');
console.log(result.code);