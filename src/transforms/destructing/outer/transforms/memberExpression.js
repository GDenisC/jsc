import t from '@babel/types';

/**
 * @param {import('../../../class-destructing').ClassDestructing} ctx
 * @param {import('@babel/core').NodePath<t.MemberExpression>} path
 */
export const transformMemberExpression = function(ctx, path, className, varName) {
	const parent = path.parentPath,
		node = path.node,
		object = node.object,
		property = node.property;

	if (!t.isIdentifier(object) || object.name != varName) return;

	t.assertIdentifier(property);

	// is method?
	if (parent.isCallExpression()) {
		path.replaceWith(
			t.identifier(
				ctx.classes.getInstanceMethod(className, property.name)
			)
		);

		parent.node.arguments.unshift(t.identifier(varName));
	} else {
		let prop = ctx.classes.getStaticProperty(className, property.name);

		if (!prop) return;

		path.replaceWith(
			t.identifier(prop.className)
		);
	}
}