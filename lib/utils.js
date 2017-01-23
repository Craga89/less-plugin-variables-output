const SELECTOR = 'VARIABLE_OUTPUT_PLUGIN';

const generateSelector = (selector, content) => `${selector}{${content}}`;

const generateRulesFromVariables = (variables) =>
	variables.map((variable) => `${variable.slice(1)}: ${variable};`);

module.exports = {
	SELECTOR,
	generateSelector,
	generateRulesFromVariables
};
