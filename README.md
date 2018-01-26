# less-plugin-variables-output
Adds output of all top-level variables to a JSON file

## Install plugin
```
npm install --save-dev less-plugin-variables-output
```

## Command line usage (lessc)
```
lessc --variables-output <input.less> <output.css>
lessc --variables-output=customFilename.json <input.less> <output.css>
```

## Programmatic usage - writing to file
```js
const less = require('less');
const VariablesOutput = require('less-plugin-variables-output');

less.render(<css>, {
	plugins: [
		new VariablesOutput({
			filename: 'variables.json'
		})
	]
});
```

## Programmatic usage - get result as an object via callback
```js
const less = require('less');
const VariablesOutput = require('less-plugin-variables-output');

let variables = {};
const varsCallback = (vars) => variables = vars;

less.render(<css>, {
	plugins: [
		new VariablesOutput({
			callback: varsCallback
		})
	]
});
```

## Testing
```
npm test
```