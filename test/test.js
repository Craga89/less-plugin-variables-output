const fs = require('fs');
const path = require('path');

const rimraf = require('rimraf');
const less = require('less');
const { expect } = require('chai');

const VariablesExport = require('../lib/index');


const pkg = require('../package.json');

const VARIABLES = {
  pixel: '10px',
  percent: '10%',
  color: '#ff0000',
  otherColor: 'shade(white, 10%)',
};

const LESS = Object.keys(VARIABLES).map(v => `@${v}: ${VARIABLES[v]};`)
  .join('\n');

const OUTPUT_PATH = path.join(__dirname, '../input.json');

const compareVariables = (input, output) => {
  const inputKeys = Object.keys(input);
  expect(output).to.contain.all.keys(inputKeys);
};

const renderLess = (contents, opts, success, done) => {
  less.render(contents, {
    plugins: [
      new VariablesExport(opts),
    ],
    sourceMap: {},
  },
  (err, css) => {
    if (err) {
      done(err);
    } else {
      const output = JSON.parse(fs.readFileSync(OUTPUT_PATH));
      success(output.default, css);
      done();
    }
  });
};

describe(pkg.name, () => {
  it('Should output input.json file with all top-level variables', (done) => {
    renderLess(LESS, {}, (output) => {
      compareVariables(VARIABLES, output);
    },
    done);
  });

  // Cleanup variables files
  after(() => {
    rimraf.sync(OUTPUT_PATH);
  });
});
