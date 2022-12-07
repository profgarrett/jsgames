// const { LinearGen, ShuffleGen } = require('./../Gens');
//const { ckt1 } = require('./ckt');
const { vislit } = require('./../pages/vislit');
const { amt_consent, use_consent } = require('./../pages/consent');
const { amt_demographics } = require('./../pages/vislit_demographics');
const { sns } = require('./../pages/sns');
const { numeracy_pretest } = require('./../pages/numeracy');
const { bnt } = require('./../pages/bnt');

import type { GenType } from '../Gens';
//import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';


const surveycharts_wu = ({
	code: 'surveycharts_wu', 
	title: 'Chart Survey', 
	description: 'Measure your ability to interpret common charts',
	show_score_after_completing: true,
	version: 1.0,
	show_progress: false,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			// Tell the user thanks and give them the code for the session.
			{	type: 'IfPageTextSchema',
				description: `This assessment reviews your ability to interpret common charts.`,
			},
		
			vislit,

			// Tell the user thanks and give them the code for the session.
			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this assignment!`,
			},
			
		]
	})

});



const surveycharts_amt = ({
	code: 'surveycharts_amt', 
	title: 'Chart Survey (AMT)', 
	description: 'Test your ability to interpret common charts',
	show_score_after_completing: false,
	version: 1.0,
	show_progress: false,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			
			amt_consent,
	
			// Get MTurk user account information.
			{ 
				type: 'IfPageShortTextAnswerSchema',
				description: '', //Welcome to the survey site!',
				instruction: 'Please input your Amazon Mechanical Turk user account. We will use this information to record that you completed the survey.',
				show_feedback_on: false,
				time_minimum: 2,
				code: 'test',
				template_id: 'mechanicalturk_username',
			},

			// Optional email
			{ 
				type: 'IfPageShortTextAnswerSchema',
				description: '', //Welcome to the survey site!',
				instruction: 'Optionally, please input your email address. We will this email only to contact you if there is a problem with your survey or payment.',
				show_feedback_on: false,
				time_minimum: 1,
				code: 'test',
				template_id: 'mechanicalturk_email',
			},


			...amt_demographics,

			// Math
			{	type: 'IfPageTextSchema',
				time_minimum: 2,
				description: `You have completed filling in the demographic information. 
					<br/><br/>
					The next section will ask you questions about your math skills, and
					ask you to complete several math questions. Feel free to use a 
					calculator on your computer.`,
			},

			...sns,
			//...bnt,

			// Transition
			{	type: 'IfPageTextSchema',
				time_minimum: 2,
				description: `You have completed answering the math questions.
					<br/><br/>
					The next section will start asking you questions about various charts.`,
			},

			
			vislit,


			// Hard math problems
			{	type: 'IfPageTextSchema',
				time_minimum: 2,
				description: `Good job!  You've finished the chart questions.
					<br/><br/>
					The next section will ask you several final math questions.`,
			},

			...numeracy_pretest,


			// Ask if they want to get a copy of their results
			{	type: 'IfPageShortTextAnswerSchema',
				time_minimum: 1,
				description: 'Thank you for completing this assessment!',
				instruction: `If you would like to receive an emailed copy of your results,
					please type an email address below. You should receive an email in 
					approximately 4-5 weeks. Otherwise, write "no".`,
				show_feedback_on: false,
				code: 'test',
				correct_required: false,
				template_id: 'mechanicalturk_emailresults',
			},

			// Tell the user thanks and give them the code for the session.
			{	type: 'IfPageTextSchema',
				time_minimum: 1,
				description: `<b>Congratulations!</b>  You have completed this assessment!
					<br/><br/>
					Please return to the Amazon Mechnical Turk website and input the code below.
					<br/><br/>
					{session_code}`,
				template_values: {
					'session_code': 'level._id',
				},
			},
			
		]
	})
});



export { surveycharts_amt, surveycharts_wu };
