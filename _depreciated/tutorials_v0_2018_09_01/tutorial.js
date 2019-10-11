// @flow
const { DataFactory } = require('./../DataFactory');
import type { LevelType /*, ChoicePageType, ParsonsPageType, FormulaPageType*/ } from './../../app/if/IfTypes';
const { LinearGen, ShuffleGen /*, UntilGen*/ } = require('./../Gens');

// Make shorter.
const randB = DataFactory.randB;

const formatGif = (url) => {
	return '<img src=' + url + ' width="400px" height="118px" style="border: solid 2px darkgray;" />' +
			'<div style="width: 400px; text-align: center; background-color: darkgray; color: white; ' +
			'font-size: 14px;">Drag and Drop Demo</div>';
};



const gen_opening = {
	gen: LinearGen,
	pages: [

		{	type: 'IfPageTextSchema',
			description: `This module teaches you about this tutorial system. 
					It should take you around 10 minutes to complete.`,
			instruction: `Click the 'Next page' button on 
				the bottom-right of the screen.`
		},
	]
};


const gen_on_references = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `You can type formulas from Excel into this site. 
					Just like Excel, always start a formula with <code>=</code>. The result of
					a formula will be shown in the 'Result' column.
					<br/><br/>  
					Some tables will show names for each column.  You should still use
					a cell reference, such as <code>A1</code> or <code>B1</code>.`,
			instruction: 'Type <code>=A1+B1</code> in the formula box below.',
			tests: [{ 'a': randB(1, 10), 'b': randB(2,20) }],
			solution_f: '=a1+b1',
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'symbols', args: ['+'] },
				{ 'has': 'references', args: ['a1', 'b1'] }
			],
			code: 'tutorial'
		}
	]
};


const gen_on_functions =  {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `We will also learn about some common functions. The <code>AVERAGE</code>
					function takes in a list of numbers, and gives us the mean.`,
			instruction: 'Find the average of each row by typing in <code>=AVERAGE(A1, B1, C1)</code>',
			tests: [ { a: randB(1, 10), b: randB(1, 10), c: randB(1, 10)}, { a: 2, b: 2, c: 4}, { a: 3, b: 3, c:0 }, { a:4, b:1, c: 10} ],
			solution_f: '=average(a1, b1, c1)',
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'references', args: ['a1', 'b1', 'c1'] },
				{ 'has': 'functions', args: ['average']}
			],
			code: 'tutorial'
		},
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


const gen_on_choices = {
	gen: LinearGen,
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


const gen_on_harsons = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageHarsonsSchema',
			description: `Some exercises ask you to drag and drop elements to create formulas.
					Blocks click into place when you line up their "sticky" left side with another block.
					<br/><br/>
					` + formatGif('/static/blockly1.gif'),
			instruction: 'Create the formula <code>=A1 + 2</code>',
			tests: [ 
				{ 'a': 9 },
				{ 'a': 8 },
				{ 'a': 2 },
				{ 'a': 10 },
				{ 'a': 3 }
			],
			solution_f: '=a1 + 2',
			toolbox: [
				{ 'has': 'values', args: [2] },
				{ 'has': 'references', args: ['a1'] },
				{ 'has': 'symbols', args: ['+'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageHarsonsSchema',
			description: `You will sometimes need to type in a number. 
					<br/><br/>
					` + formatGif('/static/blockly2.gif'),
			instruction: 'Create the formula <code>=LEFT("Word", 2)</code>',
			tests: [ 
				{ 'a': 'Sample' }
			],
			solution_f: '=left("Word", 2)',
			toolbox: [
				{ 'has': 'values', args: ['number?', 'Word'] },
				{ 'has': 'functions', args: ['left'] }
			],
			correct_required: false,
			code: 'tutorial'
		},
		{	type: 'IfPageHarsonsSchema',
			description: `You will also sometimes need to input text.  You can tell that a field
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



const gen_on_interface = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `
				There is a "Feedback" button on the top-right corner of the screen. If you 
				have any trouble, feel free to leave a comment.
				<br/><br/>
				On the bottom of the screen, you can also hover your cursor over the "Progress" 
				checkboxes to review the instructions on each page.
			`,
			instruction: 'Click "Continue"',
		}
	]
};


const gen_closing = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: 'Great job!  You finished with the tutorial.',
			instruction: 'Click "Continue" to see a summary of your submissions',
		}
	]
};

/*
	This tutorial provides a high-level overview of the system.
*/			
const tutorial = {
	code: 'tutorial',
	title: 'Tutorial introduction',
	description: 'Learn how to complete the tutorials.',

	gen: {
		gen: LinearGen,
		pages: [
			gen_opening,
			gen_on_references,
			{
				gen: ShuffleGen,
				pages: [
					gen_on_functions,
				]
			},
			gen_on_harsons,
			gen_on_choices,
			gen_on_interface, 
			gen_closing
		]
	}
};


module.exports.tutorial = tutorial;
