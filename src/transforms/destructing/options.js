const defaultOptions = {
	variableKind: 'var',
	prefix: '',
	mangleProperties: false,
	debug: false
};

/**
 * @param {Partial<typeof defaultOptions>} options
 * @returns {typeof defaultOptions}
 */
export const setOptions = function (options) {
	if (options.variableKind && !['var', 'let', 'const'].includes(options.variableKind)) {
		options.variableKind = 'var';
	}

	return Object.assign(defaultOptions, options);
}