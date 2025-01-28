import t from '@babel/types';
import { classMethod } from './classMethod.js';
import { raise } from '../error.js';
import { classPrivateMethod } from './privateClassMethod.js';
import { classProperty } from './classProperty.js';
import { transformClassConstructorBody } from './transforms/constructor.js';
import { privateClassProperty } from './privateClassProperty.js';

/**
 * @param {import('../../class-destructuring').ClassDestructuring} ctx
 * @param {import('@babel/core').NodePath<t.ClassDeclaration>} path
 */
export const classDeclaration = function(ctx, path) {
    const className = path.node.id?.name;

    if (!className)
        raise('All classes should be named.');

    ctx.classes.register(className);

    const replaces = [];

    path.traverse({
        ClassPrivateMethod(childPath) {
            if (childPath.parentPath.parentPath != path) return;
            replaces.push(classPrivateMethod(ctx, className, childPath));
        },
        ClassMethod(childPath) {
            if (childPath.parentPath.parentPath != path) return;
            replaces.push(classMethod(ctx, className, childPath));
        },
        ClassProperty(childPath) {
            if (childPath.parentPath.parentPath != path) return;
            let result = classProperty(ctx, className, childPath);
            if (result) replaces.push(result);
        },
        ClassPrivateProperty(childPath) {
            if (childPath.parentPath.parentPath != path) return;
            let result = privateClassProperty(ctx, className, childPath);
            if (result) replaces.push(result);
        },
    });

    // TODO: finish all these types and remove this code
    for (let value of path.node.body.body) {
        switch (value.type) {
            case 'ClassMethod': break;
            case 'ClassPrivateMethod': break;
            case 'ClassProperty': break;
            case 'ClassPrivateProperty': break;
            default: raise('Unsupported class body type `' + value.type + '`');
        }
    };

    if (!ctx.classes.hasConstructor(className) && ctx.classes.hasProperties(className, false))
        replaces.unshift(t.functionDeclaration(
            t.identifier(ctx.classes.getConstructorName(className)),
            [],
            transformClassConstructorBody(ctx, className, t.blockStatement([]), path.scope, path)
        ));

    path.replaceWithMultiple(replaces);
}