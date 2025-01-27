import t from '@babel/types';

/**
 * @param {import('../../../class-destructuring').ClassDestructuring} ctx
 * @param {import('@babel/core').NodePath<t.BlockStatement>} path
 */
export const transformClassFunctionBody = function(ctx, className, path) {
    path.unshiftContainer(
        'body',
        t.variableDeclaration(ctx.options.variableKind,
            [
                t.variableDeclarator(
                    t.identifier('self'),
                    t.objectExpression([])
                )
            ]
        )
    );

    path.traverse({
        ThisExpression(childPath) {
            childPath.replaceWith(t.identifier('self'));
        }
    });

    path.pushContainer(
        'body',
        t.returnStatement(t.identifier('self'))
    );

    return path.node;
}