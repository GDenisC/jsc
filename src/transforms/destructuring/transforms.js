import util from 'node:util';
import t from '@babel/types';
import { raise } from './error.js';

/** @param {import('@babel/core').NodePath<t.ClassExpression>} path */
export const transformClassExpression = path => {
    if (!path || !path.node)
        raise(
            'Invalid transformClassExpression argument `path`:\n'
            + util.inspect(path, false, null, true)
        );

    if (!t.isClassExpression(path.node))
        raise(
            'Expected ClassExpression but got:\n'
            + util.inspect(path.node, false, null, true)
        );

    let variableDeclarator = path.parent;

    t.assertVariableDeclarator(variableDeclarator);
    t.assertIdentifier(variableDeclarator.id);

    let classPath = path.parentPath.parentPath;

    classPath.replaceWith(
        t.classDeclaration(
            variableDeclarator.id,
            path.node.superClass,
            path.node.body,
            path.node.decorators || null
        )
    );

    return classPath;
}