const { SELECTOR } = require('./utils');

class VariablesOutputPostProcessor {
	constructor(less, filename) {
		this.filename = filename;
	}

	process(css) {
		// Find the dummy selector in the output CSS
		const selectorStart = css.indexOf(SELECTOR);
		const selectorEnd = css.lastIndexOf('}');
		const selectorContents = css.slice(selectorStart + SELECTOR.length + 2, selectorEnd).trim();

		// Parse the dummy selector's contents into a regular JSON-y object
		const json = selectorContents.split(';').reduce((memo, variable) => {
			if (variable) {
				const [ name, value ] = variable.split(':');
				memo[name.trim()] = value.trim();
			}

			return memo;
		},
		{});

		// Write the variables to the given filename
		const contents = JSON.stringify(json, null, 4);
		fs.writeFileSync(this.filename, contents);

		// Remove the dummy selector from the output
		return css.slice(0, selectorStart);
	}
}

module.exports = VariablesOutputPostProcessor;
