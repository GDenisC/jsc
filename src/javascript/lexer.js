import { Location } from './types.js';

const operators = [
    '+', '-', '*', '/', '%', '**',
    '==', '!=', '===', '!==',
    '>', '>=', '<', '<=',
    '&', '|', '^', '>>', '>>>', '<<', '<<<',
    '&&', '||',
    '!', '~',
    '++', '--',
    '+=', '-=', '*=', '/=', '%=', '**=',
    '&=', '|=', '^=', '>>=', '>>>=', '<<=',
    '&&=', '||='
];

const code_A = 'A'.charCodeAt(0);
const code_Z = 'Z'.charCodeAt(0);
const code_a = 'a'.charCodeAt(0);
const code_z = 'z'.charCodeAt(0);
const code_0 = '0'.charCodeAt(0);
const code_9 = '9'.charCodeAt(0);

class Lexer {
    constructor(code) {
        this.code = code;
        this.length = this.code.length;
        this.index = 0 | 0;
        this.column = 1 | 0;
        this.tokens = [];
    }

    whitespace() {
        while (!this.eof()) {
            switch (this.at()) {
                case '\n':
                    this.column += 1;
                case ' ':
                case '\t':
                case '\r':
                    this.index += 1;
                    break;
                default:
                    return;
            }
        }
    }

    operator() {
        let str = '';

        while (true) {
            let char = this.at();
            if (this.eof()) char = '';
            switch (char) {
                case '+': str += '+'; break;
                case '-': str += '-'; break;
                case '*': str += '*'; break;
                case '/': str += '/'; break;
                case '%': str += '%'; break;
                case '=': str += '='; break;
                case '>': str += '>'; break;
                case '<': str += '<'; break;
                case '&': str += '&'; break;
                case '|': str += '|'; break;
                case '^': str += '^'; break;
                case '~': str += '~'; break;
                case '!': str += '!'; break;
                default:
                    if (str.length == 0)
                        return;
                    else if (operators.includes(str))
                        return {
                            type: 'operator',
                            value: str,
                            loc: this.loc(this.index - str.length - 1, this.index - 1)
                        };
                    else
                        throw new Error('Unknown operator: ' + str);
            }

            this.index += 1;
        }
    }

    identifier() {
        let value = '',
            char = this.at(),
            code = char.charCodeAt(0);

        if (char == '$' || char == '_' || (code >= code_A && code <= code_Z) || (code >= code_a && code <= code_z)) {
            value += char;
            this.index += 1;
        } else {
            return;
        }

        while (!this.eof()) {
            char = this.at();
            code = char.charCodeAt(0);
            if (char == '$' ||
                char == '_' ||
                (code >= code_A && code <= code_Z) ||
                (code >= code_a && code <= code_z) ||
                (code >= code_0 && code <= code_9)) {
                value += char;
                this.index += 1;
            } else {
                break;
            }
        }

        return {
            type: 'identifier',
            value,
            loc: this.loc(this.index - value.length - 1, this.index - 1)
        };
    }

    number() {
        let str = '';

        while (true) {
            if (this.eof()) break;
            let char = this.at(),
                code = char.charCodeAt(0);
            if (char == '.' || (code >= code_0 && code <= code_9)) {
                str += char;
                this.index += 1;
            } else {
                break;
            }
        }

        if (str) {
            return {
                type: 'number',
                value: Number(str),
                loc: this.loc(this.index - str.length - 1, this.index - 1)
            };
        }
    }

    string() {
        let char = this.at(),
            string = '';

        if (char == '"') string = '"';
        else if (char == "'") string = "'";
        else return;

        this.index += 1;

        let value = '',
            escape = false;

        while (true) {
            if (this.eof())
                throw new Error('Unterminated string');

            char = this.at();

            if (char == '\n') {
                throw new Error('Unterminated string');
            } else if (escape) {
                escape = false;
                value += char;
            } else if (char == '\\') {
                escape = true;
            } else if (char == string) {
                this.index += 1;
                return {
                    type: 'string',
                    value,
                    loc: this.loc(this.index - value.length - 2, this.index - 2)
                };
            } else {
                value += char;
            }

            this.index += 1;
        }
    }

    boolean() {
        let value;

        if (this.at() == 't' && this.at(1) == 'r' && this.at(2) == 'u' && this.at(3) == 'e') {
            value = true;
        } else if (this.at() == 'f' && this.at(1) == 'a' && this.at(2) == 'l' && this.at(3) == 's' && this.at(4) == 'e') {
            value = false;
        } else {
            return;
        }

        this.index += value.length;

        return {
            type: 'boolean',
            value,
            loc: this.loc(this.index - value.length - 1, this.index - 1)
        };
    }

    regex() {
        let char = this.at();

        if (char != '/') return;

        this.index += 1;

        let value = '',
            escaped = false;

        while (true) {
            if (this.eof())
                throw new Error('Unterminated regex');

            char = this.at();

            if (char == '\n') {
                throw new Error('Unterminated regex');
            } else if (escaped) {
                escaped = false;
                value += char;
            } else if (char == '\\') {
                this.index += 1;
                escaped = true;
            } else if (char == '/') {
                this.index += 1;
                break;
            } else {
                value += char;
            }

            this.index += 1;
        }

        let flag = '';

        while (true) {
            if (this.eof()) break;

            let char = this.at();

            if (char != 'g' && char != 'i' && char != 'm') break;

            flag += char;
            this.index += 1;
        }

        return {
            type: 'regex',
            value,
            flag,
            loc: this.loc(this.index - value.length - 1, this.index - 1)
        }
    }

    next() {
        let t;
        t ||= this.whitespace();
        t ||= this.identifier();
        t ||= this.number();
        t ||= this.string();
        t ||= this.boolean();
        t ||= this.regex();
        t ||= this.operator();
        return t;
    }

    start() {
        let lock = 0;

        while (!this.eof()) {
            let tk = this.next();
            if (tk) {
                this.tokens.push(tk);
                lock = 0;
            } else if (++lock > 1000) {
                throw new Error('Lexer stuck');
            }
        }
    }

    eof() {
        return this.index >= this.length;
    }

    at(index) {
        return this.code[this.index + (index || 0)];
    }

    loc(start, end) {
        return Location(start, end, this.column, this.column);
    }
}

function lex(code) {
    const lexer = new Lexer(code);
    lexer.start();
    return lexer.tokens;
}

export default lex;