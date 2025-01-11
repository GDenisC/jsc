import EventEmitter from 'node:events';

class IllegalAssignmentError extends Error {
	constructor (propname, extra) {
		let message = `Cannot assign to ${propname}!`;
		if (extra) message += '\n' + extra;
		super(message);
	}
}

class Entity extends EventEmitter {
	static #instanceMap = new Map();

	static get instanceCount () { return Entity.#instanceMap.size }
	static set instanceCount (_) { throw new IllegalAssignmentError('instancesArray') }

	static getInstance (id) {
		return Entity.#instanceMap.get(id);
	}
	static getAllInstances () {
		return Entity.#instanceMap.values();
	}

	#id = 0;
	constructor () {
		super();
		this.#id = Entity.instanceCount;
		Entity.#instanceMap.set(this.id, this);
	}

	get isPlayer () { return false }
	set isPlayer (_) { throw new IllegalAssignmentError('isPlayer') }

	get id () { return this.#id }
	set id (_) { throw new IllegalAssignmentError('id') }

	tick () {
		this.emit('tick');
	}
}

class Player extends Entity {
	static #defaultName = 'unnamed';

	static get defaultName () {
		return Player.#defaultName;
	}
	static set defaultName (name) {
		Player.invalidateName(name);
		Player.#defaultName = name;
	}

	static get instanceCount () { return Entity.getAllInstances().toArray().length }
	// setter error thrower already inherited

	static invalidateName (name) {
		if ('string' !== typeof name) {
			throw new TypeError('name must be a string! provided type: ' + typeof name);
		}
		if (name.length === 0) {
			throw new TypeError('name must not be empty!');
		}
	}

	static getAllInstances () {
		return Entity.getAllInstances().filter(entity => entity.isPlayer);
	}

	#name = '';
	constructor (name = Player.#defaultName) {
		Player.invalidateName(name);
		super();
		this.#name = name;
		this.hp = 1;
		this.hpmax = 10;
	}

	get isPlayer () { return true }
	// setter error thrower already inherited

	get name () { return this.#name }
	set name (_) { throw new IllegalAssignmentError('name', 'Use .rename()!') }

	get hpFilledPercent () { return this.hp / this.hpmax }
	set hpFilledPercent (_) { throw new IllegalAssignmentError('hpFilledPercent') }

	get dead () { return this.hp <= 0 }
	set dead (_) { throw new IllegalAssignmentError('dead') }

	rename (name, fireEvent = true) {
		Player.invalidateName(name);
		if (fireEvent) this.emit('rename', { oldName: this.#name, newName: name })
		this.#name = name;
	}

	hurt (hitpoints) {
		this.hp -= hitpoints;
		this.emit('hurt', hitpoints);
		return this.dead;
	}

	tick () {
		super.tick();
		if (this.hp < this.hpmax) {
			this.hp++;
		}
	}
}


for (let adjective of ['first', 'second', 'third']) {
	let entity = new Entity();
	entity.on('tick', () => {
		console.log(`ticked the ${adjective} entity!`);
	});
}

new Player('Albert');
new Player('Bolbert');
new Player('Calbert');
new Player('Dullbert');
new Player('Elbert');

for (let entity of Entity.getAllInstances()) entity.tick();
for (let i = 0; i < 9; i++) for (let player of Player.getAllInstances()) player.tick();

const bookReference = Entity.getInstance(Entity.instanceCount - 1);
if (!bookReference.isPlayer) throw new TypeError('what the fuck just happened');
bookReference.rename('Ted');
bookReference.on('hurt', hitpoints => bookReference.hp += hitpoints);
setInterval(() => {
	bookReference.hurt(-99999);
	console.log('is', bookReference.name, 'dead?', bookReference.dead);
	console.log('Health:', (bookReference.hpFilledPercent * 100).toFixed(2) + '%');
}, 1000);

for (let entity of Entity.getAllInstances()) {
	let head = `Entity of ID #${entity.id} is `;
	console.log(entity.isPlayer ?
		`${head} a Player of the name ${entity.name}.`
	:
		`${head} not a Player.`
	);
}
for (let player of Player.getAllInstances()) {
	console.log(`Player ${player.name} (#${player.id}) has ${(bookReference.hpFilledPercent * 100).toFixed(2)}% health.`);
}