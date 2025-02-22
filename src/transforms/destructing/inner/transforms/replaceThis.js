import t from '@babel/types';
import traverse from '@babel/traverse';

export const visitor = function ThisExpression(expr) {
	expr.replaceWith(t.identifier('self'));
}

/** @param {t.Node} node */
export const nodeReplaceThis = function (node, scope, parentPath) {
	// babel???
	traverse.default(node, { ThisExpression: visitor }, scope, null, parentPath);
}