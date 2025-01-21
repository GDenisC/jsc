import core, { types as t } from '@babel/core';
import { setOptions } from './destructuring/options.js';
import { ClassMap } from './destructuring/naming.js';

/**
 * function name template: `{classname}[_static][_(get|set)][_private]_{property}`
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
	constructor(options) {
		this.options = setOptions(options);
		this.classes = new ClassMap(this.options);
	}

	getVisitors() {
		return {
			ClassDeclaration: this.onClassDeclaration.bind(this),
			CallExpression: this.onCallExpression.bind(this),
			NewExpression: this.onNewExpression.bind(this),
			MemberExpression: this.onMemberExpression.bind(this)
		};
	}

	/** @param {core.NodePath<t.ClassExpression>} path */
	onClassExpression(path) {
		let decl = path.parentPath,
			decls = decl.parentPath;
		throw new Error('Class expressions like "' + decls.node.kind + ' ' + decl.node.id.name + ' = class { ... }" not supported');
	}

	/** @param {core.NodePath} path */
	onClassDeclaration(path) {
		if (path.parentPath.node.type != 'Program') {
			throw new Error('Classes must be top-level');
		}

		let className = path.node.id.name,
			options = this.options,
			classes = this.classes; // babel skill issue

		/** @param {core.NodePath<t.ClassMethod | t.ClassPrivateMethod>} path */
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

			if (options.mangleProperties) path.traverse({
				ExpressionStatement(path) {
					let expression = path.node.expression;
					if (!t.isAssignmentExpression(expression) || expression.operator != '=') return;
					let member = expression.left;
					if (!t.isMemberExpression(member)) return;
					if (member.object.name != 'self') return;
					let id = member.property;
					if (!t.isIdentifier(id)) return;
					let index = classes.getOrAddPropertyIndex(className, id.name);
					path.node.expression.left.property = t.numericLiteral(index);
				},
				MemberExpression(path) {
					let prop = path.node.property;
					if (!t.isIdentifier(prop)) return;
					path.node.property = t.numericLiteral(classes.getPropertyIndex(className, prop.name))
				}
			});

			path.parentPath.parentPath.insertBefore(
				t.functionDeclaration(
					t.identifier(classes.add(className, node)),
					node.params,
					node.body,
					node.generator,
					node.async
				)
			);
		}

		/** @param {core.NodePath<t.ClassProperty | t.ClassPrivateProperty>} path */
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
						t.identifier(self.addClassProperty(className, node)),
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

	/** @param {core.NodePath<t.CallExpression>} path */
	onCallExpression(path) {
		if (t.isIdentifier(path.node.callee)) return

		// Identifier || CallExpression
		let name = path.node.callee.object?.name || path.node.callee.object?.callee.name,
			prop = path.node.callee?.property?.name,
			method = this.classes.getInstanceMethod(name, prop),
			staticMethod = this.classes.getStaticMethod(name, prop);

		if (!method && !staticMethod) return;

		if (t.isNewExpression(path.node.callee.object)) {
			path.node.arguments.unshift(path.node.callee.object);
		}

		path.node.callee = t.identifier(method || staticMethod);
	}

	/** @param {core.NodePath} path */
	onNewExpression(path) {
		let className = path.node.callee.name,
			classConstructor = this.classes.getInstanceMethod(className, 'constructor'),
			classes = this.classes,
			options = this.options;

		path.replaceWith(
			t.callExpression(
				t.identifier(classConstructor),
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

				let methodName = classes.getInstanceMethod(className, path.node.callee.property.name);

				if (!methodName)
					throw new Error('Unknown method of ' + className + ' declared as ' + variableName);

				path.replaceWith(
					t.callExpression(
						t.identifier(methodName),
						[t.identifier(variableName), ...path.node.arguments]
					)
				);
			},
			MemberExpression(path) {
				if (!t.isIdentifier(path.node.object) || path.node.object.name != variableName) return;

				// getters and setters

				let methodName = classes.getInstanceMethod(className, path.node.property.name);

				if (!methodName) {
					if (!options.mangleProperties) return;
					path.node.property = t.numericLiteral(classes[className][properties].indexOf(path.node.property.name));
					return;
				}

				path.replaceWith(
					t.callExpression(
						t.identifier(methodName),
						[t.identifier(variableName)]
					)
				);
			}
		});
	}

	/** @param {core.NodePath<t.MemberExpression>} path */
	onMemberExpression(path) {
		let object = path.node.object,
			property = path.node.property;

		// transform static properties
		if (t.isIdentifier(object) && t.isIdentifier(property) && object.name != 'self') {
			let classProperty = this.classes.getStaticProperty(object.name, property.name);

			if (!classProperty) return;

			path.replaceWith(t.identifier(classProperty));
		}
	}
}