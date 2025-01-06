import { objectExpression } from '@babel/types';
import * as types from './types.js';

export class ParserError extends Error {
    constructor(message, token) {
        super(message + ' at line ' + token.loc.line.start + ' (' + JSON.stringify(token) + ')');
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.length = tokens.length;
        this.body = [];
    }

    numberLiteral() {
        let tk = this.at();
        if (tk.type != 'number') return;
        this.index += 1;
        return types.NumberLiteral(tk.value, tk.loc);
    }

    stringLiteral() {
        let tk = this.at();
        if (tk.type != 'string') return;
        this.index += 1;
        return types.StringLiteral(tk.value, tk.loc);
    }

    regexLiteral() {
        let tk = this.at();
        if (tk.type != 'regex') return;
        this.index += 1;
        return types.RegexLiteral(tk.value, tk.flags, tk.loc);
    }

    booleanLiteral() {
        let tk = this.at();
        if (tk.type != 'boolean') return;
        this.index += 1;
        return types.BooleanLiteral(tk.value, tk.loc);
    }

    nullLiteral() {
        let tk = this.at();
        if (tk.type != 'identifier' || tk.value != 'null') return;
        this.index += 1;
        return types.NullLiteral(tk.loc);
    }

    undefinedLiteral() {
        let tk = this.at();
        if (tk.type != 'identifier' || tk.value != 'undefined') return;
        this.index += 1;
        return types.UndefinedLiteral(tk.loc);
    }

    voidLiteral() {
        let tk = this.at();
        if (tk.type != 'void') return;
        this.index += 1;
        return types.VoidLiteral(tk.loc);
    }

    parseLiteral() {
        let tk = this.numberLiteral();
        tk ||= this.stringLiteral();
        tk ||= this.regexLiteral();
        tk ||= this.booleanLiteral();
        tk ||= this.nullLiteral();
        tk ||= this.undefinedLiteral();
        tk ||= this.voidLiteral();
        return tk;
    }

    identifier() {
        let tk = this.at();
        if (tk.type != 'identifier') return;
        this.index += 1;
        return types.Identifier(tk.value, tk.loc);
    }

    parenExpression() {
        let tk = this.at();
        if (tk.type != 'paren' || tk.value != '(') return;
        this.index += 1;

        let expression = this.parseExpression();
        if (!expression) return;

        let end = this.at();

        if (end.type != 'paren' || end.value != ')') this.throw('Expected )', end);
        this.index += 1;

        return types.ParenExpression(expression, this.locBetween(tk, end));
    }

    /** TODO: check eof */
    arrayExpression() {
        let tk = this.at();
        if (tk.type != 'paren' || tk.value != '[') return;
        this.index += 1;

        let elements = [], next = this.at();

        while (!(next.type == 'paren' && next.value == ']')) {
            let expression = this.parseExpression();
            if (!expression) this.throw('Expected expression', this.at());
            elements.push(expression);

            next = this.at();

            if (next.type == 'paren' && next.value == ']') break;
            if (next.type != 'syntax' && next.value != ',') {
                this.throw('Expected , or ]', next);
            }

            this.index += 1;

            next = this.at();
        }

        this.index += 1;

        return types.ArrayExpression(elements, this.locBetween(tk, next));
    }

    /** may return something wrong */
    callExpression(callee) {
        if (callee) {
            switch (callee.type) {
                case 'Identifier':
                case 'ParenExpression':
                case 'CallExpression':
                    break;
                default:
                    this.throw('Expected identifier', callee);
            }
        } else {
            callee = this.identifier();
            callee ||= this.parenExpression();
            callee ||= this.callExpression();
            if (!callee) return;
        }

        let op = this.at()

        if (op.type != 'paren' || op.value != '(') {
            this.index -= 1;
            return;
        }
        this.index += 1;

        let args = [], next = this.at();

        while (next.type != 'paren' && next.value != ')') {
            let arg = this.parseExpression();
            if (!arg) this.throw('Expected expression', this.at());
            args.push(arg);

            next = this.at();

            if (next.type == 'paren' && next.value == ')') break;
            if (next.type != 'syntax' && next.value != ',') {
                this.throw('Expected , or )', next);
            }

            this.index += 1;
        }

        this.index += 1;

        return types.CallExpression(callee, args, this.locBetween(callee, next));
    }

    newExpression() {
        let tk = this.at();
        if (tk.type != 'reversed' || tk.value != 'new') return;
        this.index += 1;

        let callee = this.parseExpression();
        if (callee) return types.NewExpression(callee, undefined, this.locBetween(tk, callee));

        this.throw('Expected expression', tk);
    }

    /** may return something wrong */
    memberExpression(left) {
        if (left) {
            switch (left.type) {
                case 'Identifier':
                case 'RegexLiteral':
                case 'StringLiteral':
                case 'ArrayExpression':
                case 'CallExpression':
                case 'NewExpression':
                case 'ParenExpression':
                    break;
                default:
                    this.throw('Expected identifier', op);
            }
        } else {
            left = this.identifier();
            left ||= this.regexLiteral();
            left ||= this.stringLiteral();
            left ||= this.arrayExpression();
            left ||= this.callExpression();
            left ||= this.newExpression();
            left ||= this.parenExpression();
        }

        let op = this.at();
        if (this.eof() || op.type != 'syntax' || op.value != '.') {
            return left;
        }
        this.index += 1;

        let property = this.memberExpression() || this.identifier();
        if (!property) this.throw('Expected identifier', tk);

        return types.MemberExpression(left, property, this.locBetween(left, property));
    }

    parseExpression(left) {
        left ||= this.parseLiteral();
        left ||= this.identifier();
        left ||= this.parenExpression();
        left ||= this.arrayExpression();
        left ||= this.newExpression();

        if (!left) return;

        let op = this.at();
        if (this.eof()) return left;

        if (op.type == 'operator') {
            this.index += 1;

            let right;
            if (!this.eof()) right = this.parseExpression();

            if (left && right) return types.Operator(left, op.value, right, this.locBetween(left, right));
            else if (left) return types.Operator(left, op.value, null, this.locBetween(left, op));
            else return types.Operator(null, op.value, right, this.locBetween(op, right));
        } else if (op.type == 'syntax' && op.value == '.') {
            return this.memberExpression(left);
        } else if (op.type == 'paren' && op.value == '(') {
            return this.callExpression(left);
        }

        return left;
    }

    semicolonStatement() {
        let tk = this.at();
        if (tk.type != 'syntax' && tk.value != ';') return;
        this.index += 1;
        return true;
    }

    parseStatement() {
        let tk = this.semicolonStatement();
        return tk;
    }

    parseCode() {
        return this.parseStatement() || this.parseExpression();
    }

    start() {
        while (!this.eof()) {
            let code = this.parseCode();
            if (!code) this.throw('Unexpected token', this.at());
            if (code.type) this.body.push(code);
        }
    }

    eof() {
        return this.index >= this.length;
    }

    at(index) {
        return this.tokens[this.index + (index || 0)];
    }

    locBetween(start, end) {
        if (!start || !end) {
            console.log('WARNING: Failed to get location between', start, 'and', end);
            return types.Location(0, 0, 0, 0);
        }
        return types.Location(start.loc.position.start, end.loc.position.end, start.loc.line.start, end.loc.line.end);
    }

    throw(msg, token) {
        throw new ParserError(msg, token);
    }
}

export default function parse(tokens) {
    const parser = new Parser(tokens);
    parser.start();
    return types.CodeStatement(parser.body, parser.locBetween(tokens[0], tokens[tokens.length - 1]));
}