// @flow
const { IfPageTextSchema, IfPageChoiceSchema, 
		IfPageFormulaSchema, IfPageSliderSchema,	
		IfPageParsonsSchema, IfPageHarsonsSchema } = require('./IfPage');
const { IfLevels, IfLevelSchema } = require('./IfLevel');

module.exports = {
	IfLevels,
	IfLevelSchema,
	IfPageSliderSchema,
	IfPageTextSchema,
	IfPageChoiceSchema,
	IfPageFormulaSchema,
	IfPageParsonsSchema,
	IfPageHarsonsSchema
};

