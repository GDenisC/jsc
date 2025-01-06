import classDestructuring from './transforms/class-destructuring.js';

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

/** @param {import("@babel/core")} babel */
const plugin = function (_babel, options = {}) {
	let visitor = {};

	if (options.classDestructing)
		visitor = Object.assign(visitor, classDestructuring);

	return { visitor };
}

export default plugin;