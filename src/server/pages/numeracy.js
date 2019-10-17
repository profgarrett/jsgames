/*
	This section contains surveys covering basic numeracy skills.

*/
const { KC_NAMES } = require('./../kcs/kc');


const _base = {
	type: 'IfPageNumberAnswerSchema',
	show_feedback_on: false,
	code: 'test',
	instruction: `You may want to use a calculator for this task. If you do not have one handy,
		you can use the one built into your computer, or open 
		<a target='_blank' href='https://calculator-1.com/'>Calculator1</a> in another tab.`,

};


const numeracy_pretest = [

// Questions from UK Numeracy Practice Test 2
	{	..._base,
		template_id: 'numeracy_uk_1',
		description: `Teachers organized activities for 3 classes of 24 students,
			and 4 classes of 28 students. 
			<br/><br/>
			What was the total number of students?`,
		solution: 184, // = 3*24 + 4*28
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_ARITHMETIC, KC_NAMES.ADD, KC_NAMES.MULTIPLY ]

	},{	..._base,
		template_id: 'numeracy_uk_2',
		description: `All 30 students in a class took part in a competition
			to raise money for charity. The students were expected to get an 
			average of 18 words correct each. The average amount of 
			sponsorship was 20 cents for each correct word.
			<br/><br/>
			How many <b>dollars</b> would the class expect to raise for charity?`,
		solution: 108, // =30*18*20/100
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_ARITHMETIC, KC_NAMES.MULTIPLY, KC_NAMES.DIVIDE ]

	},{ ..._base,
		template_id: 'numeracy_uk_3',
		description: `Students were asked to stretch a spring to extend its length by 
			forty per cent. The original length of the spring was 45 inches.
			<br/><br/>
			What should be the length of the <b>fully-extended</b> spring? 
			Give your answer in inches.)`,
		solution: 63, // =45*1.4
		kcs: [ KC_NAMES.MULTIPLY_INCREASE, KC_NAMES.PERCENT_TO_DECIMAL ]

	},{ ..._base,
		template_id: 'numeracy_uk_4',
		description: `Six out of 25 pupils scored full marks in a test.
			<br/><br/>
			What percentage of pupils scored full marks? Write your answer
			as the integer part of the answer, i.e. 54 for 54%. Do not write a % sign`,
		solution: 24, // =6/25 
		kcs: [ KC_NAMES.DIVIDE_TO_PERCENT ]
		
	},{ ..._base,
		template_id: 'numeracy_uk_5',
		description: `A student achieved 84 points out of a possible 120 in a test.
			<br/><br/>
			What percentage did the pupil achieve for the test? Write your answer
			as the integer part of the answer, i.e. 54 for 54%. Do not write a % sign`,
		solution: 70, // =84/120
		kcs: [ KC_NAMES.DIVIDE, KC_NAMES.DIVIDE_TO_PERCENT ]

	},

// NDG Questions not covered by exam.

	{ ..._base,
		template_id: 'numeracy_ndg_1',
		description: 'What is 34.7% as a decimal number?',
		solution: 0.347, 
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL ]

	},{ ..._base,
		template_id: 'numeracy_ndg_2',
		description: 'What is 234% as a decimal number?',
		solution: 2.34, 
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_OVER1 ]

	},{ ..._base,
		template_id: 'numeracy_ndg_3',
		description: 'What is $28.49 when rounded to the decimal point?',
		solution: 28, 
		kcs: [ KC_NAMES.ROUNDING ]

	},{ ..._base,
		template_id: 'numeracy_ndg_4',
		description: 'What is $2,023.81 when rounded to thousands?',
		solution: 2000, 
		kcs: [ KC_NAMES.ROUNDING ]
/*
	},{ ..._base,
		description: `How much will be in your bank account if you save 
			$1,000 in a bank for 4 years?  Use 5% <b>compound</b> interest.
			<br/><br/>
			Give your answer in dollars, rounding off any pennies.`,
		solution: 1216,  // =1000*(1+0.05^4)
		kcs: [ KC_NAMES.EXPONENT_GROWTH, KC_NAMES.INTEREST_COMPLEX ]

	},{ ..._base,
		description: `How much will you pay <b>in interest fees</b> if you borrow $100
			for 10 years at 1% interest?  Do not use compound interest.
			<br/><br/>
			Give your answer in dollars, rounding off any pennies.`,
		solution: 10,  // =100*(0.01*10)
		kcs: [ KC_NAMES.MULTIPLY, KC_NAMES.INTEREST_SIMPLE ]
*/
	}
];



const numeracy_posttest = [

// Questions from UK Numeracy Practice Test 2
	{	..._base,
		description: `Teachers organized activities for 3 classes of 24 students,
			and 4 classes of 28 students. 
			<br/><br/>
			What was the total number of students?`,
		solution: 184, // = 3*24 + 4*28
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_ARITHMETIC, KC_NAMES.ADD, KC_NAMES.MULTIPLY ]

	},{	..._base,
		description: `All 30 students in a class took part in a competition
			to raise money for charity. The students were expected to get an 
			average of 18 words correct each. The average amount of 
			sponsorship was 20 cents for each correct word.
			<br/><br/>
			How many <b>dollars</b> would the class expect to raise for charity?`,
		solution: 108, // =30*18*20/100
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_ARITHMETIC, KC_NAMES.MULTIPLY, KC_NAMES.DIVIDE ]

	},{ ..._base,
		description: `Students were asked to stretch a spring to extend its length by 
			forty per cent. The original length of the spring was 45 inches.
			<br/><br/>
			What should be the length of the <b>fully-extended</b> spring? 
			Give your answer in inches.)`,
		solution: 63, // =45*1.4
		kcs: [ KC_NAMES.MULTIPLY_INCREASE, KC_NAMES.PERCENT_TO_DECIMAL ]

	},{ ..._base,
		description: `Six out of 25 pupils scored full marks in a test.
			<br/><br/>
			What percentage of pupils scored full marks? Write your answer
			as the integer part of the answer, i.e. 54 for 54%. Do not write a % sign`,
		solution: 24, // =6/25 
		kcs: [ KC_NAMES.DIVIDE_TO_PERCENT ]
		
	},{ ..._base,
		description: `A student achieved 84 points out of a possible 120 in a test.
			<br/><br/>
			What percentage did the pupil achieve for the test? Write your answer
			as the integer part of the answer, i.e. 54 for 54%. Do not write a % sign`,
		solution: 70, // =84/120
		kcs: [ KC_NAMES.DIVIDE, KC_NAMES.DIVIDE_TO_PERCENT ]

	},

// NDG Questions not coverd by exam.

	{ ..._base,
		description: 'What is 34.7% as a decimal number?',
		solution: 0.347, 
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL ]

	},{ ..._base,
		description: 'What is 234% as a decimal number?',
		solution: 2.34, 
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_OVER1 ]

	},{ ..._base,
		description: 'What is $28.49 when rounded to the decimal point?',
		solution: 28, 
		kcs: [ KC_NAMES.ROUNDING ]

	},{ ..._base,
		description: 'What is $2,023.81 when rounded to thousands?',
		solution: 2000, 
		kcs: [ KC_NAMES.ROUNDING ]

	},{ ..._base,
		description: `How much will be in your bank account if you save 
			$1,000 in a bank for 4 years?  Use 5% <b>compound</b> interest.
			<br/><br/>
			Give your answer in dollars, rounding off any pennies.`,
		solution: 1216,  // =1000*(1+0.05^4)
		kcs: [ KC_NAMES.EXPONENT_GROWTH, KC_NAMES.INTEREST_COMPLEX ]

	},{ ..._base,
		description: `How much will you pay <b>in interest fees</b> if you borrow $100
			for 10 years at 1% interest?  Do not use compound interest.
			<br/><br/>
			Give your answer in dollars, rounding off any pennies.`,
		solution: 10,  // =100*(0.01*10)
		kcs: [ KC_NAMES.MULTIPLY, KC_NAMES.INTEREST_SIMPLE ]

	}

];


module.exports = {
	numeracy_pretest,
	numeracy_posttest
};