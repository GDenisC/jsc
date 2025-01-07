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

/** @type {{ [className: string]: import('@babel/core').types.ClassMethod[] }} */
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
				ClassMethod(path) {
					let node = path.node;

					if (node.kind != 'constructor' && !node.static) {
						node.params.unshift(t.identifier('self'));
					}

					path.traverse({
						/** @param {import('@babel/core').NodePath} path */
						BlockStatement(path) {
							if (node.kind == 'constructor') {
								path.unshiftContainer('body',
									t.variableDeclaration('var', [
										t.variableDeclarator(
											t.identifier('self'),
											t.objectExpression([])
										)
									])
								);
								path.pushContainer('body', t.returnStatement(t.identifier('self')));
							}
						},
						/** @param {import('@babel/core').NodePath} path */
						ThisExpression(path) {
							path.replaceWith(t.identifier('self'));
						}
					});

					methods.push(node);
				}
			});

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
	/** @param {import('@babel/core').NodePath} path */
	CallExpression(path) {
		let name = path.node.callee.object?.callee?.name,
			cls = classes[name];

		if (!cls) return;

		if (path.node.callee.object?.type == 'NewExpression') {
			path.node.arguments.unshift(path.node.callee.object);
		}

		path.node.callee = t.identifier(name + '_' + path.node.callee.property.name);
	},
	/** @param {import('@babel/core').NodePath} path */
	NewExpression(path) {
		let name = path.node.callee.name,
			cls = classes[name];

		if (!cls) return;

		path.replaceWith(
			t.callExpression(
				t.identifier(name + '_constructor'),
				path.node.arguments
			)
		);

		if (path.parentPath.type != 'VariableDeclarator') return;

		const variableName = path.parentPath.node.id.name;

		/**  VarDecl    VarDecls   Block     */
		path.parentPath.parentPath.parentPath.traverse({
			CallExpression(path) {
				if (path.node.callee.object?.name != variableName) return;

				path.node.arguments.unshift(t.identifier(variableName));

				path.replaceWith(
					t.callExpression(
						t.identifier(name + '_' + path.node.callee.property.name),
						path.node.arguments
					)
				);
			}
		});
	}
}