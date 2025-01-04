import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const plugin = function (babel) {
	/**
	 * @type {import("@babel/types")}
	 */
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