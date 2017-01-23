const { SELECTOR, generateSelector, generateRulesFromVariables } = require('./utils');

class VariablesOutputVisitor {
	constructor(less) {
		this.isPreEvalVisitor = true;
		this._less = less;
		this._visitor = new less.visitors.Visitor(this);
	}

	run(root, imp) {
		const variables = root.variables();

		// Generate a dummy selector we can output the variables as rule names
		const rules = generateRulesFromVariables(Object.keys(variables));
		const rule = generateSelector(SELECTOR, rules.join('\n'));

		// Parse the new selector into an AST...
		this._less.parse(rule, { filename: SELECTOR }, (err, mixinRoot, imports) => {
			const rule = mixinRoot.rules[0];

			root.rules.push(rule);
		});

		return this._visitor.visit(root);
	}
}

module.exports = VariablesOutputVisitor;