import { ClassDestructing } from './transforms/class-destructing.js';

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

const plugin = function(_babel, options = {}) {
	let transformers = [],
		visitor = {};

	if (options.classDestructuring) {
		let classDestructing = new ClassDestructing(options.classDestructuring);
		transformers.push(classDestructing);
		visitor = Object.assign(visitor, classDestructing.getVisitors());
	}

	return {
		visitor,
		post: () => {
			for (const transformer of transformers) {
				transformer.postTransform();
			}
		}
	};
}

export default plugin;