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

export class ClassMap {
    #classes;

    constructor(options) {
        /** @type {Record<string, Record<string, string>>} */
        this.#classes = {};
        this.options = options;
    }

    /** @param {AnyClassMethod} node */
    #addMethod(className, node) {
        if (!this.#classes[className]) {
            this.#classes[className] = this.options.mangleProperties ? { [properties]: [] } : {};
        }

        let uniqueName = 'm' + (node.static ? 's' : '') + '_' + node.key.name,
            generatedName = generateClassName( this.options.prefix, className, node, this.options.debug);

        return (
            this.#classes[className][uniqueName] = generatedName
        );
    }

    /** @param {AnyClassProperty} node */
    #addProperty(className, node) {
        raise('addProperty:\n' + util.inspect(node, false, null, true));
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

    #getMethod(className, isStatic, name) {
        if (!this.#classes[className])
            raise('Unknown class: ' + className);

        if (typeof name != 'string')
            raise(
                'Failed to get a method from ClassMap\n'
                + 'Debug info:\n'
                + '- className: ' + util.inspect(className, false, null, true) + '\n'
                + '- isStatic: ' + util.inspect(isStatic, false, null, true) + '\n'
                + '- name: ' + util.inspect(name, false, null, true)
            );

        return this.#classes[className]['m' + (isStatic ? 's' : '') + '_' + name];
    }

    getInstanceMethod(className, name) {
        return this.#getMethod(className, false, name);
    }

    getStaticMethod(className, name) {
        return this.#getMethod(className, true, name);
    }

    #getProperty(className, isStatic, name) {
        if (!this.#classes[className])
            raise('Unknown class: ' + className);

        if (typeof name != 'string')
            raise(
                'Failed to get a property from ClassMap\n'
                + 'Debug info:\n'
                + '- className: ' + util.inspect(className, false, null, true) + '\n'
                + '- isStatic: ' + util.inspect(isStatic, false, null, true) + '\n'
                + '- name: ' + util.inspect(name, false, null, true)
            );

        return this.#classes[className]['p' + (isStatic ? 's' : '') + '_' + name];
    }

    getInstanceProperty(className, name) {
        return this.#getProperty(className, false, name);
    }

    getStaticProperty(className, name) {
        return this.#getProperty(className, true, name);
    }

    addProperty(className, property) {
        if (!this.options.mangleProperties)
            throw new Error('addProperty should not be called here')

        if (!this.#classes[className])
            this.#classes[className] = { [properties]: [] };

        return this.#classes[className][properties].push(property) - 1;
    }

    getPropertyIndex(className, property) {
        if (!this.options.mangleProperties)
            throw new Error('getPropertyIndex should not be called here')

        if (!this.#classes[className])
            raise('Unknown class: ' + className);

        let index = this.#classes[className][properties].indexOf(property);

        return index == -1 ? raise('Unknown property: ' + property) : index;
    }

    getOrAddPropertyIndex(className, property) {
        if (!this.options.mangleProperties)
            throw new Error('getOrAddPropertyIndex should not be called here')

        if (!this.#classes[className])
            this.#classes[className] = { [properties]: [] };

        let index = this.#classes[className][properties].indexOf(property);

        return index == -1 ? this.#classes[className][properties].push(property) - 1 : index;
    }
}