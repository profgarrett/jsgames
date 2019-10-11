// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, ShuffleGen, UntilGen, AdaptiveGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');
import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

/*


const farm1_data = {
	column_titles: ['Alpacas', 'Baboon', 'Sale Price Per Animal', 'Growth Rate (yearly)' ],
	column_formats: [ ',', ',', '$','%' ],
	client_f_format: ',',
	tests: [
			{ 'a': 54, 'b': randB(80, 100), 'c': 10, 'd': 0.2 }, 
			{ 'a': 32, 'b': randB(1, 10), 'c': 13, 'd': 0.05 }, 
			{ 'a': 1, 'b': randB(10, 100), 'c': 20, 'd': 0.04 }, 
			{ 'a': 103, 'b': randB(1, 100), 'c': 10, 'd': 0.1 }
		]
};

					// Sale price per animal
						}, {
							solution_f: '=(a1+b1)*c1', 
							client_f_format: '$',
							description: 'How much can we sell our Alpacas and Baboons for? Use the sale price column.',
						}, {
							solution_f: '=(a1+b1)*20', 
							client_f_format: '$',
							description: 'How much can we sell our Alpacas and Baboons for if we sell each for $20?',

					// Sale at a discount/premium 
						}, {
							solution_f: '=a1*(c1*0.5)', 
							client_f_format: '$',
							description: 'If we give a 50% discount, how much can we sell the Alpacas for? Hint: use the sale price column.',
						}, {
							solution_f: '=a1*(c1*0.8)', 
							client_f_format: '$',
							description: 'If we give a 20% discount, how much can we sell the Alpacas for? Hint: use the sale price column.',
						}, {
							solution_f: '=b1*(c1*0.9)', 
							client_f_format: '$',
							description: 'If we give a 10% discount, how much can we sell the Baboons for? Hint: use the sale price column.',
						}, {
							solution_f: '=b1*(c1*0.95)', 
							client_f_format: '$',
							description: 'If we give a 5% discount, how much can we sell the Baboons for? Hint: use the sale price column.',
						}, {
							solution_f: '=b1*(c1*0.7)', 
							client_f_format: '$',
							description: 'If we give a 30% discount, how much can we sell the Baboons for? Hint: use the sale price column.',

						}, {
							solution_f: '=a1*(c1*1.1)', 
							client_f_format: '$',
							description: 'If we sell them at a 10% premium over the list price, how much can we sell the Alpacas for?',
						}, {
							solution_f: '=a1*(c1*1.2)', 
							client_f_format: '$',
							description: 'If we sell them at a 20% premium over the list price, how much can we sell the Alpacas for?',
						}, {
							solution_f: '=b1*(c1*1.15)', 
							client_f_format: '$',
							description: 'If we sell them at a 15% premium over the list price, how much can we sell the Baboons for?',
						}, {
							solution_f: '=b1*(c1*1.12)', 
							client_f_format: '$',
							description: 'If we sell them at a 20% premium over the list price, how much can we sell the Baboons for?',
						}, {
							solution_f: '=b1*(c1*1.15)', 
							client_f_format: '$',
							description: 'If we sell them at a 15% premium over the list price, how much can we sell the Baboons for?',


						}, {
							solution_f: '=(a1+b1)*(c1*0.5)', 
							client_f_format: '$',
							description: 'If we give a 50% discount, how much can we sell our animals for? Hint: use the sale price column.',
						}, {
							solution_f: '=(a1+b1)*(c1*0.8)', 
							client_f_format: '$',
							description: 'If we give a 20% discount, how much can we sell our animals for? Hint: use the sale price column.',
						}, {
							solution_f: '=(a1+b1)*(c1*0.9)', 
							client_f_format: '$',
							description: 'If we give a 10% discount, how much can we sell our animals for? Hint: use the sale price column.',
						}, {
							solution_f: '=(a1+b1)*(c1*0.95)', 
							client_f_format: '$',
							description: 'If we give a 5% discount, how much can we sell our animals for? Hint: use the sale price column.',


						}, {
							solution_f: '=(a1+b1)*(c1*1.2)', 
							client_f_format: '$',
							description: 'If increase our sales price by 20%, how much can we sell our animals for?',
						}, {
							solution_f: '=(a1+b1)*(c1*1.1)', 
							client_f_format: '$',
							description: 'If increase our sales price by 10%, how much can we sell our animals for?',
						}, {
							solution_f: '=(a1+b1)*(c1*1.3)', 
							client_f_format: '$',
							description: 'If increase our sales price by 30%, how much can we sell our animals for?',
						}, {
							solution_f: '=(a1+b1)*(c1*1.12)', 
							client_f_format: '$',
							description: 'If increase our sales price by 12%, how much can we sell our animals for?',


		{	type: 'IfPageFormulaSchema',
			description: 'How much will revenues be after a single year?',
			instruction: 'Use the given growth rate',
			column_formats: [ '', '$', '$','%' ],
			column_titles: [ 'Farm', 'Revenue', 'Cost', 'Growth Rate' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.2 }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.05 }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.04 }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.1 }
					],
			solution_f: '=b1+b1*d1', 
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'How much will revenues be after a single year?',
			instruction: 'Use the given growth rate',
			column_formats: [ '', '$', '$','%' ],
			column_titles: [ 'Farm', 'Revenue', 'Cost', 'Growth Rate' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.2 }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.05 }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.04 }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.1 }
					],
			solution_f: '=b1+b1*d1', 
			client_f_format: '$',
			code: 'tutorial'
		}
						{
							description: `If we continue with the same cost and revenue, 
								how much will we earn in profit over the next ten year period? Ignore taxes.`,
							solution_f: '=(a1-b1)*10'
						},
						{
							description: `How much tax will we owe if we combine two years of payments? 
									First calculate profit, and then apply the tax rate.  
									Double that number to find two years.`,
							solution_f: '=(a1-b1)*2*c1',
						},
						{
							description: `What will the <b>increase</b> in total sales be after one year? 
									Do not give the total sales, but just the amount by which it changed`,
							column_titles: ['NY Sales', 'Texas Sales', 'Growth Rate' ],
							solution_f: '=(a1+b1)*c1', 
						},
						{
							description: `What will the <b>total</b> sales be next year? Hint: include 
								one year's sales as well as the increase.`,
							column_titles: ['NY Sales', 'Texas Sales', 'Growth Rate' ],
							solution_f: '=(a1+b1)*(1+c1)', 
						},
						{
							description: `What will our profit be after 10 years of exponential growth?
									<br/><br/>
									Hint:  x<sub>t</sub> = x<sub>0</sub>(1 + r)<sup>t</sup> 
									is the exponential growth formula.  Find (1 + the growth rate), raise it 
									to the power of 10, and then multiply that by our initial profit.`,
							column_titles: ['Sales', 'Profit', 'Growth Rate' ],
							solution_f: '=b1*(1+c1)^10', 
						}
					]
							tags: ['addition', 'multiplication', 'parentheses']



		{	type: 'IfPageFormulaSchema',
			description: `Why don't you try some problems?
						<br/><br/>
						What is a tenth of the overall profit for each region?`,
			instruction: 'Add together the two profit figures, and then use division to figure out a tenth of that amount.',
			column_formats: [ '', '$', '$' ],
			column_titles: [ 'Farm', 'January Profit', 'February Profit' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000) }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000) }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000) }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000) }
					],
			solution_f: '=(b1+c1)/10', 
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Great!  Now, how much will ABC Farms spend <b>in total</b> for the employees
						at each site? 
						<br/><br/>
						Build on your earlier answer. If you need to, review your previous 
						work by hovering over the progress icons below.`,
			instruction: `After calculating profit, use division to figure out a tenth of that amount. 
						Then, multiply by the number of employees`,
			column_formats: [ '', '$', '$',',' ],
			column_titles: [ 'Farm', 'Sales', 'Cost', 'Employees' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 2 }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 5 }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 4 }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 3 }
					],
			solution_f: '=(b1-c1)/10*d1', 
			client_f_format: '$',
			code: 'tutorial'
		}
/*
	Accounting introduces basic accounting terms and concepts.

	Revenue
	Cost
	Net income/profit
	Gross profit

	Unit cost, unit price, unit count

	Tax rates
	
	Prereq: Math1, add/subtract/multiply/divide.
*
const simple_accounting_overview = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `This tutorial introduces some accounting terms.
					<br/><br/>
					We use the ABC Farm company as an ongoing example.
					ABC sells horses to customers in several different states. 
					<br/><br/>
					You should know these business terms:
					<ul>
						<li><b>Revenue</b>: Clients give money to ABC Farm when they buy a horse.  Also called sales.</li>
						<li><b>Expenses</b>: ABC Farm must buy supplies to raise horses.  Also called costs.</li>
						<li><b>Profit</b>: Revenue minus expenses. If this is negative, then ABC
							has lost money.</li>
					</ul>`
		},
		{	type: 'IfPageTextSchema',
			description: `This section uses several business terms.

				<ul>
					<li><b>Revenue</b>: Money we <i>receive</i> in exchange for products 
						or services.</li>
					<li><b>Expenses</b>: Money we <i>pay</i> to create goods or
						services.</li>
					<li><b>Profit</b>: Revenue minus expenses. If this is negative, then 
						we have lost money.</li>
					<li><b>Profit Margin</b>: Profit divided by revenue (a percentage). How
						much of each sales dollar goes to profit?</li>
					<li><b>Tax Rate</b>: We multiply this by profits
						to find how much we owe in taxes</li>
				</ul>`,
			instruction: `Once you are comfortable with the terms, click the 
				<code>Continue</code> button.`
		},	
		{	type: 'IfPageFormulaSchema',
			description: `Addition and subtraction are the most commonly used arithmetic operations.
					We use the symbols <code>+</code> and <code>-</code>.`,
			instruction: `ABC Farms sold horses in two states.  
					Find their profit by adding revenues and subtracting costs.`,
			column_formats: [ '$', '$', '$'],
			helpblock: 'Hint: Your answer should look like <span style="white-space: nowrap;">=__+__-__</span>',
			column_titles: ['California Revenue', 'Texas Revenue', 'Total Costs' ],
			tests: [
						{ 'a': randB(1000, 1000), 'b': randB(500, 1000), 'c': randB(200,500) }, 
						{ 'a': randB(1000, 1000), 'b': randB(500, 1000), 'c': randB(200,500) }, 
						{ 'a': randB(1000, 1000), 'b': randB(500, 1000), 'c': randB(200,500) }
					],
			solution_f: '=a1+b1-c1', 
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'references', args: ['a1','b1', 'c1'] },
				{ 'has': 'symbols', args: ['+', '-']}
			],
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Division uses <code>/</code> (slash). This is on the <kbd>?</kbd> key.
					<br/><br/>
					The <code>\\</code> (backslash) is different, and will not work.
					<br/><br/>`,
			instruction: `ABC Farms wants to know how many horses each hay bale will feed.
					Use division, and the fact that most horses eat <b>15 pounds per day</b>, 
					to figure out the answer.`,
			helpblock: 'Hint: Your answer should look something like =__/15',
			column_titles: ['Bale Type', 'Pounds' ],
			tests: [
						{ 'a': 'Two String Bale', 'b': randOf([50, 60, 75]) }, 
						{ 'a': 'Three String Bale', 'b': randOf([100, 110, 120]) }, 
						{ 'a': 'Round Hay Bale', 'b': randOf([2000, 2300, 1900]) }
					],
			solution_f: '=b1/15', 
			feedback: [
				{ 'has': 'values', args: [15] },
				{ 'has': 'references', args: ['b1'] },
				{ 'has': 'symbols', args: ['/']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Multiplication is our last common operator (or symbol). 
					<br/><br/>
					Excel uses 
					<code>*</code> (asterisk), which is created when you press 
					<kbd>shift</kbd> and <kbd>8</kbd>.`,
			instruction: `ABC Farms is trying to figure out how much food it needs for each horse pen.  
					Use multiplication to figure out the answer.`,
			helpblock: 'Hint: Your answer should look something like =__*__',
			column_titles: ['Horse type', 'Number of horses', 'Pounds of food needed for a single horse' ],
			tests: [
						{ 'a': 'Pen A', 'b': randB(2, 5), 'c': randB(15, 20) }, 
						{ 'a': 'Pen B', 'b': randB(5, 10), 'c': randB(10, 20) }, 
						{ 'a': 'Pen C', 'b': randB(2, 10), 'c': randB(15, 25) }
					],
			solution_f: '=b1*c1', 
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'references', args: ['b1', 'c1'] },
				{ 'has': 'symbols', args: ['*']}
			],
			client_f_format: '',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `You can combine multiple symbols in a single formula.
					<br/><br/>
					Excel will generally start on the left side, and move to the 
					right (we will learn about order of operation later on).`,
			instruction: `What is ABC Farm's total profit? 
					Add up the sales and subtract the costs.`,
			column_formats: [ '$', '$', '$', '$'],
			column_titles: ['California Sales', 'Texas Sales', 'California Cost', 'Texas Cost' ],
			tests: [
						{ 'a': randB(80, 100), 'b': randB(10, 50), 'c': randB(10, 20), 'd': randB(10, 20) }, 
						{ 'a': randB(80, 100), 'b': randB(10, 50), 'c': randB(10, 20), 'd': randB(10, 20) }, 
						{ 'a': randB(80, 100), 'b': randB(10, 50), 'c': randB(10, 20), 'd': randB(10, 20) }
					],
			solution_f: '=a1+b1-c1-d1', 
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'references', args: ['a1', 'b1', 'c1', 'd1'] },
				{ 'has': 'symbols', args: ['+', '-']}
			],
			client_f_format: '$',
			code: 'tutorial',
		},
	]
};


const simple_arithmetic_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `Great!  Now it's time to take a quiz.
					You must complete six problems before moving on.
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
				// Require at least 3 successful math answers.
				//let successful = .filter( (p: FormulaPageType): boolean => p.correct );
				return (until_pages.length >= 6);
			},
			pages: [
				{	type: 'IfPageFormulaSchema',
					column_titles: ['Year', 'California revenue', 'Texas revenue', 'Number of horses sold', 'Tax rate' ],
					column_formats: [ 'text', '$', '$', '', '%'],
					instruction: 'Type in the correct formula',
					tests: [
								{ 'a': (new Date()).getFullYear(), 'b': randB(8000, 10000), 'c': randB(1000, 5000), 'd': randB(10,20), 'e': randPercent(0, 0.2) }, 
								{ 'a': (new Date()).getFullYear()-1, 'b': randB(8000, 10000), 'c': randB(1000, 5000), 'd': randB(10,20), 'e': randPercent(0, 0.2) }, 
								{ 'a': (new Date()).getFullYear()-2, 'b': randB(8000, 10000), 'c': randB(1000, 5000), 'd': randB(10,20), 'e': randPercent(0, 0.2) }, 
								{ 'a': (new Date()).getFullYear()-3, 'b': randB(8000, 10000), 'c': randB(1000, 5000), 'd': randB(10,20), 'e': randPercent(0, 0.2) }, 
							],
					client_f_format: '$',
					code: 'test',
					versions: [
						{
							solution_f: '=c1+b1', 
							description: 'What is the revenue for both states?',
							feedback: [
								{ 'has': 'no_values' },
								{ 'has': 'references', args: ['b1', 'c1'] },
								{ 'has': 'symbols', args: ['+']}
							]
						},{
							solution_f: '=b1*e1', 
							description: 'How much tax do we owe in California?  We calculate this by multiplying tax rate by revenue.',
							feedback: [
								{ 'has': 'no_values' },
								{ 'has': 'references', args: ['b1', 'e1'] },
								{ 'has': 'symbols', args: ['*']}
							]
						},{
							solution_f: '=c1*e1', 
							description: 'How much tax do we owe in Texas?  We calculate this by multiplying tax rate by revenue.',
							feedback: [
								{ 'has': 'no_values' },
								{ 'has': 'references', args: ['c1', 'e1'] },
								{ 'has': 'symbols', args: ['*']}
							]
						},{
							solution_f: '=d1*100', 
							description: 'If each horse costs $100 to raise, what was the cost for each year?',
							feedback: [
								{ 'has': 'values', args: [100] },
								{ 'has': 'references', args: ['d1'] },
								{ 'has': 'symbols', args: ['*']}
							]
						},{
							solution_f: '=b1-c1', 
							description: 'How much more revenue do we have in California than Texas?',
							feedback: [
								{ 'has': 'no_values' },
								{ 'has': 'references', args: ['b1', 'c1'] },
								{ 'has': 'symbols', args: ['-']}
							],
						},{
							solution_f: '=c1-b1', 
							description: 'How much more revenue do we have in Texas than California?',
							feedback: [
								{ 'has': 'no_values' },
								{ 'has': 'references', args: ['c1', 'b1'] },
								{ 'has': 'symbols', args: ['-']}
							],
						},{
							solution_f: '=b1/2', 
							description: `If half of our revenue pays for raising the horses, what is our profit for California? 
								(ignore taxes)
								<br/><br/>
								You must use <b>division</b> to solve this problem.`,
							feedback: [
								{ 'has': 'values', args: [2] },
								{ 'has': 'references', args: ['b1'] },
								{ 'has': 'symbols', args: ['/']}
							],
						},{
							solution_f: '=c1/4', 
							description: `If a quarter of our revenue turns into profit, what is our profit for Texas? (ignore taxes)
											<br/><br/>
											You must use <b>division</b> to solve this problem.`,
							feedback: [
								{ 'has': 'values', args: [4] },
								{ 'has': 'references', args: ['c1'] },
								{ 'has': 'symbols', args: ['/']}
							],
						}
					]
				}
			]
		}
	]
};


/*
	Math2 introduces more unusual math symbols.
	
	Introduction and then a quiz.
*
const advanced_arithmetic_overview = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `There are several more advanced arithmetic symbols (operators) in Excel.
					<br/><br/>
					This section will teach you how to use exponents and parentheses.`
		},		
		{	type: 'IfPageTextSchema',
			description: `This section uses several business terms.

				<ul>
					<li><b>Revenue</b>: Money we <i>receive</i> in exchange for products 
						or services.</li>
					<li><b>Expenses</b>: Money we <i>pay</i> to create goods or
						services.</li>
					<li><b>Profit</b>: Revenue minus expenses. If this is negative, then 
						we have lost money.</li>
					<li><b>Profit Margin</b>: Profit divided by revenue (a percentage). How
						much of each sales dollar goes to profit?</li>
					<li><b>Tax Rate</b>: We multiply this by profits
						to find how much we owe in taxes</li>
				</ul>`,
			instruction: `Once you are comfortable with the terms, click the 
				<code>Continue</code> button.`
		},	
		{	type: 'IfPageFormulaSchema',
			description: `An exponent multiplies a number by itself several times.
					This is sometimes described "raising a number to the power of 2" (or 3, 4, 5, ...).
					<br/><br/>
					We write exponents as <code>2^3</code>.  We use <code>^</code> (caret)
					because keyboards make it difficult to write 2<sup>3</sup>. 
					You can find the <code>^</code> symbol by pressing <kbd>shift</kbd> and <kbd>6</kbd>.`,
			instruction: `To multiply 2 by itself 6 times 
					write <code>=2^6</code>. This has the same results as <code>=2*2*2*2*2*2</code>,
					but is easier to write.`,
			column_formats: [ '' ],
			column_titles: [ '' ],
			tests: [ { 'a': 0, } ],
			solution_f: '=2^6', 
			client_f_format: '',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Exponents are commonly used in business to model compound growth. 
					<br/><br/>
					For example, if you deposit $100 in a savings account at 10% interest, you will
					have $110 at the end of the year.  If you then put the whole amount back into the 
					bank, you will earn more than if you took the $10 increase home. 
					<br/><br/>
					The equation for exponential growth is 
					x<sub>t</sub> = x<sub>0</sub>(1 + r)<sup>t</sup>.  It looks more complicated than it actually is.
					<br/><br/>
					<ul>
						<li>Start by calculating <i>one</i> year's growth rate: <code>1 + interest rate</code></li>
						<li>Next create the <i>ten</i> year growth rate:  <code>growth rate ^ t years</code>.</li>
						<li>Last, get the final amount: <code>growth rate * initial amount</code></li>
					</ul>
					Done!  That gives us our final amount.`,
			instruction: `Type in <code>=a1*(1+b1)^c1</code> to see the savings account
					after several years re-investing your interest.`,
			column_formats: [ '$', '%', ',' ],
			column_titles: ['Starting Saving Account', 'Interest Rate', 'Years' ],
			tests: [
						{ 'a': 10000, 'b': 0.1, 'c': 1 }, 
						{ 'a': 10000, 'b': 0.1, 'c': 3 }, 
						{ 'a': 10000, 'b': 0.1, 'c': 6 }, 
						{ 'a': 10000, 'b': 0.1, 'c': 9 }, 
						{ 'a': 10000, 'b': 0.1, 'c': 12 }, 
						{ 'a': 10000, 'b': 0.1, 'c': 15 }
					],
			solution_f: '=a1*(1+b1)^c1', 
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageTextSchema',
			description: `Before talking about the <code>(</code> and <code>)</code>, or parentheses, we need to 
					address order of operations.
					<br/><br/>
					When completing a math equation, we have to apply the symbols in a certain
					order.  If we don't do this, we can get the wrong result.
					<br/><br/>
					For example, consider <code>=1 - 1 + 1</code>.  How will the computer calculate
					this if we do the <kbd>+</kbd> first?
					<ul>
						<li>=1 - 1 <kbd>+</kbd> 1</li>
						<li>=1 - <kbd>2</kbd></li>
						<li>=1 <kbd>-</kbd> 2</li>
						<li>=<kbd>-1</kbd></li>
					</ul>
					We will get a different result if we do the <kbd>-</kbd> first.
					<ul>
						<li>=1 <kbd>-</kbd> 1 + 1</li>
						<li>=<kbd>0</kbd> + 1</li>
						<li>=0 <kbd>+</kbd> 1</li>
						<li>=<kbd>1</kbd></li>
					</ul>
					<br/><br/>
					As a result, people have decided that we should <b>work from left to right</b>.
					`
		},
		{	type: 'IfPageTextSchema',
			description: `Going from left-to-right works well in most cases, but there is 
					another wrinkle.  Some symbols have priority, and are calculated first.
					<br/><br/>
					For example, <code>*</code> and <code>/</code> have a higher piority than
					<code>+</code> and <code>-</code>.
					<br/><br/>
					For example, consider <code>=1 - 1 * 2</code>.  Normally we would go from
					left to right, meaning that <code>-</code> would happen first.
					However, <code>*</code> has a higher priority.
					<br/><br/>
					As a result, the computer will evaluate the expression in this order:
					<ul>
						<li>=1 - 1 <kbd>*</kbd> 2</li>
						<li>=1 - <kbd>2</kbd></li>
						<li>=1 <kbd>-</kbd> 2</li>
						<li>=<kbd>-1</kbd></li>
					</ul>`
		},
		{	type: 'IfPageTextSchema',
			description: `Exponents have an even higher priority than the other symbols.
					<br/><br/>
					For example, consider <code>=1 - 1 * 2 ^ 2</code>. It will be solved in this order.
					<ul>
						<li>=1 - 1 * 2 <kbd>^</kbd> 2</li>
						<li>=1 - 1 * <kbd>4</kbd></li>
						<li>=1 - 1 <kbd>*</kbd> 4</li>
						<li>=1 - <kbd>4</kbd></li>
						<li>=<kbd>-3</kbd></li>
					</ul>`
		},
		{	type: 'IfPageFormulaSchema',
			description: `Parentheses have the highest priority, "beating" all other operators.
					Because they let us say what happens first, they end up being extremely useful.
					<br/><br/>
					For example, ABC Farms wants to calculate their total tax rate.  However, 
					the spreadsheet has profits split into two columns. We need to add them together
					first, and then multiply the result by the tax rate.`,
			instruction: `Type in <code>=(A1+B1)*C1</code>.  This makes the addition happen before
					the result is multiplied by the tax rate.`,
			column_formats: [ '$', '$', '%'],
			column_titles: ['California Profit', 'Texas Profit', 'Tax Rate' ],
			tests: [
						{ 'a': randB(80, 100), 'b': randB(200, 300), 'c': randPercent(0.1,0.3) }, 
						{ 'a': randB(80, 100), 'b': randB(200, 300), 'c': randPercent(0.1,0.3) }, 
						{ 'a': randB(80, 100), 'b': randB(200, 300), 'c': randPercent(0.1,0.3) }
					],
			solution_f: '=(a1+b1)*c1', 
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageTextSchema',
			description: `We can summarize the rules as PEMDAS.
					<ul>
						<li><b>P</b>arenthesis</li>
						<li><b>E</b>xponents</li>
						<li><b>M</b>ultiplication and <b>D</b>ivision</li>
						<li><b>A</b>ddition and <b>S</b>ubtraction</li>
					</ul>
					Note that <code>*</code> and <code>/</code> have the same precedence level,
					just like <code>+</code> and <code>-</code>.  When you go through an expression,
					work from left to right, solving parentheses, then exponents, then multiplication 
					and division, and finally addition and subtraction.`
		},
		{	type: 'IfPageParsonsSchema',
			description: `Use PEMDAS to arrange the following expression in order.
					Remember to go from left to right.
					<br/><br/>
					Place them in order, with the first operator to be evaluated on top, 
					and the final one on the bottom.`,
			instruction: 'Solve <code>=1 + (2 - 3) * 4 ^ 2 / 5 </code>',
			code: 'tutorial',
			solution_items: [ 
					'=1 + (2 <kbd>-</kbd> 3) * 4 ^ 2 / 5', 
					'=1 + (2 - 3) * 4 <kbd>^</kbd> 2 / 5', 
					'=1 + (2 - 3) <kbd>*</kbd> 4 ^ 2 / 5', 
					'=1 + (2 - 3) * 4 ^ 2 <kbd>/</kbd> 5', 
					'=1 <kbd>+</kbd> (2 - 3 ) * 4 ^ 2 / 5']
		},
		{	type: 'IfPageParsonsSchema',
			description: `Keep using PEMDAS to arrange the following expression in order.
					Remember to go from left to right.
					<br/><br/>
					Place them in order, with the first operator to be evaluated on top, 
					and the final one on the bottom.`,
			instruction: 'Solve <code>=8 + (10 - 2) ^ 2 * 2 + 3</code>',
			code: 'tutorial',
			solution_items: [ 
					'=8 + (10 <kbd>-</kbd> 2) ^ 2 * 2 + 3', 
					'=8 + (10 - 2) <kbd>^</kbd> 2 * 2 + 3', 
					'=8 + (10 - 2) ^ 2 <kbd>*</kbd> 2 + 3', 
					'=8 <kbd>+</kbd> (10 - 2) ^ 2 * 2 + 3', 
					'=8 + (10 - 2) ^ 2 * 2 <kbd>+</kbd> 3']
		},
		{	type: 'IfPageFormulaSchema',
			description: `Why don't you try some problems?
						<br/><br/>
						ABC Farms wants to calculate the yearly bonus amounts for employees at each farm.
						Each employee will be given a tenth of the profits for their farm.`,
			instruction: 'After calculating profit, use division to figure out a tenth of that amount.',
			column_formats: [ '', '$', '$' ],
			column_titles: [ 'Farm', 'Sales', 'Cost' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000) }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000) }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000) }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000) }
					],
			solution_f: '=(b1-c1)/10', 
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Great!  Now, how much will ABC Farms spend <b>in total</b> for the employees
						at each site? 
						<br/><br/>
						Build on your earlier answer. If you need to, review your previous 
						work by hovering over the progress icons below.`,
			instruction: `After calculating profit, use division to figure out a tenth of that amount. 
						Then, multiply by the number of employees`,
			column_formats: [ '', '$', '$',',' ],
			column_titles: [ 'Farm', 'Sales', 'Cost', 'Employees' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 2 }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 5 }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 4 }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 3 }
					],
			solution_f: '=(b1-c1)/10*d1', 
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageTextSchema',
			description: `Tip!  When working with growth rates, it's important to understand how to 
					increase values correctly.
					<br/><br/>
					As an example, for a single year of sales with a 5% growth rate, 
					you would use the formula <code>Sales * 0.05</code>.  But, this will
					give you the <b>amount of increase</b>, and not the total.
					<br/><br/>
					If you want to find the total, you will need to add the increase back into the
					original number.  So, use the formula <code>Sales * 0.05 + Sales</code>.`
		},	
		{	type: 'IfPageFormulaSchema',
			description: 'Great!  Now, how much will revenues increase?',
			instruction: 'Use the given growth rate',
			column_formats: [ '', '$', '$','%' ],
			column_titles: [ 'Farm', 'Revenue', 'Cost', 'Growth Rate' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.2 }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.05 }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.04 }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.1 }
					],
			solution_f: '=b1*d1', 
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'How much will revenues be after a single year?',
			instruction: 'Use the given growth rate',
			column_formats: [ '', '$', '$','%' ],
			column_titles: [ 'Farm', 'Revenue', 'Cost', 'Growth Rate' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.2 }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.05 }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.04 }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.1 }
					],
			solution_f: '=b1+b1*d1', 
			client_f_format: '$',
			code: 'tutorial'
		}
	]
};


/*

	Testing goals:


	Parens with just add/sub
	Parens including mult/div

	Words converted into numbers
	
	Multiple-part questions v. simple-part questions

	number of operators and references and numbers
	use number instead of reference.

*

const paren_concept_comparison = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			instruction: 'Solve the given problem',
			column_formats: [ ',', ',', '$','%' ],
			column_titles: [ 'Alpacas', 'Badgers', 'Cost per animal', 'Growth Rate' ],
			tests: [
						{ 'a': 54, 'b': randB(80, 100), 'c': 0.25, 'd': 0.2 }, 
						{ 'a': 32, 'b': randB(1, 10), 'c': 1.25, 'd': 0.05 }, 
						{ 'a': 1, 'b': randB(10, 100), 'c': 3.2, 'd': 0.04 }, 
						{ 'a': 103, 'b': randB(1, 100), 'c': 0.5, 'd': 0.1 }
					],
			client_f_format: ',',
			code: 'test',
			versions: [
				{
					description: 'Ten animals from each site ran away.  How many animals are now at each farm?',
					solution_f: '=a1+b1-10', 
				},
				{
					description: 'Half of the number of animals at each farm are fully grown. How many animals can we sell?',
					solution_f: '=a1/2+b1/2', 
				},
				{
					description: 'How many animals would we sell if a quarter of them are available?',
					solution_f: '=a1/4+b1/4', 
				},
				{
					description: '',
					solution_f: '=a1/4+b1/4', 
				}
			]
		},
		{	type: 'IfPageFormulaSchema',
			instruction: 'Solve the given problem',
			column_formats: [ ',', ',', '$','%' ],
			column_titles: [ 'Alpacas', 'Badgers', 'Cost per animal', 'Growth Rate' ],
			tests: [
						{ 'a': 54, 'b': randB(80, 100), 'c': 0.25, 'd': 0.2 }, 
						{ 'a': 32, 'b': randB(1, 10), 'c': 1.25, 'd': 0.05 }, 
						{ 'a': 1, 'b': randB(10, 100), 'c': 3.2, 'd': 0.04 }, 
						{ 'a': 103, 'b': randB(1, 100), 'c': 0.5, 'd': 0.1 }
					],
			client_f_format: ',',
			code: 'test',
			versions: [
				{
					description: 'How many animals will be at each farm if ten run away?',
					solution_f: '=a1+b1-10', 
				},
				{
					description: 'What is half of the number of animals at each farm?',
					solution_f: '=a1/2+b1/2', 
				}
			]
		},
		{	type: 'IfPageFormulaSchema',
			description: 'How much will revenues be after a single year?',
			instruction: 'Use the given growth rate',
			column_formats: [ '', '$', '$','%' ],
			column_titles: [ 'Farm', 'Revenue', 'Cost', 'Growth Rate' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.2 }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.05 }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.04 }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.1 }
					],
			solution_f: '=b1+b1*d1', 
			client_f_format: '$',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'How much will revenues be after a single year?',
			instruction: 'Use the given growth rate',
			column_formats: [ '', '$', '$','%' ],
			column_titles: [ 'Farm', 'Revenue', 'Cost', 'Growth Rate' ],
			tests: [
						{ 'a': 'North', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.2 }, 
						{ 'a': 'South', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.05 }, 
						{ 'a': 'East', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.04 }, 
						{ 'a': 'West', 'b': randB(8000, 10000), 'c': randB(4000, 5000), 'd': 0.1 }
					],
			solution_f: '=b1+b1*d1', 
			client_f_format: '$',
			code: 'tutorial'
		}
	]
};

							tags: ['addition', 'multiplication', 'parentheses']
*

const advanced_arithmetic_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems using exponents 
				and parentheses. You must successfully complete six problems before moving on.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct math operators. You do not have to use every column.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 6);
			},
			pages: [
				{	type: 'IfPageFormulaSchema',
					column_formats: [ '$', '$', '%'],
					column_titles: ['Revenue', 'Cost', 'Tax Rate' ],
					instruction: 'Type in the correct formula',
					tests: [
								{ 'a': randB(2000, 10000), 'b': randB(1000, 5000), 'c': randPercent(0.02, 0.2) }, 
								{ 'a': randB(5000, 15000), 'b': randB(1000, 5000), 'c': randPercent(0.02, 0.3) }, 
								{ 'a': randB(2000, 20000), 'b': randB(1000, 5000), 'c': randPercent(0.02, 0.2) }
							],
					client_f_format: '$',
					code: 'test',
					versions: [
						{
							description: `If we continue with the same cost and revenue, 
								how much will we earn in profit over the next ten year period? Ignore taxes.`,
							solution_f: '=(a1-b1)*10'
						},
						{
							description: `How much tax will we owe if we combine two years of payments? 
									First calculate profit, and then apply the tax rate.  
									Double that number to find two years.`,
							solution_f: '=(a1-b1)*2*c1',
						},
						{
							description: `What will the <b>increase</b> in total sales be after one year? 
									Do not give the total sales, but just the amount by which it changed`,
							column_titles: ['NY Sales', 'Texas Sales', 'Growth Rate' ],
							solution_f: '=(a1+b1)*c1', 
						},
						{
							description: `What will the <b>total</b> sales be next year? Hint: include 
								one year's sales as well as the increase.`,
							column_titles: ['NY Sales', 'Texas Sales', 'Growth Rate' ],
							solution_f: '=(a1+b1)*(1+c1)', 
						},
						{
							description: `What will our profit be after 10 years of exponential growth?
									<br/><br/>
									Hint:  x<sub>t</sub> = x<sub>0</sub>(1 + r)<sup>t</sup> 
									is the exponential growth formula.  Find (1 + the growth rate), raise it 
									to the power of 10, and then multiply that by our initial profit.`,
							column_titles: ['Sales', 'Profit', 'Growth Rate' ],
							solution_f: '=b1*(1+c1)^10', 
						}
					]
				}
			]
		}
	]
};


/*
const arithmetic_problem_solving = {
	gen: LinearGen,

	pages: [
		{	type: 'IfPageTextSchema',
			description: `We are now going to solve some more complicated problems. These will 
					require you to figure out how to create a formula to solve a business problems.`
		},	
		{
			gen: AdaptiveGen,

			until: (until_pages: Array<FormulaPageType>): boolean => {
				// Require at least 3 of successful math answers.
				let successful = until_pages.filter( (p: FormulaPageType): boolean => p.correct );
				return (successful.length >= 3);
			},

			test_gen: {
				gen: ShuffleGen,

				pages: [
					// add 4 problems
				]
			},

			tutorial_gen: {
				gen: LinearGen,

				pages: [
					{	type: 'IfPageTextSchema',
						description: `It looks like you are having trouble.  Let's do some review of the 
								basic arithmetic operators.
								<br/><br/>
								Click the <code>Continue</code> button on the bottom-right of the screen.`
					},
					simple_arithmetic_overview
				]
			}
		},
		{
			gen: AdaptiveGen,

			until: (until_pages: Array<FormulaPageType>): boolean => {
				// Require at least 3 successful math answers.
				let successful = until_pages.filter( (p: FormulaPageType): boolean => p.correct );
				return (successful.length >= 3);
			},

			test_gen: {
				gen: ShuffleGen,

				pages: [
					// add 4 problems
				]
			},

			tutorial_gen: {
				gen: LinearGen,

				pages: [
					{	type: 'IfPageTextSchema',
						description: `It looks like you are having trouble.  Let's do some review of the 
								advanced arithmetic operators.
								<br/><br/>
								Click the <code>Continue</code> button on the bottom-right of the screen.`
					},
					advanced_arithmetic_overview
				]
			}
		},
		{	type: 'IfPageTextSchema',
			description: `Great job! You finished the business problem-solving section.
					<br/><br/>
					Click the <code>Continue</code> button on the bottom-right of the screen.`
		}
	]
};
*



//////////////////////////////////////////////////////////////
// Assemble final components.
//////////////////////////////////////////////////////////////
*/
const accounting1 = {
	code: 'accounting1',
	title: 'Basic Accounting',
	description: 'Learn about basic accounting terms',
	version: 1.0,

	gen: {
		gen: LinearGen,
		pages: [
			...finish_questions
		]
	}
};


module.exports = { accounting1 };
