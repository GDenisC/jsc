import t from '@babel/types';
import { raise } from '../error.js';
import { classProperty } from './classProperty.js';

/**
 * @param {import('../../class-destructing.js').ClassDestructing} ctx
 * @param {import('@babel/core').NodePath<t.PrivateClassProperty>} path
 */
export const privateClassProperty = function (ctx, className, path) {
	const node = path.node;

	if (!t.isPrivateName(node.key))
		raise('All private class properties should be named');

	// see ./privateClassMethod.js
	path.node = t.classProperty(
		t.identifier('private_' + node.key.id.name),
		node.value,
		node.typeAnnotation,
		node.decorators,
		node.computed,
		node.static
	);

	return classProperty(ctx, className, path);
}