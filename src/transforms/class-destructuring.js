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
 * 3. fix `self.{method}(...)`
 */
export class ClassDestructuring {
	constructor() {
		this.classes = {};
	}

	getVisitors() {
		return {
			ClassDeclaration: this.onClassDeclaration.bind(this),
			CallExpression: this.onCallExpression.bind(this),
			NewExpression: this.onNewExpression.bind(this),
			MemberExpression: this.onMemberExpression.bind(this)
		}
	}

	/** @param {import('@babel/core').NodePath<t.ClassExpression>} path */
	onClassExpression(path) {
		let decl = path.parentPath,
			decls = decl.parentPath;
		throw new Error('Class expressions like "' + decls.node.kind + ' ' + decl.node.id.name + ' = class { ... }" not supported');
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
				ThisExpression(path) {
					path.replaceWith(t.identifier('self'));
				},
				PrivateName(path) {
					path.replaceWith(t.identifier('private_' + path.node.id.name));
				}
			});

			path.parentPath.parentPath.insertBefore(
				t.functionDeclaration(
					t.identifier(self.addClassMethod(name, node)),
					node.params,
					node.body,
					node.generator,
					node.async
				)
			);
		}

		/** @param {import('@babel/core').NodePath<t.ClassProperty | t.ClassPrivateProperty>} path */
		function onClassProperty(path) {
			let node = path.node;

			// allow & ignore `#` declarations
			if (!node.static && t.isClassPrivateProperty(node)) return;

			if (!node.static)
				throw new Error('Non-static properties not supported');

			path.parentPath.parentPath.insertBefore(
				t.variableDeclaration(
					'var',
					[t.variableDeclarator(
						t.identifier(self.addClassProperty(name, node)),
						node.value
					)]
				)
			);
		}

		path.traverse({
			ClassMethod: onClassMethod,
			ClassPrivateMethod: onClassMethod,
			ClassProperty: onClassProperty,
			ClassPrivateProperty: onClassProperty
		});

		path.remove();
	}

	/** @param {import('@babel/core').NodePath} path */
	onCallExpression(path) {
		// Identifier || CallExpression
		let name = path.node.callee.object?.name || path.node.callee.object?.callee.name,
			prop = path.node.callee?.property?.name,
			method = this.getClassMethod(name, false, prop),
			staticMethod = this.getClassMethod(name, true, prop);

		if (!method && !staticMethod) return;

		if (t.isNewExpression(path.node.callee.object)) {
			path.node.arguments.unshift(path.node.callee.object);
		}

		path.node.callee = t.identifier(method || staticMethod);
	}

	/** @param {import('@babel/core').NodePath} path */
	onNewExpression(path) {
		let className = path.node.callee.name,
			self = this;

		path.replaceWith(
			t.callExpression(
				t.identifier(className + '_constructor'),
				path.node.arguments
			)
		);

		let varDecl = path.parentPath.node;

		if (!t.isVariableDeclarator(varDecl)) return;

		// visit the block

		let variableName = varDecl.id.name;

		/**  VarDecl    VarDecls   Block     */
		path.parentPath.parentPath.parentPath.traverse({
			CallExpression(path) {
				if (path.node.callee.object?.name != variableName) return;

				// instance methods

				let methodName = self.getClassMethod(className, false, path.node.callee.property.name);

				if (!methodName)
					throw new Error('Unknown method of ' + className + ' declared as ' + variableName);

				path.replaceWith(
					t.callExpression(
						t.identifier(className + '_' + path.node.callee.property.name),
						[t.identifier(variableName), ...path.node.arguments]
					)
				);
			},
			MemberExpression(path) {
				if (!t.isIdentifier(path.node.object) || path.node.object.name != variableName) return;

				// getters and setters

				let methodName = self.getClassMethod(className, false, path.node.property.name);

				if (!methodName)
					throw new Error('Unknown method of ' + className + ' declared as ' + variableName);

				path.replaceWith(
					t.callExpression(
						t.identifier(className + '_' + path.node.property.name),
						[t.identifier(variableName)]
					)
				);
			}
		});
	}

	/** @param {import('@babel/core').NodePath<t.MemberExpression>} path */
	onMemberExpression(path) {
		let object = path.node.object,
			property = path.node.property;

		// transform static properties
		if (t.isIdentifier(object) && t.isIdentifier(property)) {
			let classProperty = this.getClassProperty(object.name, true, property.name);

			if (!classProperty) return;

			path.replaceWith(t.identifier(classProperty));
		}
	}

	/** @param {t.ClassMethod} node */
	getClassName(className, node) {
		let name = className;
		if (node.static) name += '_static';
		if (node.kind == 'get') name += '_get';
		if (node.kind == 'set') name += '_set';
		if (node.key.type == 'PrivateName') name += '_private';
		name += '_' + node.key.name;
		return name;
	}

	addClassMethod(className, node) {
		let name = this.getClassName(className, node),
			s = node.static ? 's' : '';
		this.classes[className][s + 'm_' + node.key.name] = name;
		return name;
	}

	addClassProperty(className, node) {
		let name = this.getClassName(className, node),
			s = node.static ? 's' : '';
		this.classes[className][s + 'p_' + node.key.name] = name;
		return name;
	}

	getClassMethod(className, isStatic, name) {
		if (!name) return;
		let cls = this.classes[className];
		if (!cls) return;
		let s = isStatic ? 's' : '';
		return cls[s + 'm' + '_' + name];
	}

	getClassProperty(className, isStatic, name) {
		if (!name) return;
		let cls = this.classes[className];
		if (!cls) return;
		let s = isStatic ? 's' : '';
		return cls[s + 'p' + '_' + name];
	}
}