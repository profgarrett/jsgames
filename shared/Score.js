
/*
	Score is a class for recording success and failure.
	It's shared on both client and server sides.

	Score can be used on a variety of game types.
	It should be used to track user-submitted information in a success or failure.

	It will iterate through passed objects to find .correct boolean variable.
	If an object has .items, it will iterate through each to find .correct.
*/
class Score { 
	// Allow initializing this from the raw JSON of a serialized version.
	constructor(props) {
		this['results'] = props && props.results ? props.results : [];
	}

	get attempted() {
		return this['results'].length;
	}

	get streak() {
		let i=this['results'].length;
		let accum = 0;

		for(i=this['results'].length-1; i>=0; i--) {
			if(this['results'][i]) {
				accum++;
			} else {
				return accum;
			}
		}
		return accum;
	}

	// Return number of correctly answered questions.
	get correct() {
		if(this['results'].length === 0) 
			return 0;
		else
			return this['results'].reduce((accum, i) => accum + (i ? 1 : 0), 0 );
	}

	// Get number in incorrect questions.
	get incorrect() {
		return this.attempted - this.correct;
	}

	// Return the results as an array of whatever is passed.
	toArray(y=1, n=0) {
		return this['results'].map( res => res ? y : n);
	}

	// Return the results as a simple string of Y and N.
	toString(y='Y', n='N') {
		return this.toArray(y, n).toString();
	}

	/*
		Update score based off of level.
		It will attempt to get a score from any item implementing 'score' (or items[1..].score)
		Null values (unanswered) will not be included.

		@arg object level
	*/
	refresh(level) {
		let result = null;
		this['results'] = []; 

		level.pages.map( p => {
			// Objects implementing items. E.g., chart Game
			if(typeof p.items !== 'undefined' ) {
				p.items.map( i => {
					if(typeof i.correct !== 'undefined') {
						result = i.correct;
						if(result === true || result === false ) this['results'].push(result);
					}				
				});
			}
			// Objects without items.  E.g., if Game 
			if(typeof p.correct !== 'undefined' && p.correct !== null ) {
				console.assert(p.correct === true || p.correct === false, 'score.refresh.if.p.correct.isnottrueorfalse');
				this['results'].push(p.correct);
			}
		});
	}
}


module.exports = {
	Score
};

