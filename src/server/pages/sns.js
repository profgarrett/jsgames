// @flow
/**
	Subject Numeracy Scale	

Source: 
	http://cbssm.med.umich.edu/sites/cbssm/files/media/subjective_numeracy_scale_1.pdf
	https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3886121/

Refs:
	Fagerlin, A., Zikmund-Fisher, B.J., Ubel, P.A., Jankovic, A., Derry, H.A., & Smith, D.M.
	Measuring numeracy without a math test: Development of the Subjective Numeracy Scale
	(SNS). Medical Decision Making, 2007: 27: 672-680.

	Zikmund-Fisher, B.J., Smith, D.M., Ubel, P.A., Fagerlin, A. Validation of the subjective
	numeracy scale (SNS): Effects of low numeracy on comprehension of risk communications and
	utility elicitations. Medical Decision Making, 2007: 27: 663-671. 

**/

const good_scale = [
	'1. Very poor',
	'2. ',
	'3. ',
	'4. ',
	'5. ',
	'6. Extremely good',
];


const _base = {
	type: 'IfPageChoiceSchema',
	solution: '*',
	show_feedback_on: false,
	time_minimum: 2,
};


const sns = [
	{	..._base,
		template_id: 'sns_1_fraction',
		description: 'How good are you at working with fractions?',
		client_items: good_scale

	},{ ..._base,
		template_id: 'sns_2_percentage',
		description: 'How good are you at working with percentages?',
		client_items: good_scale
		
	},{ ..._base,
		template_id: 'sns_3_tip',
		description: 'How good are you at calculating a 15% tip?',
		client_items: good_scale
		
	},{ ..._base,
		template_id: 'sns_4_shirt',
		description: 'How good are you at figuring out how much a shirt will cost if it is 25% off?',
		client_items: good_scale
		
	},{ ..._base,
		template_id: 'sns_5_prefertables',
		description: 'When reading the newspaper, how <b>helpful</b> do you find tables and graphs that are parts of a story?',
		client_items: [
			'1. Not at all helpful',
			'2.',
			'3.',
			'4.',
			'5.',
			'6. Extremely helpful',
		]
		
	},{ ..._base,
		template_id: 'sns_6_prefernumbers',
		description: `When people tell you the chance of something happening, 
			do you prefer that they use <b>words</b> ("it rarely happens") or <b>numbers</b>
			("there's a 1% chance)?`,
		client_items: [
			'1. Always prefer words',
			'2.',
			'3.',
			'4.',
			'5.',
			'6. Always prefer numbers',
		]

	},{ ..._base,
		template_id: 'sns_7_preferwords',
		description: `When you hear a weather forecast, do you prefer predictions using <b>percentages</b> 
			(e.g., “there will be a 20% chance of rain today”) or predictions using only <b>words</b> 
			(e.g., “there is a small chance of rain today”)?`,
		client_items: [
			'1. Always prefer percentages',
			'2.',
			'3.',
			'4.',
			'5.',
			'6. Always prefer words',
		]
	},{ ..._base,
		template_id: 'sns_8_numbersuseful',
		description: 'How <b>often</b> do you find numerical information to be useful?',
		client_items: [
			'1. Never',
			'2.',
			'3.',
			'4.',
			'5.',
			'6. Very often',
		]

	}
];

module.exports = { sns };
