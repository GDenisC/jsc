import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

function generateUsableIdentifier (identifier) {
	// assumes we have a magical `idenfifierAlreadyExists` function
	if (!idenfifierAlreadyExists()) {
		return identifier;
	}

	let i = 0, generated;
	do {
		generated = `${identifier}_${i}`;
	} while (idenfifierAlreadyExists(generated));
	return generated;
}

const plugin = function (babel) {
	/** @type {import("@babel/types")} */
	const t = babel.types;

	return {
		visitor: {
			Function: {
				enter (path) {
					console.log(path);
				}
			}
		}
	};
}

export { plugin };