const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
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

const OUTPUT_PATH = path.join(__dirname, '__output__');

const qualifyPath = (...parts) => 
	path.join(OUTPUT_PATH, ...parts);

const compareVariables = (input, output) => {
	const inputKeys = Object.keys(input);
	expect(output).to.contain.all.keys(inputKeys);
};

const renderLess = (contents, opts, success, done) => {
	less.render(contents, {
		plugins: [
			new VariablesOutput(opts)
		],
		sourceMap: {}
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
		const filename = qualifyPath('variables.json');

		renderLess(LESS, { filename }, (output) => {
			compareVariables(VARIABLES, output);
		},
		done);
	});

	it('Should output file as given filename option if provided', (done) => {
		const filename = qualifyPath('customfilename.json');

		renderLess(LESS, { filename }, (output) => {
			compareVariables(VARIABLES, output);
		},
		done);
	});

	it('Should ensure all directories in the given filename option are created', (done) => {
		const dir1 = 'dir1';
		const dir2 = 'dir2';
		const name = 'directories.json';
		const filename = qualifyPath(dir1, dir2, name);

		renderLess(LESS, { filename }, (output) => {
			expect(fs.existsSync(qualifyPath(dir1))).to.be.true;
			expect(fs.existsSync(qualifyPath(dir1, dir2))).to.be.true;
			expect(fs.existsSync(filename)).to.be.true;
		},
		done);
	});

	// Cleanup variables files
	after(() => {
		rimraf.sync(OUTPUT_PATH);
	});
})
