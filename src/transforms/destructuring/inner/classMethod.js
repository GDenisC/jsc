import t from '@babel/types';
import { raise } from '../error.js';
import { transformClassFunctionBody } from './functions/transform.js';

/**
 * @param {import('../../class-destructuring').ClassDestructuring} ctx
 * @param {import('@babel/core').NodePath<t.ClassMethod>} path
 */
export const classMethod = function(ctx, className, path) {
    const node = path.node,
        key = node.key;

    if (!t.isIdentifier(key))
        return raise('All class methods should be named');

    const params = node.params;

    if (key.name != 'constructor' && !node.static) params.unshift(t.identifier('self'));

    return t.functionDeclaration(
        t.identifier(ctx.classes.add(className, node)),
        params,
        transformClassFunctionBody(ctx, className, path.get('body')),
        node.generator,
        node.async
    );
}