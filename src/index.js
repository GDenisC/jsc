import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

console.time('babel');
parse('foo(x, 1, "", [], this);');
console.timeEnd('babel');

/*

const plugin = function (babel) {
	/**
	 * @type {import("@babel/types")}
	 *!/
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
*/