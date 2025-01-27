import t from '@babel/types';
import { classMethod } from './classMethod.js';
import { raise } from '../error.js';

/**
 * @param {import('../../class-destructuring').ClassDestructuring} ctx
 * @param {import('@babel/core').NodePath<t.ClassDeclaration>} path
 */
export const classDeclaration = function(ctx, path) {
    const className = path.node.id?.name;

    if (!className)
        raise('All classes should be named.');

    const replaces = [];

    path.traverse({
        ClassMethod(childPath) {
            if (childPath.parentPath.parentPath != path) return;
            replaces.push(classMethod(ctx, className, childPath));
        }
    });

    // TODO: finish all these types and remove this code
    for (let value of path.node.body.body) {
        switch (value.type) {
            case 'ClassMethod': break;
            default: raise('Unsupported class body type `' + value.type + '`');
        }
    };

    path.replaceWithMultiple(replaces);
}