# JavaScript Compiler

## Checklist

- [x] JavaScript reader - babel

- [ ] [Class Destructuring (WIP)](https://github.com/GDenisC/jsc/issues/1)

- [ ] Precalculation

- [ ] Unglobalization

- [ ] `@inline`

- [ ] `@macro`

- [ ] `@const`

- [ ] Stack

- [ ] Registers

- [ ] Bytecode

- [ ] ASM.js

- [ ] WASM

## [Class Destructuring](https://github.com/GDenisC/jsc/issues/1)

Converts a Class declaration into a series of equivalent function declarations.
Only works with top-level classes.

- V8 optimizations
- Better code compression results

### Example 1

```js
class Foo {
    constructor() {
        this.x = 1;
    }

    get x() {
        return this.x;
    }
}

console.log(new Foo().x);
```

```js
function Foo_constructor() {
    /* or just return { x: 1 } */
    var self = {};
    self.x = 1;
    return self;
}

function Foo_get_x(self) {
    return self.x;
}

console.log(Foo_get_x(Foo_constructor()));
```

### Example 2

```js
class Foo {
    getHelloString() {
        return 'hello';
    }
}

class Bar extends Foo {
    getHelloString() {
        return super.getHelloString() + ' world';
    }
}

console.log(new Bar().getHelloString());
```

```js
function Foo_getHelloString(self) {
    return 'hello';
}
function Bar_getHelloString(self) {
    return Foo_getHelloString(self) + ' world';
}

console.log(Bar_getHelloString({}));
```

## Precalculation

```js
function foo(x) {
    return Math.sqrt(x * x + x * x) + 60 * 2 - 20;
}
```

```js
function foo(x) {
    var _0 = x * x;
    return Math.sqrt(_0 + _0) + 100;
}
```

## Unglobalization

- Patches some hooking techniques (replacing a function/method with a malicious clone)
- Better code compression results

```js
function randomInt(x) {
    return Math.floor(Math.random() * x);
}
```

```js
var Math_floor = Math.floor,
    Math_random = Math.random;
function randomInt(x) {
    return Math_floor(Math_random() * x);
}
```

## `@inline`

functions and class methods

```js
/** @inline */
function randomInt(x) {
    return Math.floor(Math.random() * x);
}

randomInt(10);
randomInt(20);
```

```js
Math.floor(Math.random() * 10);
Math.floor(Math.random() * 20);
```

## `@macro`

```js
//@macro if DEBUG
function log(message) {
    console.log(message);
}
//@macro else
function log(_) {}
//@macro endif

log('Hello!');
```

> ```js
> //@macro set DEBUG 1
> ```

```js
function log(message) {
    console.log(message);
}

log('Hello!');
```

> ```js
> //@macro set DEBUG 0
> ```

```js
function log(_) {}

log('Hello!');
```

## `@const`

Variable that will be evaluated at compile time

```js
/** @const */
const ARR = [1, 10, 100, 1000];

/** @const */
const WORD = (() => {
    let words = ['answer is ', 'answer = ', 'hello, '];
    return words[Math.floor(Math.random() * words.length)];
})();

console.log(WORD + ARR[2] * ARR[3]);
```

if i run the program 3 times:

```js
console.log('answer is ' + 100 * 1000);
```

```js
console.log('answer = ' + 100 * 1000);
```

```js
console.log('hello, ' + 100 * 1000);
```

## Stack

```js
function random(min, max) {
    return min + Math.random() * (max - min);
}

console.log(random(10, 20));
```

```js
var __stack = [];
function random() {
    __stack.push(__stack[__stack.length - 1] + Math.random() * (__stack[__stack.length - 2] - __stack.pop()));
    __stack.pop();
}
__stack.push(10 /* min */, 20 /* max */);
random();
console.log(__stack.pop());
```

## Registers

Recursion is not supported

```js
function random(min, max) {
    return min + Math.random() * (max - min);
}

console.log(random(10, 20));
```

```js
var reg0, reg1;
function random() {
    reg0 = reg0 + Math.random() * (reg1 - reg0);
}
reg0 = 10 /* min */;
reg1 = 20 /* max */;
random();
// reg1 is "released"
console.log(reg0);
```

## Bytecode build

- less size
- can be slower than js
- fast build

## ASM.js build

- more size
- a bit faster than js
- fast build

## WASM build

- less size
- much faster than js
- slow build
