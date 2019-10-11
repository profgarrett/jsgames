// @flow
const { LinearGen } = require('./../Gens');

/*
	Note that all pages should have a solution_f of TRUE.
	The test in IfLevelTestContainer relies upon the order of these.

	These are set by tutorial/test code variable.
	If test, all FALSE. If tutorial, all TRUE.
		.correct_required
		.solution_test_results_visible
		.solution_f_vision
*/

const test = {
	code: 'test',
	title: 'Test title',
	description: 'Test description',

	gen: {
		gen: LinearGen,
		pages: [
			{	type: 'IfPageFormulaSchema',
				description: 'first page',
				instruction: 'test',
				helpblock: 'testhelpblock',
				tests: [ { a: 1, b: 2} ],
				solution_f: '=true',
				code: 'tutorial'
			},
			{	type: 'IfPageFormulaSchema',
				description: 'tutorial test',
				instruction: 'test',
				helpblock: 'testhelpblock',
				tests: [ { a: 1, b: 2} ],
				solution_f: '=true',
				code: 'tutorial'
			},
			{	type: 'IfPageFormulaSchema',
				description: 'test test (allow wrong)',
				instruction: 'test',
				helpblock: 'testhelpblock',
				tests: [ { a: 1, b: 2} ],
				solution_f: '=true',
				code: 'test'
			},
			{	type: 'IfPageFormulaSchema',
				description: 'test test (allow wrong)',
				instruction: 'test',
				helpblock: 'testhelpblock',
				tests: [ { a: 1, b: 2} ],
				solution_f: '=true',
				code: 'test'
			}
		]
	}
};


module.exports.test = test;
