const fs = require('fs');
const path = require('path');

class VariablesExportVisitor {
  constructor(less, paths) {
    this.isPreEvalVisitor = false;
    this.isPreVisitor = false;
    this.less = less;
    this.paths = paths;
  }

  run(root) {
    const collectVariables = ruleset => (
      !ruleset || ruleset === true ? [] : [
        ...(collectVariables(ruleset.root)),
        ...(ruleset.rules || [])
          .reduce((acc, rule) => ([
            ...acc,
            ...collectVariables(rule),
          ]), []),
        ...(ruleset.variable === true ? [ruleset] : []),
      ]
    );

    const additionalPaths = this.paths;

    const getRootFilenameWithoutExtCache = {};
    const getRootFilenameWithoutExt = (rootFilename) => {
      if (!getRootFilenameWithoutExtCache[rootFilename]) {
        getRootFilenameWithoutExtCache[rootFilename] = path.format({
          ...path.parse(rootFilename),
          base: null,
          ext: null,
        });
      }

      return getRootFilenameWithoutExtCache[rootFilename];
    };

    const getShortestFilenameCache = {};
    const getShortestFilename = (filename, rootFilename) => {
      if (!getShortestFilenameCache[filename]) {
        let shortestFilename = filename;

        const modulePaths = [
          ...module.paths,
          ...additionalPaths,
          path.dirname(rootFilename),
          getRootFilenameWithoutExt(rootFilename),
        ];
        modulePaths.forEach((modulePath) => {
          const tmp = path.relative(modulePath, filename);
          shortestFilename = tmp.length > shortestFilename.length ? shortestFilename : tmp;
        });

        const name = path
          .format({
            ...path.parse(shortestFilename),
            base: null,
            ext: null,
          })
          .replace(/^[/\\._]+/, '');

        getShortestFilenameCache[filename] = name;
      }

      return getShortestFilenameCache[filename];
    };

    const variables = collectVariables(root.originalRuleset)
      .reduce((acc, variable) => {
        const { name: key, value } = variable;
        const { filename, rootFilename } = variable.fileInfo();

        const rootFilenameJson = `${getRootFilenameWithoutExt(rootFilename)}.json`;
        const name = getShortestFilename(filename, rootFilename) || 'default';

        acc[rootFilenameJson] = acc[rootFilenameJson] || {};
        acc[rootFilenameJson][name] = acc[rootFilenameJson][name] || {};
        acc[rootFilenameJson][name][key] = value;

        return acc;
      }, {});


    Object.entries(variables).forEach(([filename, fileVariables]) => {
      // eval values
      const json = {};
      Object.entries(fileVariables).forEach(([moduleNameTmp, moduleVariables]) => {
        // make it windows compatible
        const moduleName = moduleNameTmp.replace(/\\/g, '/');
        json[moduleName] = {};

        const context = new this.less.contexts.Eval({}, [
          {
            functionRegistry: root.functionRegistry,
            variable: (n) => {
              const found = [moduleVariables, ...Object.values(fileVariables)]
                .find(x => !!x[n]);

              if (!found) {
                return new this.less.tree.Quoted(n, n);
              }

              return {
                value: found[n],
              };
            },
          },
        ]);
        Object.entries(moduleVariables).forEach(([name, value]) => {
          json[moduleName][name.substr(1)] = value.eval(context).toCSS();
        });
      });

      // Write the variables to the given filename with Pretty JSON
      fs.writeFileSync(filename, JSON.stringify(json, null, 2));
    });
  }
}

module.exports = VariablesExportVisitor;
