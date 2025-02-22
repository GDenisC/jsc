import t from '@babel/types';

/**
 * @param {import('../../class-destructing.js').ClassDestructing} ctx
 * @param {import('@babel/core').NodePath<t.NewExpression>} path
 */
export const newExpression = function (ctx, path) {
    const node = path.node,
        className = node.callee.name;

    if (!ctx.classes.has(className)) return;

    path.replaceWith(
        t.callExpression(
            t.identifier(ctx.classes.getInstanceMethod(className, 'constructor')),
            node.arguments
        )
    );
}