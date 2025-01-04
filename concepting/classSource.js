class Foo {
	static instances = [];
	static #tickId = 0;
	static #defaultName = 'Unknown Foo';

	static get defaultName () {
		return Foo.#defaultName;
	}
	static set defaultName (name) {
		if ('string' !== typeof name) {
			throw new TypeError('defaultName must be assigned to a string! provided type: ' + typeof name);
		}
		Foo.#defaultName = name;
	}

	static count () {
		return Foo.instances.length;
	}

	#id = 0;
	constructor (name) {
		this.name = name ?? Foo.#defaultName;
		this.#id = Foo.#tickId++;
		Foo.instances.push(this);
	}

	get id () {
		return this.#id;
	}
	set id (_) {
		throw new Error('cannot redefine id!');
	}

	rename (name) {
		this.name = name;
	}
}


const foo1 = new Foo(),
	foo2 = new Foo('Bar');

console.log(`spawned ${foo1.name} and ${foo2.name} with the IDs ${foo1.id} and ${foo2.id}`);

console.log(`Current default name: ${Foo.defaultName}`);
Foo.defaultName = 'Well Known Foo';
console.log(`current count of Foo instances: ${Foo.count()}`);

foo1.rename('First Foo');
console.log(`renamed Foo of ID ${foo1.id} to ${foo1.name}`);

const foo3 = new Foo();
console.log(`spawned ${foo3.name}`);
console.log(`new count of Foo instances: ${Foo.count()}`);
console.log(Foo.instances);