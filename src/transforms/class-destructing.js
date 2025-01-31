import { setOptions } from './destructing/options.js';
import { ClassMap } from './destructing/naming.js';
import { classDeclaration } from './destructing/inner/classDeclaration.js';
import { classExpression } from './destructing/inner/classExpression.js';
import { memberExpression } from './destructing/outer/memberExpression.js';
import { variableDeclarator } from './destructing/outer/variableDeclarator.js';
import { transformMemberExpression } from './destructing/outer/transforms/memberExpression.js';
import { newExpression } from './destructing/outer/newExpression.js';

/**
 * function name template: `{classname}[_static][_(get|set)][_private]_{property}`
 *
 * only work with top-level classes
 *
 * ### TODO: setters and getters must be converted from assignments and gets(proper term?) into function calls, since they're functions
 */
export class ClassDestructing {
	constructor(options) {
		this.options = setOptions(options);
		this.classes = new ClassMap(this.options);
		/** @type {{ path: import('@babel/core').NodePath<import('@babel/types').ClassMethod>, className: string }[]} */
		this.postTransformPaths = [];
		this.path = null;
	}

	getVisitors() {
		return {
			Program: path => this.path = path,
			ClassDeclaration: path => classDeclaration(this, path),
			ClassExpression: path => classExpression(this, path),
			MemberExpression: path => memberExpression(this, path),
			VariableDeclarator: path => variableDeclarator(this, path)
		};
	}

	postTransform() {
		for (const { path, className } of this.postTransformPaths) {
			path.traverse({
				MemberExpression: childPath => {
					transformMemberExpression(this, childPath, className, 'self');
					memberExpression(this, childPath);
				},
				VariableDeclarator: path => variableDeclarator(this, path)
			}, this);
		}

		// TODO: rewrite the code again to remove this line :)
		this.path.traverse({ NewExpression: path => newExpression(this, path) });
	}
}