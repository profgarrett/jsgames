import type { GenType } from '../Gens';
import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';

/*
const formatGif = (url) => {
	return '<img src=' + url + ' width="400px" height="118px" style="border: solid 2px darkgray;" />' +
			'<div style="width: 400px; text-align: center; background-color: darkgray; color: white; ' +
			'font-size: 14px;">Drag and Drop Demo</div>';
};


const formatBigGif = (url) => {
	return '<div style="width: 600px; text-align: center; background-color: darkgray; color: white; ' +
			'font-size: 14px;">Video Demo</div>' +
			'<img src=' + url + ' width="600px" style="border: solid 2px darkgray;" />';
};
*/

const gen_opening: GenType = {
	gen_type: 'LinearGen',
	pages: [
		({ 
			gen_type: 'LinearGen',
			pages: [
				{	type: 'IfPageTextSchema',
					description: `This module teaches you about this tutorial system. 
							It should take you around {minutes} minutes to complete.`,
					instruction: `Click the <code>Next page</code> button on 
						the bottom-right of the screen.`,
					template_values: {
						'minutes': '[4-6]'
					}
				},
			]
		})
	]
};


const gen_on_references: GenType = {
	gen_type: 'LinearGen',
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `You can type formulas from Excel into this site. 
					Just like Excel, always start a formula with <code>=</code>. The result of
					a formula will be shown in the 'Result' column.
					<br/><br/>  
					Some tables will show names for each column.  You should still use
					a cell reference, such as <code>A1</code>`,
			instruction: 'Type <code>={ref1_ref}+{ref2_ref}</code> in the formula box below.',
			column_titles: ['Year 1', 'Year 2', 'Year 3'],
			tests: [{ 'a': 23, 'b': 55, 'c': 43 }],
			template_values: {
				'ref1': 'popCell()',
				'ref2': 'popCell()'
			},
			solution_f: '={ref1_ref}+{ref2_ref}',
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'symbols', args: ['+'] },
				{ 'has': 'references', args: ['{ref1_ref}', '{ref2_ref}'] }
			],
			code: 'tutorial'
		}
	]
};


const gen_on_functions: GenType =  {
	gen_type: 'LinearGen',
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `Some pages are optional.
					<br/><br/>
					You can submit an answer using the 'Check answer' button, 
					or skip it by clicking the 'Next page' button.`,
			instruction: 'If you want, try typing <code>=MAX(A1, B1)</code>',
			solution_f: '=MAX(a1, b1)',
			tests: [ { a: 1, b: 2 }, { a: 2, b: 2 }, { a: 3, b: 3 }, { a:4, b:1 } ],
			correct_required: false,
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'references', args: ['a1', 'b1'] },
				{ 'has': 'functions', args: ['max']}
			],
			code: 'tutorial'
		},	]
};


const gen_on_choices: GenType = {
	gen_type: 'LinearGen',
	pages: [
		{	type: 'IfPageChoiceSchema',
			description: 'Some page ask you to select an item from a list.',
			instruction: 'How comfortable are you with this tutorial?',
			client_items: ['Very comfortable', 'Comfortable', 'Neutral', 'Uncomfortable', 'Very uncomfortable'],
			show_feedback_on: false
		}
	]
};



const gen_on_interface: GenType = {
	gen_type: 'LinearGen',
	pages: [
		{	type: 'IfPageTextSchema',
			description: `
				There is a "Feedback" button on the top-right corner of the screen. If you 
				have any trouble, feel free to leave a comment.
			`,
			instruction: 'Click "Next page"',
		}
	]
};


const gen_closing: GenType = {
	gen_type: 'LinearGen',
	pages: [
		{	type: 'IfPageTextSchema',
			description: 'Great job!  You finished with the tutorial.',
			instruction: 'Click "Next page" to return to the home screen.',
		}
	]
};

/*
	This tutorial provides a high-level overview of the system.
*/			
const tutorial: LevelSchemaFactoryType = {
	code: 'tutorial',
	title: 'Tutorial introduction',
	description: 'Learn how to create formulas.',
	show_score_after_completing: false,
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			gen_opening,
			//gen_on_harsons,
			gen_on_references,
			//gen_on_predict,
			({
				gen_type: 'ShuffleGen',
				pages: [
					gen_on_functions,
				]
			}),
			
			
			gen_on_choices,
			gen_on_interface, 
			gen_closing
		],
	})
};


export {tutorial};