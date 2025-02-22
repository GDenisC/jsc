import t from '@babel/types';
import traverse from '@babel/traverse';
import { visitor as PrivateName } from './replacePrivateName.js'
import { visitor as ThisExpression } from './replaceThis.js'

/**
 * @param {import('../../../class-destructing.js').ClassDestructing} ctx
 * @param {(t.Identifier | t.AssignmentPattern)[]} params
 */
export const transformParams = function (ctx, params, scope, parentPath) {
    for (let i = 0, l = params.length; i < l; ++i) {
        let node = params[i];

        if (!t.isAssignmentPattern(node)) continue;

        traverse.default(node.right, { PrivateName, ThisExpression }, scope, null, parentPath);
    }

    return params;
}