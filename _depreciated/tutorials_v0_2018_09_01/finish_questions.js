const finish_questions = [
	{
		type: 'IfPageChoiceSchema',
		description: `Great job!  You've finished with this section.<br/><br/>
				How difficult or easy was the <b>instructional material</b> in this section?`,
		client_items: ['Very easy', 'Easy', 'Neutral', 'Difficult', 'Very difficult'],
		solution: '*',
		show_feedback_on: false
	},{
		type: 'IfPageChoiceSchema',
		description: 'How would you describe this activity? I invested',
		client_items: [
			'1.	Very, very low mental effort',
			'2.	Very low mental effort',
			'3.	Low mental effort',
			'4.	Rather low mental effort',
			'5.	Neither low nor high mental effort',
			'6.	Rather high mental effort',
			'7.	High mental effort',
			'8.	Very high mental effort',
			'9.	Very, very high mental effort'
		],
		solution: '*',
		show_feedback_on: false
	}
];

module.exports.finish_questions = finish_questions;
