import { ClassDestructuring } from './transforms/class-destructuring.js';

/*
function generateUsableIdentifier (identifier) {
	// assumes we have a magical `identifierAlreadyExists` function
	if (!identifierAlreadyExists()) {
		return identifier;
	}

	let i = 0, generated;
	do {
		generated = `${identifier}_${i}`;
	} while (identifierAlreadyExists(generated));
	return generated;
}
*/

const plugin = function (_babel, options = {}) {
	let visitor = {};

	if (options.classDestructuring) {
		let classDestructuring = new ClassDestructuring();
		visitor = Object.assign(visitor, classDestructuring.getVisitors());
	}

	return { visitor };
}

export default plugin;