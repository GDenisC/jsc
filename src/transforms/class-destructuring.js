import { types as t } from '@babel/core';

/**
 * function name template: {classname}[_static][_(get|set)][_private]_{property}
 *
 * only work with top-level classes
 *
 * ### TODO:
 * 1. simplify `const/let Name = class { ETC }` into `class Name { ETC }`
 * 2. setters and getters must be converted from assignments and gets(proper term?) into function calls, since they're functions
 * do all of the above, in that order
 *  */
export class ClassDestructuring {
	constructor() {
		this.classes = {};
	}

	getVisitors() {
		return {
			ClassDeclaration: this.onClassDeclaration.bind(this),
			CallExpression: this.onCallExpression.bind(this),
			NewExpression: this.onNewExpression.bind(this)
		}
	}

	/** @param {import('@babel/core').NodePath} path */
	onClassDeclaration(path) {
		if (path.parentPath.node.type != 'Program') {
			throw new Error('Classes must be top-level');
		}

		let name = path.node.id.name,
			self = this; // babel skill issue

		self.classes[name] = {};

		/** @param {import('@babel/core').NodePath<t.ClassMethod | t.ClassPrivateMethod>} path */
		function onClassMethod(path) {
			let node = path.node;

			if (node.kind != 'constructor' && !node.static) {
				node.params.unshift(t.identifier('self'));
			}

			// add `var self = {}` and `return self`, replace `this` to `self` in {classname}_constructor
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

			path.insertBefore(
				t.functionDeclaration(
					t.identifier(self.addMethodName(name, node)),
					node.params,
					node.body,
					node.generator,
					node.async
				)
			);
		}

		path.traverse({
			ClassMethod: onClassMethod,
			ClassPrivateMethod: onClassMethod
		});

		path.remove();
	}

	/** @param {import('@babel/core').NodePath} path */
	onCallExpression(path) {
		let name = path.node.callee.object?.callee?.name,
			cls = this.classes[name];

		if (!cls) return;

		if (path.node.callee.object?.type == 'NewExpression') {
			path.node.arguments.unshift(path.node.callee.object);
		}

		path.node.callee = t.identifier(cls[path.node.callee.property.name]);
	}

	/** @param {import('@babel/core').NodePath} path */
	onNewExpression(path) {
		let className = path.node.callee.name,
			classMethods = this.classes[className];

		if (!classMethods) return;

		path.replaceWith(
			t.callExpression(
				t.identifier(className + '_constructor'),
				path.node.arguments
			)
		);

		if (path.parentPath.type != 'VariableDeclarator') return;

		let variableName = path.parentPath.node.id.name;

		/**  VarDecl    VarDecls   Block     */
		path.parentPath.parentPath.parentPath.traverse({
			CallExpression(path) {
				if (path.node.callee.object?.name != variableName) return;

				let methodName = classMethods[path.node.callee.property.name];

				if (!methodName)
					throw new Error('Unknown method of ' + className + ' declared as ' + variableName);

				path.replaceWith(
					t.callExpression(
						t.identifier(className + '_' + path.node.callee.property.name),
						path.node.arguments
					)
				);
			}
		});
	}

	/** @param {t.ClassMethod} node */
	getMethodName(className, node) {
		let name = className;
		if (node.static) name += '_static';
		if (node.kind == 'get') name += '_get';
		if (node.kind == 'set') name += '_set';
		if (node.key.type == 'PrivateName') name += '_private';
		name += '_' + node.key.name;
		return name;
	}

	addMethodName(className, node) {
		let name = this.getMethodName(className, node);
		this.classes[className][node.key.name] = name;
		return name;
	}
}