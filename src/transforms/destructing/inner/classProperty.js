import t from '@babel/types';
import { raise } from '../error.js';

/**
 * @param {import('../../class-destructing.js').ClassDestructing} ctx
 * @param {import('@babel/core').NodePath<t.ClassProperty>} path
 */
export const classProperty = function(ctx, className, path) {
	const node = path.node;

	if (!t.isIdentifier(node.key))
		raise('All class properties should be named');

	let name = ctx.classes.add(className, node);
	// see ./functions/constructor.js

	if (!node.static) return null;

	return t.variableDeclaration(
		ctx.options.variableKind,
		[t.variableDeclarator(
			t.identifier(name),
			node.value
		)]
	);
}