// @flow
const {  LinearGen, ShuffleGen } = require('./../Gens');
const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');
import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


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


const gen_opening: GenType = {
	gen_type: LinearGen,
	pages: [
		({ 
			gen_type: LinearGen,
			pages: [
				{	type: 'IfPageTextSchema',
					description: `This module teaches you about this tutorial system. 
							It should take you around {minutes} minutes to complete.`,
					instruction: `Click the 'Next page' button on 
						the bottom-right of the screen.`,
					template_values: {
						'minutes': '[4-6]'
					}
				},
			]
		}: GenType)
	]
};


const gen_on_references: GenType = {
	gen_type: LinearGen,
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
	gen_type: LinearGen,
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
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageParsonsSchema',
			description: 'Some exercises ask you to sort items.',
			instruction: `Drag the items from the left column to the right column.  
					Put them in order with smallest on top and largest on bottom.
					<br/><br/>
					You can also double-click on items to quickly move them from one list to another.`,
			solution_items: [1,2,3],
			code: 'tutorial'
		},
		{	type: 'IfPageChoiceSchema',
			description: 'Some page ask you to select an item from a list.',
			instruction: 'How comfortable are you with this tutorial?',
			client_items: ['Very comfortable', 'Comfortable', 'Neutral', 'Uncomfortable', 'Very uncomfortable'],
			show_feedback_on: false
		}
	]
};


const gen_on_harsons: GenType = {
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `Some formulas are created with drag and drop blocks. 
					Blocks click into place when you line up their "sticky" left side with another block.
					<br/><br/>
					Click on each block you want, drag it with your mouse to the 
					dotted area below, and then let go. You should see a formula
					being written in the table below as you work!
					<br/><br/>
					` + formatBigGif('/static/HarsonsTutorial.gif'),
			instruction: 'Click the "Next page" to try it on the next screen.'
		},
		{	type: 'IfPageHarsonsSchema',
			description: `Drag the blocks into the white space below.`,
			instruction: 'Create the formula <code>={ref1_ref} + {n}</code>',
			tests: [ 
				{ 'a': 9, b: 123 },
				{ 'a': 8, b: 48 },
				{ 'a': 2, b: 91 }
			],
			template_values: {
				'ref1': 'popCell()',
				'n': '[20-40]'
			},			
			solution_f: '={ref1_ref} + {n}',
			toolbox: [
				{ 'has': 'values', args: ['{n}'] },
				{ 'has': 'references', args: ['{ref1_ref}'] },
				{ 'has': 'symbols', args: ['+'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageHarsonsSchema',
			description: `You will also sometimes need to input text or numbers.  You can tell that a field
					is text (instead of a number) by the "quotes" around it.
					<br/><br/>
					Be sure to not leave any
					extra blocks in the workspace, as that will prevent the formula from working.
					Blocks can be deleted by dragging them back into the toolbox, or by right-clicking
					and choosing the delete option.
					<br/><br/>
					` + formatGif('/static/blockly3.gif'),
			instruction: 'Create the formula <code>=LEFT("Longname", A1)</code>',
			tests: [ 
				{ 'a': 1 },
				{ 'a': 3 }, 
				{ 'a': 5 },
				{ 'a': 10 }
			],
			solution_f: '=LEFT("Longname", A1)',
			toolbox: [
				{ 'has': 'values', args: ['string?'] },
				{ 'has': 'references', args: ['a1'] },
				{ 'has': 'functions', args: ['left'] }
			],
			correct_required: false,
			code: 'tutorial'
		}
	]
};



const gen_on_interface: GenType = {
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `
				There is a "Feedback" button on the top-right corner of the screen. If you 
				have any trouble, feel free to leave a comment.
				<br/><br/>
				On the bottom of the screen, you can also hover your cursor over the "Progress" 
				checkboxes to review the instructions on each page.
			`,
			instruction: 'Click "Next page"',
		}
	]
};


const gen_closing: GenType = {
	gen_type: LinearGen,
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
		gen_type: LinearGen,
		pages: [
			gen_opening,
			
			//gen_on_harsons,

			gen_on_references,
			({
				gen_type: ShuffleGen,
				pages: [
					gen_on_functions,
				]
			}: GenType),
			
			
			gen_on_choices,
			gen_on_interface, 
			gen_closing
			
		],
	}: GenType)
};


module.exports.tutorial = tutorial;
