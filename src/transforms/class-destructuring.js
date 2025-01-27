import { setOptions } from './destructuring/options.js';
import { ClassMap } from './destructuring/naming.js';
import { classDeclaration } from './destructuring/inner/classDeclaration.js';
import { classExpression } from './destructuring/inner/classExpression.js';

/**
 * function name template: `{classname}[_static][_(get|set)][_private]_{property}`
 *
 * only work with top-level classes
 *
 * ### TODO:
 * 1. setters and getters must be converted from assignments and gets(proper term?) into function calls, since they're functions
 * 2. fix `self.{method}(...)`
 * do all of the above, in that order
 */
export class ClassDestructuring {
	constructor(options) {
		this.options = setOptions(options);
		this.classes = new ClassMap(this.options);
	}

	getVisitors() {
		return {
			ClassDeclaration: path => classDeclaration(this, path),
			ClassExpression: path => classExpression(this, path)
		};
	}
}