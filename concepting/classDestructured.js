// NAME TEMPLATE
//
// OLD:
// [classname]_(public/private)_(static/instance)_(method/getter/setter/property)_[attributename]_{rng}
//
// NEW:
// {classname}[_static][_(get|set)][_private]_{methodname}[_{i}]
// [] = conditionally applies

let Foo_static_instances = [];
let Foo_static_private_tickId = 0;
let Foo_static_private_defaultName = 'Unknown Foo';

function Foo_static_get_defaultName() {
	return Foo_static_private_defaultName;
}
function Foo_static_set_defaultName(name) {
	if ('string' !== typeof name) {
		throw new TypeError('defaultName must be assigned to a string! provided type: ' + typeof name);
	}
	Foo_static_private_defaultName = name;
}

function Foo_static_count() {
	return Foo_static_instances.length;
}

let Foo_static_private_id = 0;
function Foo_constructor(name = Foo_static_private_defaultName) {
	const self = {};
	self.name = name;
	self.Foo_static_private_id = Foo_static_private_tickId++;
	Foo_static_instances.push(self);
	return self;
}

function Foo_get_id(self) {
	return self.Foo_static_private_id;
}
function Foo_set_id(self, _) {
	throw new Error('cannot redefine id!');
}

function Foo_rename(self, name) {
	self.name = name;
}


const foo1 = Foo_constructor(),
	foo2 = Foo_constructor('Bar');

console.log(`spawned ${foo1.name} and ${foo2.name} with the IDs ${Foo_get_id(foo1)} and ${Foo_get_id(foo2)}`);

console.log(`Current default name: ${Foo_static_get_defaultName()}`);
Foo_static_set_defaultName('Well Known Foo');
console.log(`current count of Foo instances: ${Foo_static_count()}`);

Foo_rename(foo1, 'First Foo');
console.log(`renamed Foo of ID ${Foo_get_id(foo1)} to ${foo1.name}`);

const foo3 = Foo_constructor();
console.log(`spawned ${foo3.name}`);
console.log(`new count of Foo instances: ${Foo_static_count()}`);
console.log(Foo_static_instances);