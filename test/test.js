const pkg = require('../package.json');
const fs = require('fs');
const less = require('less');
const VariablesOutput = require('../lib/index');
const { expect } = require('chai');

const VARIABLES = {
	pixel: '10px',
	percent: '10%',
	color: '#ff0000',
	otherColor: 'shade(white, 10%)'
};

const LESS = Object.keys(VARIABLES).map((v) =>
	`@${v}: ${VARIABLES[v]};`
)
.join('\n');

const compareVariables = (input, output) => {
	const inputKeys = Object.keys(input);
	expect(output).to.contain.all.keys(inputKeys);
};

const renderLess = (contents, opts, success, done) => {
	less.render(contents, {
		plugins: [
			new VariablesOutput(opts)
		]
	},
	function(err, css) {
		if (err) {
			done(err);
		}
		else {
			const output = JSON.parse(fs.readFileSync(opts.filename));
			success(output, css);
			done();
		}
	});
}

describe(pkg.name, () => {
	it('Should output variables.json file with all top-level variables', (done) => {
		const filename = 'variables.json';

		renderLess(LESS, { filename }, (output) => {
			compareVariables(VARIABLES, output);
		},
		done);
	});

	it('Should output file as given filename option if provided', (done) => {
		const filename = 'customfilename.json';

		renderLess(LESS, { filename }, (output) => {
			compareVariables(VARIABLES, output);
		},
		done);
	});

	// Cleanup variables files
	after(() => {
		fs.unlinkSync('variables.json');
		fs.unlinkSync('customFilename.json');
	});
})
