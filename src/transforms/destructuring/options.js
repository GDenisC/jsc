const defaultOptions = {
    prefix: '',
    mangleProperties: false,
    debug: false
};

/**
 * @param {Partial<typeof defaultOptions>} options
 * @returns {typeof defaultOptions}
 */
export const setOptions = function(options) {
    return Object.assign(defaultOptions, options);
}