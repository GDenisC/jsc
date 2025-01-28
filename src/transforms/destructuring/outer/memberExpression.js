import t from '@babel/types';

/**
 * @param {import('../../class-destructuring').ClassDestructuring} ctx
 * @param {import('@babel/core').NodePath<t.MemberExpression>} path
 */
export const memberExpression = function(ctx, path) {
    const parentPath = path.parentPath,
        parent = path.parent,
        node = path.node,
        object = node.object,
        property = node.property;

    // is method?
    if (t.isCallExpression(parent)) {
        if (t.isNewExpression(object) && t.isIdentifier(property)) {
            if (!t.isIdentifier(object.callee)) return;

            const className = object.callee.name;

            if (!ctx.classes.has(className)) return;

            parentPath.replaceWith(t.callExpression(
                t.identifier(ctx.classes.getInstanceMethod(className, property.name)),
                [
                    ctx.classes.hasConstructor(className)
                        ? t.callExpression(
                            t.identifier(ctx.classes.getInstanceMethod(className, 'constructor')),
                            object.arguments
                        )
                        : t.objectExpression([]), // {}
                    ...parent.arguments
                ]
            ));
        }
    } else {
        // TODO: getters and setters
    }
}