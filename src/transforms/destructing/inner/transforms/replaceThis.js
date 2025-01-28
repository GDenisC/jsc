import t from '@babel/types';
import traverse from '@babel/traverse';

export const visitors = {
    ThisExpression(expr) {
        expr.replaceWith(t.identifier('self'));
    }
};

/** @param {t.Node} node */
export const nodeReplaceThis = function(node, scope, parentPath) {
    // babel???
    traverse.default(node, visitors, scope, null, parentPath);
}