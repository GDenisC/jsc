const ClassDestructuredId = '_876342998743';

import EventEmitter from 'node:events';

function IllegalAssignmentError_constructor(propname, extra) {
	let message = `Cannot assign to ${propname}!`;
	if (extra) message += '\n' + extra;
	let self = new Error(message);
	self[ClassDestructuredId] = 1;
	return self;
}

let Entity_static_private_instanceMap = new Map();

function Entity_static_get_instanceCount() {
	return Entity_static_private_instanceMap.size;
}
function Entity_static_set_instanceCount(_) {
	throw IllegalAssignmentError_constructor('instancesArray');
}

function Entity_static_getInstance(id) {
	return Entity_static_private_instanceMap.get(id);
}
function Entity_static_getAllInstances() {
	return Entity_static_private_instanceMap.values();
}

let Entity_static_private_id = 0;
function Entity_constructor() {
	let self = new EventEmitter();
	self[ClassDestructuredId] = 2;
	self.Entity_static_private_id = Entity_static_get_instanceCount();
	Entity_static_private_instanceMap.set(Entity_get_id(self), self);
	return self;
}

function Entity_get_isPlayer(self) {
	switch (self[ClassDestructuredId]) {
		case 2:
			return false;
		case 3:
			return Player_get_isPlayer(self);
	}
}
function Entity_set_isPlayer(self, _) {
	throw new IllegalAssignmentError('isPlayer');
}

function Entity_get_id(self) {
	return self.Entity_static_private_id;
}
function Entity_set_id(self, _) {
	throw IllegalAssignmentError_constructor('id');
}

function Entity_tick(self) {
	self.emit('tick');
}

let Player_static_private_defaultName = 'unnamed';

function Player_static_get_defaultName() {
	return Player_static_private_defaultName;
}
function Player_static_set_defaultName(name) {
	Player_static_invalidateName(name);
	Player_static_private_defaultName = name;
}

function Player_static_get_instanceCount() {
	return Player_static_getAllInstances().toArray().length;
}

function Player_static_invalidateName(name) {
	if ('string' !== typeof name) {
		throw new TypeError('name must be a string! provided type: ' + typeof name);
	}
	if (name.length === 0) {
		throw new TypeError('name must not be empty!');
	}
}

function Player_static_getAllInstances() {
	return Entity_static_getAllInstances().filter(entity => Entity_get_isPlayer(entity));
}

let Player_static_private_name = '';

function Player_constructor(name = Player_static_private_defaultName) {
	Player_static_invalidateName(name);
	let self = Entity_constructor();
	self[ClassDestructuredId] = 3;
	self.Player_static_private_name = name;
	self.hp = 1;
	self.hpmax = 10;
	return self;
}

function Player_get_isPlayer(self) {
	return true;
}

function Player_get_name(self) {
	return self.Player_static_private_name;
}
function Player_set_name(self, _) {
	throw IllegalAssignmentError_constructor('name', 'Use .rename()!');
}

function Player_get_hpFilledPercent(self) {
	return self.hp / self.hpmax;
}
function Player_set_hpFilledPercent(self, _) {
	throw IllegalAssignmentError_constructor('hpFilledPercent');
}

function Player_get_dead(self) {
	return self.hp <= 0;
}
function Player_set_dead(self, _) {
	throw IllegalAssignmentError_constructor('dead');
}

function Player_rename(self, name, fireEvent = true) {
	Player_static_invalidateName(name);
	if (fireEvent) {
		self.emit('rename', {
			oldName: self.Player_static_private_name,
			newName: name
		});
	}
	self.Player_static_private_name = name;
}

function Player_hurt(self, hitpoints) {
	self.hp -= hitpoints;
	self.emit('hurt', hitpoints);
	return self.dead;
}

function Player_tick(self) {
	Entity_tick(self);
	if (self.hp < self.hpmax) {
		self.hp++;
	}
}


for (let adjective of ['first', 'second', 'third']) {
	let entity = Entity_constructor();
	entity.on('tick', () => {
		console.log(`ticked the ${adjective} entity!`);
	});
}

Player_constructor('Albert');
Player_constructor('Bolbert');
Player_constructor('Calbert');
Player_constructor('Dullbert');
Player_constructor('Elbert');

for (let entity of Entity_static_getAllInstances()) {
	Entity_tick(entity);
}
for (let i = 0; i < 9; i++) {
	for (let player of Player_static_getAllInstances()) {
		Player_tick(player);
	}
}

const bookReference = Entity_static_getInstance(Entity_static_get_instanceCount() - 1);
if (!Entity_get_isPlayer(bookReference)) {
	throw new TypeError('what the fuck just happened');
}
Player_rename(bookReference, 'Ted');
bookReference.on('hurt', (hitpoints) => {
	bookReference.hp += hitpoints;
});
setInterval(() => {
	Player_hurt(bookReference, -99999);
	console.log('is', Player_get_name(bookReference), 'dead?', Player_get_dead(bookReference));
	console.log('Health:', (Player_get_hpFilledPercent(bookReference) * 100).toFixed(2) + '%');
}, 1000);

for (let entity of Entity_static_getAllInstances()) {
	let head = `Entity of ID #${Entity_get_id(entity)} is`;
	console.log(Entity_get_isPlayer(entity) ? `${head} a Player of the name ${Player_get_name(entity)}.` : `${head} not a Player.`);
}
for (let player of Player_static_getAllInstances()) {
	console.log(`Player ${Player_get_name(player)} (#${Entity_get_id(player)}) has ${(Player_get_hpFilledPercent(bookReference) * 100).toFixed(2)}% health.`);
}