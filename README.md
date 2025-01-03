# JavaScript Compiler

## `-S` `--struct`

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

## `-P` `--precalc`

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

## `-UG` `--un-global`

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
/** @inline */ function randomInt(x) {
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
/** @macro */
const PI = 3.14;

/** @macro */
function LOG(a) {
    console.log(a);
}

LOG(PI);
```
```js
console.log(3.14);
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

## `--stack`

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

## `-R` `--registers`

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

## `-B` `bytecode`
bytecode build
- less size
- can be slower than js
- fast build

## `-A` `--asm`
ASM.js build
- same size
- a bit faster than js
- fast build

## `-W` `--wasm`
WASM build
- less size
- much faster than js
- slow build

# Checklist

- [ ] JavaScript reader

- [ ] `--struct`

- [ ] `--precalc`

- [ ] `--un-global`

- [ ] `@inline`

- [ ] `@macro`

- [ ] `@const`

- [ ] `--stack`

- [ ] `--registers`

- [ ] `--bytecode`

- [ ] `--asm`

- [ ] `--wasm`