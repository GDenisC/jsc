import t from '@babel/types';
import { transformClassConstructorBody } from './constructor.js';
import { visitors } from './replaceThis.js';

/**
 * @param {import('../../../class-destructuring').ClassDestructuring} ctx
 * @param {import('@babel/core').NodePath<t.BlockStatement>} path
 */
export const transformClassFunctionBody = function(ctx, className, path, isConstructor) {
    path.traverse(visitors);

    if (isConstructor)
        path.node = transformClassConstructorBody(ctx, className, path.node);

    return path.node;
}