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

    if (!parent.isCallExpression() || !t.isIdentifier(object) || object.name != varName) return;

    t.assertIdentifier(property);

    path.replaceWith(
        t.identifier(
            ctx.classes.getInstanceMethod(className, property.name)
        )
    );

    parent.node.arguments.unshift(t.identifier(varName));
}