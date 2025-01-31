import t from '@babel/types';

/**
 * @param {import('../../class-destructing').ClassDestructing} ctx
 * @param {import('@babel/core').NodePath<t.MemberExpression>} path
 */
export const memberExpression = function(ctx, path) {
	const parentPath = path.parentPath,
		parent = path.parent,
		node = path.node,
		object = node.object,
		isInstanced = t.isNewExpression(object);
	let property = node.property;

	if (!t.isIdentifier(property)) return;

	let className;

	if (isInstanced) {
		t.assertIdentifier(object.callee);
		className = object.callee.name;
	} else if (t.isIdentifier(object)) {
		className = object.name;
	} else {
		return;
	}

	if (!ctx.classes.has(className)) return;

	const args = [];

	if (isInstanced) {
		args.push(
			ctx.classes.hasConstructor(className)
				? t.callExpression(
					t.identifier(ctx.classes.getInstanceMethod(className, 'constructor')),
					object.arguments
				)
				: t.objectExpression([])
		);
	}

	const methodName = ctx.classes.getMethod(className, !isInstanced, property.name);

	// method / setter / getter / static property or getter / new Class().{property or getter}
	if (t.isCallExpression(parent) && parent.callee == node && methodName) {
		const identifier = t.identifier(methodName);

		args.push(...parent.arguments);
		parentPath.replaceWith(t.callExpression(identifier, args));
	} else if (t.isAssignmentExpression(parent) && parent.left == node && methodName) {
		const identifier = t.identifier(methodName);

		args.push(parent.right);
		parentPath.replaceWith(t.callExpression(identifier, args));
	} else if (t.isExpressionStatement(parent) && methodName) {
		const identifier = t.identifier(methodName);

		path.replaceWith(t.callExpression(identifier, args));
	} else if (!isInstanced) {
		let prop = ctx.classes.getStaticProperty(className, property.name)?.className;
		if (!prop) { // is getter?
			path.replaceWith(
				t.callExpression(
					t.identifier(ctx.classes.getStaticMethod(className, property.name)),
					[]
				)
			);
		} else {
			path.replaceWith(t.identifier(prop));
		}
	} else {
		let prop = ctx.classes.getStaticProperty(className, property.name);
		if (!prop) { // is getter?
			path.replaceWith(
				t.callExpression(
					t.identifier(ctx.classes.getInstanceMethod(className, property.name)),
					args
				)
			);
		} else {
			path.replaceWith(t.identifier(prop));
		}
	}
}