// @flow
const { IfPageTextSchema, IfPageChoiceSchema, 
		IfPageFormulaSchema,	
		IfPageParsonsSchema, IfPageHarsonsSchema } = require('./IfPage');
const { IfLevels, IfLevelSchema } = require('./IfLevel');

module.exports = {
	IfLevels,
	IfLevelSchema,
	IfPageTextSchema,
	IfPageChoiceSchema,
	IfPageFormulaSchema,
	IfPageParsonsSchema,
	IfPageHarsonsSchema
};

