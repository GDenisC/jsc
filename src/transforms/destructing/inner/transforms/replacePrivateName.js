import t from '@babel/types';
import traverse from '@babel/traverse';

export const visitor = function PrivateName(expr) {
	expr.replaceWith(t.identifier('private_' + expr.node.id.name));
}

/** @param {t.Node} node */
export const nodeReplacePrivateName = function (node, scope, parentPath) {
	// see ./replaceThis.js
	traverse.default(node, { PrivateName: visitor }, scope, null, parentPath);
}