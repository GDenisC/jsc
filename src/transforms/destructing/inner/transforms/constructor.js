import t from '@babel/types';
import { nodeReplaceThis } from './replaceThis.js';

/**
 * @param {import('../../../class-destructing.js').ClassDestructing} ctx
 * @param {t.BlockStatement} node
 */
export const transformClassConstructorBody = function (ctx, className, node, scope, parentPath) {
	const objectProperties = [],
		body = [];

	for (const prop of ctx.classes.getProperties(className)) {
		if (prop.static) continue;

		let isLiteral = t.isLiteral(prop.value),
			name = prop.key.name;

		objectProperties.push(t.objectProperty(
			t.identifier(name),
			isLiteral ? prop.value : t.nullLiteral()
		));

		if (isLiteral) continue;

		// self.{prop} = ...;
		const node = t.expressionStatement(
			t.assignmentExpression(
				'=',
				t.memberExpression(t.identifier('self'), t.identifier(name)),
				prop.value
			)
		);

		nodeReplaceThis(node, scope, parentPath);

		body.push(node);
	}

	// var self = { ... };
	node.body.unshift(
		t.variableDeclaration(
			ctx.options.variableKind,
			[t.variableDeclarator(
				t.identifier('self'),
				t.objectExpression(objectProperties)
			)]
		),
		...body
	);

	// ...

	// return self;
	node.body.push(t.returnStatement(t.identifier('self')));

	return node;
}