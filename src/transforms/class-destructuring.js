/**
 * TODO:
 * function name template: {classname}[_static][_(get|set)][_private]_{propertyname}
 * 
 * only work with top-level classes
 * 1. simplify `const/let Name = class { ETC }` into `class Name { ETC }`
 * 2. setters and getters must be converted from assignments and gets(proper term?) into function calls, since they're functions
 * do all of the above, in that order
 *  */

export default {
	name: 'class-destructuring',
	visitor () {
		return {
			VariableDeclaration: {
				exit (path) {
					console.log(path);
				}
			},
			ClassDeclaration: {
				exit (path) {
					console.log(path);
				}
			}
		};
	}
}

