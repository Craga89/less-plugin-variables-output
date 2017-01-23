const { SELECTOR } = require('./utils');

class VariablesOutputPreProcessor {
	process(src, { imports }) {
		// Required for sourcemaps to work correctly, since the injected AST nodes
		// in `visitor.js` are from an import outside of the root context. We simply
		// inject a dummy string as the file content for the simulated filename of
		// the root level node in `less.render` call in `visitor.js`
		imports.contents[SELECTOR] = '';

		return src;
	}
}

module.exports = VariablesOutputPreProcessor;
