//const MongoClient = require('mongodb').MongoClient;
const { CgLevelSchema,
		CgPageSchema,
		CgBarChartSchema,
		CgQuestionSchema } = require('./../shared/ChartGame');
const { DataFactory } = require('./DataFactory');



//  Converts the client-side js class for schema into a server-side model
// The model includes additional code for evaluating success/failure.
function buildModel(schemaClass) {
	return schemaClass;
}

// Create exportable models.
module.exports = {
	CgQuestionModel: buildModel(CgQuestionSchema),
	CgLevelModel: buildModel(CgLevelSchema),
	CgPageModel: buildModel(CgPageSchema),
	CgBarChartModel: buildModel(CgBarChartSchema)
};

const CgLevelModelFactory = {
	createTest: function() {
		let level = new (module.exports.CgLevelModel)({
			title: 'Test Level', 
			rules: 'test', 
			completed: false 
		});
		console.log(level);
		this.updateTest(level);

		return level;
	},

	// Function used to update test levels.
	updateTest: function(level) {
		if(level.rules !== 'test') 
			throw new Error('Invalid: Can not update level type of ' + level.rules + ' that does not match test');

		if(level.completed) 
			throw new Error('Invalid: Can not update a completed level');

		const dF = DataFactory;
		const data = dF.random_sequence({n:5, min: 1, max:10, titles:['A', 'B', 'C', 'D', 'E']});
		const chart = new module.exports.CgBarChartModel({ data });
		const max_num = 9999999; // largest possible number.

		const questions = [
			{ 	text: 'What is the largest number?', 
				correct_answer: data => data.reduce( (accum, x) => Math.max(accum, x.value), 0 )
			},
			{	text: 'What is the smallest number?',
				correct_answer: data => data.reduce( (accum, x) => Math.min(accum, x.value), max_num )
			},
			{	text: 'What is the last number?',
				correct_answer: data => data[data.length-1].value
			},
			{	text: 'What is the first number?',
				correct_answer: data => data[0].value
			}
		];

		const q_index = level.pages.length % questions.length;
		const ans = questions[q_index].correct_answer(data);
		console.log(ans);
		console.log(data);
		console.log(questions[q_index]);

		const q = new module.exports.CgQuestionModel({ 
			'text': questions[q_index].text,
			'correct_answer': questions[q_index].correct_answer(data)
		});

		console.log(q);
		// update score.
		level.score.refresh(level);

		const success = level.score.streak > 3;

		if(success) {
			// Done!
			level.completed = true;
		} else {
			// Add a new page.
			level.pages.push(new module.exports.CgPageModel({
				items: [chart, q]
			}));
		}
	}

};
module.exports.CgLevelModelFactory = CgLevelModelFactory;