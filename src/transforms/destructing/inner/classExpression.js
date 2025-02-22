import t from '@babel/types';
import { classDeclaration } from './classDeclaration.js';

/**
 * @param {import('../../class-destructing.js').ClassDestructing} ctx
 * @param {import('@babel/core').NodePath<import('@babel/types').ClassExpression>} path
 */
export const classExpression = function (ctx, path) {
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

	return classDeclaration(ctx, classPath);
}