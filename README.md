# less-plugin-variables-export
Adds output of all (not only top-level) variables to a JSON file

## Install plugin
```
npm install --save-dev less-plugin-variables-export
```

## Command line usage (lessc)
```
lessc --variables-export <input.less> <output.css>
```

Variables will be stored in the `<input.json>` file.

```
lessc --variables-export=./node_modules/semantic-ui-less/definitions:./node_modules/semantic-ui-less/themes/default <input.less> <output.css>
```

It should simplify the output when using Semantic UI library.

## Programmatic usage
```js
const less = require('less');
const VariablesExport = require('less-plugin-variables-export');

less.render(<css>, {
	plugins: [
		new VariablesExport({
			paths: './node_modules/semantic-ui-less/definitions'
		})
	]
});
```

## Testing
```
npm test
```
