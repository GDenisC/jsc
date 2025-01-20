import babel from '@babel/core';
import plugin from '../src/index.js';

const input = `
class Vault {
	#data;
	constructor(data) {
		this.#data = data;
	}

	isVault() {
		return true;
	}

	get value() {
		return this.#data;
	}
}

let vault = new Vault(123);

vault.isVault();

console.log(vault.value);

`.trim();

console.log('------------ INPUT ------------');
console.log(input.replaceAll('\t', '  '));

const result = babel.transformSync(input, {
	plugins: [[plugin, { classDestructuring: true }]]
});

console.log('------------ OUTPUT -----------');
console.log(result.code);