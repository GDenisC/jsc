import t from '@babel/types';
import { raise } from '../error.js';
import { transformMemberExpression } from './transforms/memberExpression.js';

/**
 * @param {import('../../class-destructing.js').ClassDestructing} ctx
 * @param {import('@babel/core').NodePath<t.VariableDeclarator>} path
 */
export const variableDeclarator = function(ctx, path) {
    const node = path.node;
    if (!t.isNewExpression(node.init)) return;

    let block = path.parentPath.parentPath;

    if (!block.isBlock() && !block.isProgram())
        return raise('Unexpected position of variableDeclarator (line: ' + path.node.loc?.start.line + ')');

    t.assertIdentifier(node.id);

    const className = node.init.callee.name,
        varName = node.id.name;

    node.init = ctx.classes.hasConstructor(className)
        ? t.callExpression(t.identifier(ctx.classes.getInstanceMethod(className, 'constructor')), node.init.arguments)
        : t.objectExpression([]);

    block.traverse({
        MemberExpression: path => transformMemberExpression(ctx, path, className, varName)
    });
}