// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, /*ShuffleGen,*/ UntilGen } = require('./../Gens');
//const { cognitive_load_pages } = require('./cognitive_load_pages');
const { finish_questions } = require('./finish_questions');


import type { FormulaPageType } from './../../app/if/IfTypes';


// Note: The Excel parser doesn't handle dates as number.
// Disabled until that feature is working properly.
/*
const dates_as_numbers_tutor = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `Dates in Excel are stored internally as numbers.
				This makes it easy for Excel to add and subtract, as well as 
				format dates appropriately for different time zones.
				<br/><br/>
				Let's start by asking Excel the current date.  
				Use the <code>NOW()</code> function to return the current date.`,
			helpblock: 'Type in <code>=NOW()</code>',
			solution_f: '=now()',
			client_f_format: 'shortdate',
			code: 'tutorial',
			versions: [ 
				{ tests: (): Array<Object> => [{ 'a': new Date() }] } 
			]
		}, {
			type: 'IfPageFormulaSchema',
			description: `We can add and subtract days from a date. For example,
				<code>NOW()-1</code> will return yesterday.
				<br/><br/>
				Use the <code>NOW()+1</code> function to find tomorrow's date.`,
			solution_f: '=now()+1',
			client_f_format: 'shortdate',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `We can also do math on dates contained in cells.
				<br/><br/>
				If eggs go bad in 14 days, when would each batch spoil?`,
			tests: DataFactory.randDates(5, 1, { a_range: 14}),
			column_titles: ['Egg Purchase Date'],
			solution_f: '=a1+14',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `We can also find the difference between two dates by subtracting
				one from another.
				<br/><br/>
				How many days did we had each batch of eggs?`,
			tests: DataFactory.randDates(5, 2, { a_range: 14, b_range: 3}),
			helpblock: 'Subtract the smaller date from the larger date to get a positive number',
			column_titles: ['Egg Purchase Date', 'Egg Sale Date'],
			solution_f: '=b1-a1',
			code: 'tutorial'
		}
	]
};


const dates_as_numbers_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `Great!  Now it's time to take a quiz.
					You must successfully complete three problems before moving on.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct math symbol.  <b>You do not have to use every column.</b>
					<br/><br/>
					You can review earlier pages by hovering your cursor 
					over the 'Progress' icons below.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				// Require at least 3 successful answers.
				let successful = until_pages.filter( (p: FormulaPageType): boolean => p.correct );
				return (successful.length >= 3);
			},
			pages: [
				{
					type: 'IfPageFormulaSchema',
					description: 'What is the current date?',
					tests: DataFactory.randDates(1),
					solution_f: '=now()',
					client_f_format: 'shortdate',
					column_titles: [ 'Opening Day' ],
					column_formats: [ 'shortdate' ],
					code: 'test'
				}, {
					type: 'IfPageFormulaSchema',
					description: 'What will the date be in two weeks?',
					tests: DataFactory.randDates(1),
					solution_f: '=NOW()+14',
					client_f_format: 'shortdate',
					column_titles: [ 'Opening Day' ],
					column_formats: [ 'shortdate' ],
					code: 'test'
				}, {
					type: 'IfPageFormulaSchema',
					description: 'What will the date be in one week?',
					tests: DataFactory.randDates(1),
					solution_f: '=NOW()+7',
					client_f_format: 'shortdate',
					column_titles: [ 'Opening Day' ],
					column_formats: [ 'shortdate' ],
					code: 'test'
				}, {
					type: 'IfPageFormulaSchema',
					description: 'How many days are between the opening date and now?',
					tests: DataFactory.randDates(4),
					solution_f: '=NOW()-a1',
					client_f_format: 'shortdate',
					column_titles: [ 'Opening Day' ],
					column_formats: [ 'shortdate' ],
					code: 'test'
				}, {
					type: 'IfPageFormulaSchema',
					description: 'What day is a week after the opening day?',
					tests: DataFactory.randDates(4),
					solution_f: '=a1+7',
					client_f_format: 'shortdate',
					column_titles: [ 'Opening Day' ],
					column_formats: [ 'shortdate' ],
					code: 'test'
				}
			]
		}
	]
};
*/


const date_functions_tutor = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `Dates in Excel are stored internally as numbers.
				This makes it easy for Excel to add and subtract, as well as 
				format dates appropriately for different time zones.`,
			instruction: `Let's start by asking Excel the current date.  
				Use the <code>NOW()</code> function to return the current date.`,
			helpblock: 'Type in <code>=NOW()</code>',
			solution_f: '=now()',
			client_f_format: 'shortdate',
			code: 'tutorial',
			tests: DataFactory.randDates(1, 1, { a_range: -6000 }),
			column_titles: [ 'Sales Date'],
			column_formats: ['shortdate']
		}, {
			type: 'IfPageFormulaSchema',
			description: `Day of the <b>week</b> can be returned with the 
					<code>WEEKDAY()</code> function. 
					<br/><br/>
					It will return 1 for Sunday, 2 for Monday, all of the way
					up to 7 for Saturday.`,
			instruction: `Type <code>=WEEKDAY(a1)</code> function to 
					return the day of month for each sale.`,
			tests: DataFactory.randDates(6, 1, { a_range: -6000 }),
			column_titles: ['Sale Date'],
			column_formats: ['shortdate'],
			solution_f: '=weekday(a1)',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `Day of the <b>month</b> can be returned with the 
					<code>DAY()</code> function.`,
			instruction: `Type <code>=DAY(a1)</code> function to 
					return the day of month for each sale.`,
			tests: DataFactory.randDates(6, 1, { a_range: -6000 }),
			column_titles: ['Sale Date'],
			column_formats: ['shortdate'],
			solution_f: '=day(a1)',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `The month for the date can be gotten with the 
					<code>=MONTH()</code> function.`,
			instruction: `Use the <code>=MONTH(a1)</code> function to 
					return the month of each sale.`,
			tests: DataFactory.randDates(6, 1, { a_range: -6000 }),
			column_titles: ['Sale Date'],
			column_formats: ['shortdate'],
			solution_f: '=month(a1)',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `You can also get the year with the <code>YEAR()</code> 
					function.`,
			instruction: `Type <code>=YEAR(a1)</code> function to return the 
					current year of the week.`,
			tests: DataFactory.randDates(6, 1, { a_range: -6000 }),
			column_titles: ['Sale Date'],
			column_formats: ['shortdate'],
			solution_f: '=Year(a1)',
			client_f_format: '0',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: 'You can also combine these functions together.',
			instruction: 'Find today\'s year.',
			tests: DataFactory.randDates(6, 1, { a_range: -6000 }),
			helpblock: 'Type in <code>=YEAR(NOW())</code>',
			column_titles: ['Sale Date'],
			solution_f: '=Year(now())',
			client_f_format: '0',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `You can also add or subtract the results of a <code>YEAR()</code>,
					<code>MONTH()</code>, or <code>DAY()</code>.`,
			instruction: `Use <code>=YEAR(A1)-1</code> to find a year
					before the sale date.`,
			tests: DataFactory.randDates(6, 1, { a_range: -6000 }),
			column_titles: ['Sale Date'],
			solution_f: '=YEAR(a1)-1',
			client_f_format: '0',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `The <code>NETWORKDAYS()</code> function will return the number
				of working days between two dates.
				<br/><br/>
				This function not only returns the number of days as a integer, but also
				returns the fraction left over.  For example, 1.5 would be one day difference,
				as well as half of a day (12 hours).`,
			instruction: `Use <code>=NETWORKDAYS(A1, NOW())</code> to find the working days 
				between the sale date and today.`,
			tests: DataFactory.randDates(6, 1, { a_range: -7 }),
			column_titles: ['Sale Date'],
			solution_f: '=NetWorkDays(a1, now())',
			client_f_format: '0',
			code: 'tutorial'
		}
	]
};



const date_functions_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems using date functions. 
					You must complete six problems before moving on.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct math operators. You do not have to use every column.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				// Require at least 3 successful math answers.
				//let successful = until_pages.filter( (p: FormulaPageType): boolean => p.correct );
				return (until_pages.length >= 6);
			},
			pages: [
				{
					type: 'IfPageFormulaSchema',
					column_titles: ['Sale Date'],
					tests: DataFactory.randDates(6, 1, { a_range: -6000 }),
					instruction: 'Type in the correct formula',
					client_f_format: '0',
					code: 'test',
					versions: [
						{
							description: 'What is the current date?',
							client_f_format: 'shortdate',
							solution_f: '=now()',
						}, {
							description: 'What is the current month?',
							solution_f: '=MONTH(NOW())',
						}, {
							description: 'How many working days are between the start and stop dates?',
							tests: DataFactory.randDates(6, 2, { a_range: -30, b_range: -5 }),
							column_titles: ['Start Date', 'End Date'],
							solution_f: '=networkdays(a1, b1)',
						}, {
							description: `Three years after the sale, buyers can still get a refund for 3 years. 
										Write a formula to give the year in which the refund option expires.`,
							solution_f: '=YEAR(a1)+3',
						}, {
							description: 'What is the current year?',
							solution_f: '=YEAR(NOW())',
						}, {
							description: 'What is the month of the sale date?',
							solution_f: '=month(a1)',
						}
					]
				}
			]
		}
	]
};




const dates = {
	code: 'dates',
	title: 'Introduction to date and time',
	description: 'This tutorial introduces you to different formulas for dates and times.',

	gen: {
		gen: LinearGen,
		pages: [
			//dates_as_numbers_tutor,
			//dates_as_numbers_test,
			date_functions_tutor,
			date_functions_test,
			...finish_questions
		]
	}
};



module.exports = { dates };
