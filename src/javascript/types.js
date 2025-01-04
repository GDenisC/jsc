export function Location(posStart, posEnd, lineStart, lineEnd) {
    return {
        position: {
            start: posStart,
            end: posEnd
        },
        line: {
            start: lineStart,
            end: lineEnd
        }
    };
}

export const operators = [
    '+', '-', '*', '/', '%', '**',
    '==', '!=', '===', '!==',
    '>', '>=', '<', '<=',
    '&', '|', '^', '>>', '>>>', '<<', '<<<',
    '&&', '||',
    '!',
    '++', '--',
    '+=', '-=', '*=', '/=', '%=', '**=',
    '&=', '|=', '^=', '>>=', '>>>=', '<<=',
    '&&=', '||=',
];

// Literals

/** `-?(n | n.n | Infinity | NaN)` */
export function NumberLiteral(value, loc) {
    return { type: 'NumberLiteral', value, loc };
}

/** `"..."` | `'...'` */
export function StringLiteral(value, loc) {
    return { type: 'StringLiteral', value, loc };
}

/** `/{value}/{flags}` */
export function RegexLiteral(value, flags, loc) {
    return { type: 'RegexLiteral', value, flags, loc };
}

/** `true` | `false` */
export function BooleanLiteral(value, loc) {
    return { type: 'BooleanLiteral', value, loc };
}

/** `null` */
export function NullLiteral(loc) {
    return { type: 'NullLiteral', loc };
}

/** `undefined` */
export function UndefinedLiteral(loc) {
    return { type: 'UndefinedLiteral', loc };
}

// Expressions

/** `[_w][_wn]` */
export function Identifier(name, loc) {
    return { type: 'Identifier', name, loc };
}

/** `this` */
export function ThisExpression(loc) {
    return { type: 'ThisExpression', loc };
}

/** `{left}{operator}{right}` | `{left}{operator}` | `{operator}{right}` */
export function Operator(left, operator, right, loc) {
    return { type: 'Operator', left, operator, right, loc };
}

/** `({expression})` */
export function ParenExpression(expression, loc) {
    return { type: 'ParenExpression', expression, loc };
}

/** `{object}.{property}` */
export function MemberExpression(object, property, loc) {
    return { type: 'MemberExpression', object, property, loc };
}

/** `[]` | `[...]` | `[..., ...]` */
export function ArrayExpression(elements, loc) {
    return { type: 'ArrayExpression', elements, loc };
}

/** `{callee}(..., ...)`, `callee` is an ast */
export function CallExpression(callee, args, loc) {
    return { type: 'CallExpression', callee, args, loc };
}

/** `new {callee}` | `new {callee}(..., ...)`, `callee` is an ast */
export function NewExpression(callee, args, loc) {
    return { type: 'NewExpression', callee, args, loc };
}

/** `{}` | `{...}`, `properties` is an array of `ObjectProperty` */
export function ObjectExpression(properties, loc) {
    return { type: 'ObjectExpression', properties, loc };
}

/** {key}: {value}, `key` and `value` are an ast */
export function ObjectProperty(key, value, loc) {
    return { type: 'ObjectProperty', key, value, loc };
}

/** `{test} ? {consequent} : {alternate}` */
export function TernaryExpression(test, consequent, alternate, loc) {
    return { type: 'TernaryExpression', test, consequent, alternate, loc };
}

// Statements

/** `;` */
export function SemicolonStatement(loc) {
    return { type: 'SemicolonStatement', loc };
}

/** `return {value}` | `return` */
export function ReturnStatement(value, loc) {
    return { type: 'ReturnStatement', value, loc };
}

/** `break` */
export function BreakStatement(loc) {
    return { type: 'BreakStatement', loc };
}

/** `continue` */
export function ContinueStatement(loc) {
    return { type: 'ContinueStatement', loc };
}

/** `{}` | `{...}` */
export function BlockStatement(block, loc) {
    return { type: 'BlockStatement', block, loc };
}

/** `if ({test}) {consequent} [else {alternate}]` */
export function IfStatement(test, consequent, alternate, loc) {
    return { type: 'IfStatement', test, consequent, alternate, loc };
}

/** `for ({init}; {test}; {update}) {body}` */
export function ForStatement(init, test, update, body, loc) {
    return { type: 'ForStatement', init, test, update, body, loc };
}

/** `for ({left} in {right})` */
export function ForInStatement(left, right, body, loc) {
    return { type: 'ForInStatement', left, right, body, loc };
}

/** `for ({left} of {right})` */
export function ForOfStatement(left, right, body, loc) {
    return { type: 'ForOfStatement', left, right, body, loc };
}

/** `while ({test}) {body}` */
export function WhileStatement(test, body, loc) {
    return { type: 'WhileStatement', test, body, loc };
}

/** `do {body} while ({test})` */
export function DoWhileStatement(test, body, loc) {
    return { type: 'DoWhileStatement', test, body, loc };
}

/** `switch ({discriminant}) {cases}` */
export function SwitchStatement(discriminant, cases, loc) {
    return { type: 'SwitchStatement', discriminant, cases, loc };
}

/** `case {test}: {body}` */
export function SwitchCase(test, body, loc) {
    return { type: 'SwitchCase', test, body, loc };
}

/** `default: {body}` */
export function SwitchDefault(body, loc) {
    return { type: 'SwitchDefault', body, loc };
}

/** `{kind} {name}` | `{kind} {name} = {value}`, `name` is an string */
export function VariableDeclaration(kind, name, value, loc) {
    return { type: kind ? 'VariableDeclaration' : 'VarDecl', kind, name, value, loc };
}

/** `{kind} {}, {}, ...` | `{kind} {} = {}, {}, {} = {}, ...`, `declarations` is an array of `VariableDeclaration` (`kind` must be undefined) */
export function VariableDeclarations(kind, declarations, loc) {
    return { type: 'VariableDeclarations', kind, declarations, loc };
}

/** `function {name}({params}) {body}` */
export function FunctionDeclaration(name, params, body, loc) {
    return { type: 'FunctionDeclaration', name, params, body, loc };
}

/** `class {name} [extends {superClass}] {body}`, `name` must be `Identifier`, `superClass` must be undefined or a reference to `Identifier` */
export function ClassDeclaration(name, body, superClass, loc) {
    return { type: 'ClassDeclaration', name, body, superClass, loc };
}

/** `[static] {name}({params}) {body}` */
export function ClassMethod(name, params, body, isStatic, loc) {
    return { type: 'ClassMethod', name, params, body, isStatic, loc };
}

//(?) [static] {name} = {value}

export function CodeStatement(body, loc) {
    return { type: 'CodeStatement', body, loc };
}