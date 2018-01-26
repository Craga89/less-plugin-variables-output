const Visitor = require('./visitor');
const PostProcessor = require('./postProcessor');
const PreProcessor = require('./preProcessor');

const DEFAULTS = {
	filename: 'variables.json'
};

class VariablesOutputPlugin {
	constructor(options) {
		this.minVersion = [2, 0, 0];

		if (options && (
			(options.filename && (typeof options.filename === 'string' || options.filename instanceof String)) || 
			(options.callback && (typeof options.callback === 'function' || options.filename instanceof Function)))) {
			this.options = options;
		} else {
			this.options = Object.assign({}, DEFAULTS, options); 
		} 
	}

	install(less, pluginManager) {
		pluginManager.addPreProcessor(new PreProcessor(less));
		pluginManager.addVisitor(new Visitor(less));
		pluginManager.addPostProcessor(new PostProcessor(less, this.options));
	}

	setOptions(filename) {
		this.options.filename = filename;
	}

	printUsage() {
		return '--variables-output=filename.json';
	}
}

module.exports = VariablesOutputPlugin;