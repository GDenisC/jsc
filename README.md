# JavaScript Compiler

## `-S` `--struct`

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
    var self = {};
    self.x = 1;
    return self;
}

function Foo_get_x(self) {
    return self.x;
}

console.log(Foo_get_x(Foo_constructor()));
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

## `-G` `--global`

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

## `-A` `--asm`
ASM.js build

## `-W` `--wasm`
WASM build

# Checklist

- [ ] `--struct`

- [ ] `--precalc`

- [ ] `--global`

- [ ] `@inline`

- [ ] `--stack`

- [ ] `--registers`

- [ ] `--asm`

- [ ] `--wasm`