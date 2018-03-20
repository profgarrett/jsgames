const { Schema } = require('./Schema');
const { Score } = require('./Score');

let isDef = function(v) {
	return typeof v !== 'undefined';
};


// Question
class CgQuestionSchema extends Schema {

	get schema() {
		return {
			text: { type: 'String', initialize: (t) => isDef(t) ? t : 'Question Text' },
			answers: { type: 'Mixed', initialize: (o) => isDef(o) ? o : null },  
			correct_answer: { type: 'Mixed', initialize: (t) => isDef(t) ? t : 'Correct answer' }, 
			user_answer: {type: 'Mixed', initialize: (o) => isDef(o) ? o : null },
			updated: { type: 'Date', initialize: (dt) => isDef(dt) ? dt : null },
		};
	}

	// Is the user answer correct?
	// If not set, return null.  Otherwise, return true/false.
	get correct() {
		return this.user_answer === null ? null : this.user_answer == this.correct_answer;
	}

	// Update user fields if possible.
	// Will not update answer if already set.
	updateUserFields(json) {
		
		if(json.type !== this.type ) 
			throw new Error('Invalid type '+json.type+' provided  to ' + this.type + '.updateUserFields');

		if(this.user_answer === null && json.user_answer !== null) {
			this.user_answer = json.user_answer;
			this.updated = Date();
			
		} else if (this.user_answer !== null && this.user_answer !== json.user_answer ) {
			throw new Error('Invalid attempt to update non-null CgQuestionSchema to a new value');
		}

		return this;
	}}


// Chart
class CgBarChartSchema extends Schema {

	get schema() {
		return {
			data: { type: 'Mixed', initialize: (o) => isDef(o) ? o : [1,2,3] },
		};
	}
}


// Valid types for schema on CgPageSchema.
let CgPageSchemaValidTypes = {
	'CgQuestionSchema': CgQuestionSchema,
	'CgBarChartSchema': CgBarChartSchema
};



// Page
class CgPageSchema extends Schema {

	get schema() {
		return {
			items: { 
				type: 'Array', 
				initialize: (a) => a ? a.map(json => new CgPageSchemaValidTypes[json.type](json)) : []
			}
		};
	}

	// If items have a function called updateUserFields, then run it on it one with the correct json.
	// Assumes unmodified array order.
	updateUserFields(json) {
		if(json.type !== this.type ) 
			throw new Error('Invalid type '+json.type+' provided  to ' + this.type + '.updateUserFields');
		if(json.items.length !== this.items.length ) 
			throw new Error('Invalid length of json and array items in CgPageSchema');

		this.items.map( (item, i) => item.updateUserFields ? item.updateUserFields(json.items[i]) : false );
		return this;
	}

}



// Level
class CgLevelSchema extends Schema {

	get schema() {
		return {
			_id: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			title: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			completed: { type: 'Boolean', initialize: (s) => isDef(s) ? s : false },
			rules: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			//data: { type: 'Object', initialize: (o) => o ? o : {} },
			pages: { type: 'Array', initialize: (aJ) => isDef(aJ) ? aJ.map(j => new CgPageSchema(j) ) : [] },
			created: { type: 'Date', initialize: (dt) => isDef(dt) ? new Date(dt) : Date() },
			score: { type: 'Score', initialize: (s) => new Score(s) }
		};
	}

	updateUserFields(json) {
		if(json.type !== this.type ) 
			throw new Error('Invalid type '+json.type+' provided  to ' + this.type + '.updateUserFields');

		this.pages.map( (p, index) => p.updateUserFields(json.pages[index]) );

		return this;
	}

}



module.exports = {
	CgLevelSchema,
	CgPageSchema,
	CgQuestionSchema,
	CgBarChartSchema
};

