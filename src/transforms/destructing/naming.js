import util from 'node:util';
import t from '@babel/types';
import { raise } from './error.js';

/**
 * @typedef {t.ClassMethod | t.ClassPrivateMethod} AnyClassMethod
 * @typedef {t.ClassProperty | t.ClassPrivateProperty} AnyClassProperty
 * @typedef {AnyClassMethod | AnyClassProperty} AnyClassNode
 * */

/**
 * @param {string} className
 * @param {AnyClassNode} node
 * */
const generateClassName = function(prefix, className, node, debug = false) {
	let name = className;
	if (node.static) name += '_static';
	if (node.kind == 'get') name += '_get';
	if (node.kind == 'set') name += '_set';
	if (node.key.type == 'PrivateName') name += '_private';
	name += '_' + node.key.name;

	let isMethod = t.isClassMethod(node),
		isPrivateMethod = t.isClassPrivateMethod(node),
		isProperty = t.isClassProperty(node),
		isPrivateProperty = t.isClassPrivateProperty(node),
		isError = typeof name != 'string' || typeof prefix != 'string' || !(isMethod || isPrivateMethod || isProperty || isPrivateProperty);

	if (debug || isError) {
		console.log(
			'Trying to generate class name: '
			+ prefix + name + ' '
			+ util.inspect({ isMethod, isPrivateMethod, isProperty, isPrivateProperty }, { compact: true, colors: true }).replaceAll('\n', '').replaceAll('  ', ' ')
		);
	}

	if (isError)
		raise(
			'Failed to generate class name, debug info:\n'
			+ util.inspect(node, false, null, true)
		);

	return prefix + name;
}

const properties = Symbol('properties');

/** Stores methods as `string`s and properties as `Node`s for each class */
export class ClassMap {
	/** @type {Record<string, Record<string, string | (t.ClassProperty & { className: string })>>} */
	#classes;

	constructor(options) {
		this.#classes = {};
		this.options = options;
	}

	has(className) {
		return !!this.#classes[className];
	}

	hasConstructor(className) {
		return !!this.#classes[className]['m_constructor'];
	}

	getConstructorName(className) {
		return (
			this.#classes[className]['m_constructor'] = className + '_constructor'
		);
	}

	register(name) {
		if (this.#classes[name])
			return raise('Cannot register 2 classes with the same name (' + name + ')');

		this.#classes[name] = this.options.mangleProperties
			? { [properties]: [] }
			: {};
	}

	/** @param {AnyClassMethod} node */
	#addMethod(className, node) {
		if (!this.#classes[className])
			return raise('Unregistered class `' + className + '`');

		let uniqueName = 'm' + (node.static ? 's' : '') + '_' + node.key.name,
			generatedName = generateClassName(this.options.prefix, className, node, this.options.debug);

		return (
			this.#classes[className][uniqueName] = generatedName
		);
	}

	/** @param {AnyClassProperty} node */
	#addProperty(className, node) {
		if (!this.#classes[className])
			return raise('Unregistered class `' + className + '`');

		let uniqueName = 'p' + (node.static ? 's' : '') + '_' + node.key.name,
			generatedName = generateClassName(this.options.prefix, className, node, this.options.debug);;

		node.className = generatedName;
		this.#classes[className][uniqueName] = node;

		return generatedName;
	}

	/** @param {AnyClassNode} node */
	add(className, node) {
		if (typeof className == 'string') {
			if (t.isClassMethod(node) || t.isClassPrivateMethod(node)) {
				return this.#addMethod(className, node);
			} else if (t.isClassProperty(node) || t.isClassPrivateProperty(node)) {
				return this.#addProperty(className, node);
			}
		}

		raise(
			'Failed to add a method/property to ClassMap\n'
			+ 'Debug info:\n'
			+ '- className: ' + util.inspect(className, false, null, true) + '\n'
			+ '- node: ' + util.inspect(node, false, null, true)
		);
	}

	getMethod(className, isStatic, name) {
		const cls = this.#classes[className];

		if (!cls)
			raise('Unknown class: ' + className);

		const uniqueName = 'm' + (isStatic ? 's' : '') + '_' + name;

		if (typeof name != 'string')
			raise(
				'Failed to get a method from ClassMap\n'
				+ 'Debug info:\n'
				+ '- className: ' + util.inspect(className, false, null, true) + '\n'
				+ '- isStatic: ' + util.inspect(isStatic, false, null, true) + '\n'
				+ '- name: ' + util.inspect(name, false, null, true) + ' (' + util.inspect(uniqueName, false, null, true) + ')'
			);

		return cls[uniqueName];
	}

	getInstanceMethod(className, name) {
		return this.getMethod(className, false, name);
	}

	getStaticMethod(className, name) {
		return this.getMethod(className, true, name);
	}

	isMethod(className, isStatic, name) {
		const cls = this.#classes[className];

		if (!cls)
			raise('Unknown class: ' + className);

		return !!cls['m' + (isStatic ? 's' : '') + '_' + name];
	}

	#getProperty(className, isStatic, name) {
		if (!this.#classes[className])
			raise('Unknown class: ' + className);

		const uniqueName = 'p' + (isStatic ? 's' : '') + '_' + name;

		if (typeof name != 'string')
			raise(
				'Failed to get a property from ClassMap\n'
				+ 'Debug info:\n'
				+ '- className: ' + util.inspect(className, false, null, true) + '\n'
				+ '- isStatic: ' + util.inspect(isStatic, false, null, true) + '\n'
				+ '- name: ' + util.inspect(name, false, null, true) + ' (' + util.inspect(uniqueName, false, null, true) + ')'
			);

		return this.#classes[className][uniqueName];
	}

	getInstanceProperty(className, name) {
		return this.#getProperty(className, false, name);
	}

	getStaticProperty(className, name) {
		return this.#getProperty(className, true, name);
	}

	hasProperties(className, includeStatic = true) {
		const cls = this.#classes[className];

		if (!cls)
			return raise('Unregistered class `' + className + '`');

		const keys = Object.keys(cls);

		for (let i = 0, l = keys.length; i < l; ++i) {
			if (keys[i][0] == 'p' && (includeStatic || keys[i][1] != 's'))
				return true;
		}

		return false;
	}

	/**
	 * @returns {t.ClassProperty[]}
	 */
	getProperties(className) {
		const cls = this.#classes[className];

		if (!cls)
			return raise('Unregistered class `' + className + '`');

		const keys = Object.keys(cls),
			props = [];

		for (let i = 0, l = keys.length; i < l; ++i) {
			if (keys[i][0] == 'p')
				props.push(cls[keys[i]]);
		}

		return props;
	}

	addMangledProperty(className, property) {
		if (!this.options.mangleProperties)
			throw new Error('addMangledProperty should not be called here')

		if (!this.#classes[className])
			return raise('Unregistered class `' + className + '`');

		let index = this.#classes[className][properties].indexOf(property);

		return index == -1 ? this.#classes[className][properties].push(property) - 1 : index;
	}

	getMangledProperty(className, property) {
		if (!this.options.mangleProperties)
			throw new Error('getMangledProperty should not be called here')

		if (!this.#classes[className])
			return raise('Unregistered class `' + className + '`');

		let index = this.#classes[className][properties].indexOf(property);

		return index == -1 ? raise('Unknown property: ' + property) : index;
	}
}