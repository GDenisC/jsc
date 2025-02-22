import t from '@babel/types';
import { raise } from '../error.js';
import { classMethod } from './classMethod.js';

/**
 * @param {import('../../class-destructing.js').ClassDestructing} ctx
 * @param {import('@babel/core').NodePath<t.ClassPrivateMethod>} path
 */
export const classPrivateMethod = function (ctx, className, path) {
	const node = path.node,
		key = node.key;

	if (!t.isPrivateName(key))
		return raise('All private class methods should be named');

	// don't use path.replaceWith cuz babel will call traverse -> ClassMethod (see ./classDeclaration.js)
	path.node = t.classMethod(
		'method',
		t.identifier('private_' + key.id.name),
		node.params,
		node.body,
		node.computed,
		node.static,
		node.generator,
		node.async
	);

	return classMethod(ctx, className, path);
}