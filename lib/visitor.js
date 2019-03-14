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
    const collectVariables = (ruleset, parent = []) => {
      if (!ruleset || ruleset === true || ['Comment', 'MixinDefinition', 'MixinCall'].includes(ruleset.type)) {
        return [];
      }

      return ([
        ...(collectVariables(ruleset.root, [...parent, ruleset])),
        ...(ruleset.rules || [])
          .reduce((acc, rule) => ([
            ...acc,
            ...collectVariables(rule, [...parent, ruleset]),
          ]), []),
        ...(ruleset.variable === true ? [{
          ruleset,
          parent,
        }] : []),
      ]);
    };

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
        const { ruleset } = variable;
        const { name: key } = ruleset;
        const { filename, rootFilename } = ruleset.fileInfo();

        const rootFilenameJson = `${getRootFilenameWithoutExt(rootFilename)}.json`;
        const name = getShortestFilename(filename, rootFilename) || 'default';

        acc[rootFilenameJson] = acc[rootFilenameJson] || {};
        acc[rootFilenameJson][name] = acc[rootFilenameJson][name] || {};
        acc[rootFilenameJson][name][key] = variable;

        return acc;
      }, {});


    Object.entries(variables).forEach(([filename, fileVariables]) => {
      // eval values
      const json = {};
      Object.entries(fileVariables).forEach(([moduleNameTmp, moduleVariables]) => {
        // make it windows compatible
        const moduleName = moduleNameTmp.replace(/\\/g, '/');
        json[moduleName] = {};

        const context = new this.less.contexts.Eval(this.less.options);
        const moduleVariablesAsArray = Object.entries(moduleVariables);
        const frames = moduleVariablesAsArray.reduce((acc, [, { ruleset, parent }]) => {
          const result = [...parent];

          let p1 = ruleset;
          while (p1 && p1.parent) {
            result.push(p1.parent);
            p1 = p1.parent;
          }

          result.forEach((el) => {
            if (acc.indexOf(el) < 0) {
              if (el.resetCache) {
                el.resetCache();
              }
              acc.push(el);
            }
          });

          return acc;
        }, []).filter(({ variable }) => !!variable);
        context.frames = [
          root.originalRuleset,
          ...frames,
        ];

        moduleVariablesAsArray.forEach(([name, { ruleset }]) => {
          json[moduleName][name.substr(1)] = ruleset.value.eval(context).toCSS();
        });
      });

      // Write the variables to the given filename with Pretty JSON
      fs.writeFileSync(filename, JSON.stringify(json, null, 2));
    });
  }
}

module.exports = VariablesExportVisitor;
