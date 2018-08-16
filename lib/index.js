const path = require('path');

const Visitor = require('./visitor');

const DEFAULTS = {
  paths: '',
};

class VariablesExportPlugin {
  constructor(options) {
    this.minVersion = [2, 0, 0];

    this.options = Object.assign({}, DEFAULTS, options);
  }

  install(less, pluginManager) {
    const { paths } = this.options;

    pluginManager.addVisitor(new Visitor(less, paths));
  }

  setOptions(paths) {
    this.options.paths = paths
      ? paths.split(':').map(p => path.resolve(process.cwd(), p))
      : [];
  }

  /* eslint-disable-next-line class-methods-use-this */
  printUsage() {
    return '--variables-export=./node_modules/less-framework/dist';
  }
}

module.exports = VariablesExportPlugin;
