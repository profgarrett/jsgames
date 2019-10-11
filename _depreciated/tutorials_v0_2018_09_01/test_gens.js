// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, ShuffleGen, UntilGen, AdaptiveGen } = require('./../Gens');
import type { LevelType  } from './../../app/if/IfTypes';


const test_shuffle_gen = {
	gen: ShuffleGen,
	pages: [
		{
			gen: LinearGen,
			pages: [
			{	type: 'IfPageFormulaSchema',
				description: 'ShuffleA',
				instruction: 'test',
				tests: [ { a: 1 } ],
				solution_f: '=a1',
				code: 'test'
			}]
		},
		{
			gen: LinearGen,
			pages: [
			{	type: 'IfPageFormulaSchema',
				description: 'ShuffleB',
				instruction: 'test',
				tests: [ { a: 2 } ],
				solution_f: '=a1',
				code: 'test'
			}]
		},
		{
			gen: LinearGen,
			pages: [
			{	type: 'IfPageFormulaSchema',
				description: 'ShuffleC',
				instruction: 'test',
				tests: [ { a: 3 } ],
				solution_f: '=a1',
				code: 'test'
			}]
		},
	]			
};


const test_until_gen = {
	gen: UntilGen,
	until: (until_pages: Array<Object>): boolean => {
		let last_page = until_pages[until_pages.length-1];
		return (last_page.correct);
	},
	pages: [
	{	type: 'IfPageFormulaSchema',
		description: 'UntilGen1',
		instruction: 'test',
		versions: [
			{ tests: (level: LevelType): Array<Object> => [{ 'a': DataFactory.randB(1, 100, 12) }] }
		],
		solution_f: '=a1',
		code: 'test' // allow giving a wrong answer, but keep adding a new page if wrong.
	}]
};


const test_adaptive_gen = {

	gen: AdaptiveGen,

	until: (pages: Array<Object>): boolean => 
			pages.filter( (p: Object): boolean => !p.correct)
				.length >= 2,

	tutorial_gen: {
		gen: LinearGen,

		pages: [
			{	type: 'IfPageParsonsSchema',
				description: 'AdaptiveTutorial',
				instruction: 'test',
				code: 'tutorial',
				solution_items: [1,2]
			}
		]
	},
	test_gen: {
		gen: LinearGen,

		pages: [
			{
				type: 'IfPageParsonsSchema',
				description: 'AdaptiveTest',
				instruction: 'test',
				code: 'test',
				solution_items: [1, 2],
			}
		]
	}
};


/*
	Test the basic gen functionality
*/

const test_gens = {
	code: 'test_gens',
	title: 'Test gens',
	description: 'Tests for the gen functionality.  Used in testing by the ifgame/test/ script',

	gen: {
		gen: LinearGen,
		pages: [
			{
				type: 'IfPageFormulaSchema',
				tests: [ { a: 1 } ],
				description: 'LinearGen1_tutorial',
				instruction: 'test',
				solution_f: '=a1',
				code: 'tutorial'
			},
			{
				type: 'IfPageFormulaSchema',
				tests: [ { a: 1 } ],
				description: 'LinearGen1_test',
				instruction: 'test',
				solution_f: '=a1',
				code: 'test'
			},
			
			test_until_gen,
			
			test_shuffle_gen,
			
			test_adaptive_gen,

			{
				type: 'IfPageTextSchema',
				description: 'FINISHED TEST!'
			},			
		]
	}

};


module.exports = {
	test_gens: test_gens
};

