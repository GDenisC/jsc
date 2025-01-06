function generate(type, noSemicolon) {
    if (!type)
        throw new Error('type must not be falsy');

    if (typeof type.type != 'string')
        throw new Error('type must be a string but got ' + type.type + ' (' + JSON.stringify(type) + ')');

    const semicolon = noSemicolon ? '' : ';';

    switch (type.type) {
        case 'NumberLiteral': return type.value + semicolon;
        case 'StringLiteral': return '"' + type.value + '"' + semicolon;
        case 'RegexLiteral': return '/' + type.value + '/' + type.flags + semicolon;
        case 'BooleanLiteral': return type.value + semicolon;
        case 'NullLiteral': return 'null' + semicolon;
        case 'UndefinedLiteral': return 'undefined' + semicolon;
        case 'VoidLiteral': return 'void' + semicolon;
        case 'Identifier': return type.name + semicolon;
        case 'Operator': return (type.left ? generate(type.left, true) : '') + type.operator + (type.right ? generate(type.right, true) : '') + semicolon;
        case 'ParenExpression': return '(' + generate(type.expression, true) + ')' + semicolon;
        case 'MemberExpression': return generate(type.object, true) + '.' + generate(type.property, true) + semicolon;
        case 'ArrayExpression': return '[' + generateArray(type.elements, true).join(',') + ']' + semicolon;
        case 'CallExpression': return generate(type.callee, true) + '(' + generateArray(type.args, true).join(',') + ')' + semicolon;
        case 'NewExpression': return 'new ' + generate(type.callee, true) + (type.args ? '(' + generateArray(type.args, true).join(',') + ')' : '') + semicolon;
        case 'ObjectExpression': return '{' + generateArray(type.properties, true).join(',') + '}' + semicolon;
        case 'ObjectProperty': return generate(type.key, true) + ':' + generate(type.value, true);
        case 'TernaryExpression': return generate(type.consequent, true) + '?' + generate(type.alternate, true) + ':' + generate(type.test, true) + semicolon;
        case 'AwaitExpression': return 'await ' + generate(type.argument, true) + semicolon;
        case 'YieldExpression': return 'yield ' + generate(type.argument, true) + semicolon;
        case 'TypeofExpression': return 'typeof ' + generate(type.expression, true) + semicolon;
        case 'InstanceofExpression': return generate(type.left, true) + ' instanceof ' + generate(type.right, true) + semicolon;
        case 'DeleteExpression': return 'delete ' + generate(type.argument, true) + semicolon;
        case 'AsExpression': return generate(type.left, true) + ' as ' + generate(type.right, true) + semicolon;
        case 'ImportStatement': return 'import' + (type.defaultExport ? ' ' + generate(type.defaultExport, true) + (type.exports ? ',' : ' ') : '') + (type.exports ? '{' + generateArray(type.exports, true).join(',') + '}' : '') + (type.defaultExport || type.exports ? 'from ' : '') + generate(type.moduleName, true) + semicolon;
        case 'ExportStatement': return 'export ' + (type.isDefault ? 'default ' : '') + generate(type.argument, true) + semicolon;
        case 'SemicolonStatement': return semicolon;
        case 'ReturnStatement': return 'return' + (type.argument ? ' ' + generate(type.argument, true) : '') + semicolon;
        case 'BreakStatement': return 'break' + semicolon;
        case 'ContinueStatement': return 'continue' + semicolon;
        case 'BlockStatement': return '{' + generateArray(type.block, false).join('') + '}';
        case 'IfStatement': return 'if(' + generate(type.test, true) + ')' + generate(type.consequent, false) + (type.alternate ? ' else ' + generate(type.alternate, false) : '');
        case 'ForStatement': return 'for(' + (type.init ? generate(type.init, true) : '') + ';' + (type.test ? generate(type.test, true) : '') + ';' + (type.update ? generate(type.update, true) : '') + ')' + generate(type.body, false);
        case 'ForInStatement': return 'for(' + generate(type.left, true) + ' in ' + generate(type.right, true) + ')' + generate(type.body, false);
        case 'ForOfStatement': return 'for(' + generate(type.left, true) + ' of ' + generate(type.right, true) + ')' + generate(type.body, false);
        case 'WhileStatement': return 'while(' + generate(type.test, true) + ')' + generate(type.body, false);
        case 'DoWhileStatement': return 'do ' + generate(type.body, false) + ' while(' + generate(type.test, true) + ')';
        case 'SwitchStatement': return 'switch(' + generate(type.discriminant, true) + ')' + generateArray(type.cases, false).join('');
        case 'SwitchCase': return 'case ' + generate(type.test, true) + ':' + generateArray(type.consequent, false).join('');
        case 'SwitchDefault': return 'default:' + generateArray(type.body, false).join('');
        case 'VariableDeclaration': return type.kind + ' ' + type.name + (type.value ? '=' + generate(type.value, true) : '') + semicolon;
        case 'VarDecl': return type.name + (type.value ? '=' + generate(type.value, true) : '');
        case 'VariableDeclarations': return type.kind + ' ' + generateArray(type.declarations, true).join(',') + semicolon;
        case 'FunctionDeclaration': return (type.isAsync ? 'async ' : '') + 'function' + (type.isGenerator ? '*' : '') + (type.name ? (type.isGenerator ? '' : ' ') + type.name : '') + '(' + generateArray(type.params, true).join(',') + ')' + generate(type.body, false);
        case 'ClassDeclaration': return 'class ' + generate(type.name, true) + (type.superClass ? ' extends ' + generate(type.superClass, true) : '') + generate(type.body, false);
        case 'ClassMethod': return (type.isAsync ? 'async ' : '') + (type.isStatic ? 'static ' : '') + type.name + '(' + generateArray(type.params, true).join(',') + ')' + generate(type.body, false);
        case 'CodeStatement': return generateArray(type.body, false).join('');
        default: throw new Error(type.type + ' is not implemented (' + type + '}');
    }
}

function generateArray(typeArray, noSemicolon) {
    let result = [],
        length = typeArray.length,
        i = length + 1;

    while (--i) {
        result.push(generate(typeArray[length - i], noSemicolon));
    }

    return result;
}

export default generate;