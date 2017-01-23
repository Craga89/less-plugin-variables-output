const fs = require('fs');
const less = require('less');
const Visitor = require('./visitor');
const PostProcessor = require('./postProcessor');

const DEFAULTS = {
	filename: 'variables.json'
};

class VariablesOutputPlugin {
	constructor(options) {
		this.minVersion = [2, 0, 0];

		this.options = Objet.assign({}, DEFAULTS, options); 
	}

	install(less, pluginManager) {
		const { filename } = this.options;

		pluginManager.addVisitor(new Visitor(less));
		pluginManager.addPostProcessor(new PostProcessor(less, filename));
	}

	setOptions(filename) {
		this.options.filename = filename;
    }

	printUsage() {
		return '--variables-output=filename.json';
	}
}

module.exports = VariablesOutputPlugin;