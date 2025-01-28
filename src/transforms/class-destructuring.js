import { setOptions } from './destructuring/options.js';
import { ClassMap } from './destructuring/naming.js';
import { classDeclaration } from './destructuring/inner/classDeclaration.js';
import { classExpression } from './destructuring/inner/classExpression.js';
import { memberExpression } from './destructuring/outer/memberExpression.js';
import { variableDeclarator } from './destructuring/outer/variableDeclarator.js';

/**
 * function name template: `{classname}[_static][_(get|set)][_private]_{property}`
 *
 * only work with top-level classes
 *
 * ### TODO: setters and getters must be converted from assignments and gets(proper term?) into function calls, since they're functions
 */
export class ClassDestructuring {
	constructor(options) {
		this.options = setOptions(options);
		this.classes = new ClassMap(this.options);
	}

	getVisitors() {
		return {
			ClassDeclaration: path => classDeclaration(this, path),
			ClassExpression: path => classExpression(this, path),
			MemberExpression: path => memberExpression(this, path),
			VariableDeclarator: path => variableDeclarator(this, path)
		};
	}
}