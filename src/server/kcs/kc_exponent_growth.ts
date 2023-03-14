// @ts-nocheck

import { KC_NAMES } from './../kcs/kc';

/*
	Exponents introduction.

	Concepts:
		Compound growth
*/
const tutorial_pages = [

	{	type: 'IfPageFormulaSchema',
		description: `Imagine that you invest $100 into a savings account. If you have
				a 5% interest rate, how much money will you have after 5 years?
				<br/><br/>
				<i>Simple</i> interest assumes that we pull out
				all of the new cash earned each year (instead of putting it back into the account). 
				The formula will be <code>starting cash * (1 + interest rate * years)</code>
				<br/><br/>
				The result will give us the total cash in our account, as well as all of the 
				new money we have earned.`,
		instruction: `Type in <code>=a1*(1+b1*c1)</code> to see the ending amount in your
				savings account using simple interest.`,
		column_formats: [ '$', '%', ',' ],
		column_titles: ['Starting Saving Account', 'Interest Rate', 'Years' ],
		tests: [
					{ 'a': 10000, 'b': 0.1, 'c': 1 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 2 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 3 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 4 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 5 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 10 }
				],
		solution_f: '=a1*(1+b1*c1)', 
		client_f_format: '$',
		code: 'tutorial'
	},
	{	type: 'IfPageTextSchema',
		description: `We can also use <i>compound</i> interest.  This 
				assumes that we put all newly earned money back into the account.
				<br/><br/>
				For example, if you deposit $100 in a savings account at 10% interest, you will
				have $110 at the end of the year.  If you then put the whole amount back into the 
				bank, you will earn more than if you took the $10 increase home. 
				<br/><br/>
				The equation for exponential growth is 
				x<sub>t</sub> = x<sub>0</sub>(1 + r)<sup>t</sup>. This looks complicated, 
				but is easier to read in Excel as something like this: <code> =a1*(1+b1)^c1</code>.
				<br/><br/>
				It's helpful to realize that the major differences between the two approaches are 
				<ul>
					<li>Replace a <code>*</code> with a <code>^</code></li>
					<li>Move the final parenthesis</li>
				</ul>
				The formulas for interest are the same whether you are <i>receiving</i> money
				or <i>paying</i> money!  So, you could calculate the money you will <i>owe</i> on a car loan, 
				or the <i>earnings</i> from a savings account.
				`,
		code: 'tutorial'
	},
	{	type: 'IfPageTextSchema',
		description: `If you're not clear on the difference between simple and compound interest,
				please stop and watch the video below.
				<br/><br/>
				<a href='https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/interest-basics-tutorial/v/introduction-to-interest'
					target='_blank'>Khan Academy: Introduction to Interest</a>
				<br/><br/>
				If you don't understand these concepts, you will find the next sections very difficult to complete.
				`,
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: `Let's calculate the amount of money we will have using <i>compound</i> interest.
				<br/><br/>
				Normally, you would calculate the return rate as <code>1+interest_rate * years</code>.
				However, since we will put all earnings back into the account, we will calculate it as 
				<code>(1+interest_rate) ^ years</code>
				<br/><br/>
				We then multiply it by the amount of money we originally invested.
				That gives us the final amount in our savings account.`,
		instruction: `Type in <code>=a1*(1+b1)^c1</code> to see the savings account
				after several years of re-investing your interest. Notice how we are earning more
				by using compound interest instead of simple interest.`,
		column_formats: [ '$', '%', ',' ],
		column_titles: ['Starting Saving Account', 'Interest Rate', 'Years' ],
		tests: [
					{ 'a': 10000, 'b': 0.1, 'c': 1 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 2 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 3 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 4 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 5 }, 
					{ 'a': 10000, 'b': 0.1, 'c': 10 }
				],
		solution_f: '=a1*(1+b1)^c1', 
		client_f_format: '$',
		code: 'tutorial'
	},
];



const farm_data = {
	column_titles: ['Alpacas', 'Rate', 'Years' ],
	column_formats: [ ',', '%', ','],
	tests: [
			{ 'a': 10, 'b': 0.05, 'c': 1 }, 
			{ 'a': 120, 'b': 0.02, 'c': 5 }, 
			{ 'a': 80, 'b': 0.04, 'c': 10 }, 
			{ 'a': 50, 'b': 0.10, 'c': 20 }, 
		]
};

// Use only part of the farm_data.
function use( a: boolean, b: boolean, c: boolean): any {
	const d = {
		column_titles: [],
		column_formats: [],
		tests: []
	};

	if(a) {
		d.column_titles.push(farm_data.column_titles[0]);
		d.column_formats.push(farm_data.column_formats[0]);
	}
	if(b) {
		d.column_titles.push(farm_data.column_titles[1]);
		d.column_formats.push(farm_data.column_formats[1]);
	}
	if(c) {
		d.column_titles.push(farm_data.column_titles[2]);
		d.column_formats.push(farm_data.column_formats[2]);
	}

	farm_data.tests.map( test => {
		const t = {};
		if(a) {
			t['a'] = test['a'];
		}
		if(b) {
			if(typeof t['a'] === 'undefined') {
				t['a'] = test['b'];
			} else {
				t['b'] = test['b'];
			}
		}
		if(c) {
			if(typeof t['a'] === 'undefined') {
				t['a'] = test['c'];
			} else if (typeof t['b'] === 'undefined') {
				t['b'] = test['c'];
			} else {
				t['c'] = test['c'];
			}
		}
		d.tests.push(t);
	});

	return d;
}


const _base = {
	type: 'IfPageFormulaSchema',
	instruction: `
		Type in the correct formula. The ending amount will be:
		<ul>
			<li>Compound growth: <code>Starting Amount * (1 + Rate) ^ Years</code></li>
			<li>Simple growth: <code>=Starting Amount * (1 + Rate * Years)</code></li>
		</ul>
		`,
	client_f_format: ',',
	code: 'test',
	template_values: {
		'n': '[2-6]'
	},
	kcs: [KC_NAMES.EXPONENT_GROWTH]
};

const test_pages = [
	{	..._base,
		...use(true, false, false),
		solution_f: '=a1*(1+({n}/100))^10', 
		description: 'How many Alpacas will you have after 10 years?  Use a {n}% <b>compound</b> growth rate.',
	},{	..._base,
		...use(true, false, false),
		solution_f: '=a1*(1+{n}/100*10)', 
		description: 'How many Alpacas will you have after 10 years?  Use a {n}% <b>simple</b> growth rate.',
	},{	..._base,
		...use(false, false, true),
		solution_f: '=100*(1+({n}/100))^a1', 
		description: 'If we start with 100 Alpacas, how many will we end up with?  Use a {n}% <b>compound</b> growth rate.',
	},{	..._base,
		...use(false, false, true),
		solution_f: '=100*(1+{n}/100*a1)', 
		description: 'If we start with 100 Alpacas, how many will we end up with?  Use a {n}% <b>simple</b> growth rate.',
	},{	..._base,
		...use(true, true, true),
		solution_f: '=a1*(1+b1)^c1',  
		description: 'How many Alpacas will we end up with?  Use the values from the table and a <b>compound</b> growth rate. ',
	},{	..._base,
		...use(true, true, true),
		solution_f: '=a1*(1+b1*c1)',  
		description: 'How many Alpacas will we end up with?  Use the values from the table and a <b>simple</b> growth rate. ',
	},


	{	..._base,
		...use(false, false, true),
		solution_f: '=1000*(1+({n}/100))^a1', 
		client_f_format: '$',
		description: 'Assume you take a $1,000 loan at {n}% <b>compound</b> interest.  How much cash will you give to the bank? Assume that you repay the loan in a single lump sum at the end of the loan period.',
	},{	..._base,
		...use(false, false, true),
		solution_f: '=1000*(1+({n}/100)*a1)', 
		client_f_format: '$',
		description: 'Assume you take a $1,000 loan at {n}% <b>simple</b> interest.  How much cash will you give to the bank?',
	},{	..._base,
		...use(false, true, false),
		solution_f: '=1000*(1+a1)^{n}', 
		client_f_format: '$',
		description: 'Assume you take a $1,000 loan for {n} years.  Use <b>compound</b> interest.  How much cash will you give to the bank? Assume that you repay the loan in a single lump sum at the end of the loan period.',
	},{	..._base,
		...use(false, true, false),
		solution_f: '=1000*(1+a1*{n})', 
		client_f_format: '$',
		description: 'Assume you take a $1,000 loan for {n} years.  Use <b>simple</b> interest.  How much cash will you give to the bank?',
	},

	{	..._base,
		...use(false, true, true),
		solution_f: '=1000*(1+a1)^b1', 
		client_f_format: '$',
		description: 'Assume you take a $1,000 loan.  Use <b>compound</b> interest and the values in the table.  How much cash will you give to the bank? Assume that you repay the loan in a single lump sum at the end of the loan period.',
	},{	..._base,
		...use(false, true, true),
		solution_f: '=1000*(1+a1*b1)', 
		client_f_format: '$',
		description: 'Assume you take a $1,000 loan.  Use <b>simple</b> interest and the values in the table.  How much cash will you give to the bank?',
	},


];






const kc_exponent_growth = {
		kc: KC_NAMES.EXPONENT_GROWTH,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
//	}: AdaptiveKC)
};

export { kc_exponent_growth }