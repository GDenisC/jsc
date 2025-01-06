/**
 * TODO:
 * function name template: {classname}[_static][_(get|set)][_private]_{property}
 *
 * only work with top-level classes
 * 1. simplify `const/let Name = class { ETC }` into `class Name { ETC }`
 * 2. setters and getters must be converted from assignments and gets(proper term?) into function calls, since they're functions
 * do all of the above, in that order
 *  */

import { types as t } from '@babel/core';

/** @type {{ [className: string]: import('@babel/core').ClassMethod[] }} */
const classes = {};

export default {
	ClassDeclaration: {
		/** @param {import('@babel/core').NodePath} path */
		enter(path) {
			if (path.parentPath.node.type != 'Program') {
				throw new Error('Class must be top-level');
			}

			const methods = [];

			path.traverse({
				/** @param {import('@babel/core').NodePath} path */
				ClassMethod(method) {
					methods.push(method.node);
				},
			})

			classes[path.node.id.name] = methods;
		},

		/** @param {import('@babel/core').NodePath} path */
		exit(path) {
			const name = path.node.id.name;
			for (const method of classes[name]) {
				path.insertBefore(
					t.functionDeclaration(
						t.identifier(name + '_' + method.key.name),
						method.params,
						method.body
					)
				);
			}
			path.remove();
		}
	},
}