// @flow

const NAMES = {
	first: [ 'John', 'Sarah', 'Bill', 'Amos', 'Armine', 'Zack', 'Maria', 'Ayoub', 'Thomas', 'James',
		'Jennifer', 'Ani', 'Rosamond', 'Joyce', 'Nina', 'Alex' ],
	last: ['Smith', 'Tsao', 'Atlas', 'Morales', 'Sanchez', 'Lin', 'Ballard', 'Ellis', 'Castro', 'Lee',
		'Brady', 'Marshall', 'Sorrel', 'Grooters']
};

const DataFactory = {

	// Return a date before or after today by a certain range.
	// @seed is optional.
	randDate(plus_or_minus_days: number = 0, seed?: number): Date {
		let d = new Date();
		let offset = DataFactory.randB(-plus_or_minus_days, plus_or_minus_days, seed);
		d.setDate(d.getDate() + offset);
		return d;
	},

	// Return a random integer between the two given numbers.
	// @seed is optional.
	randB: (from: number, to: number, seed?: number): number => {
		return Math.floor(
			(typeof seed === 'undefined' ? Math.random() : seed )
			* (to-from+1)+from
		);
	},

	// Return one of the given array.
	// @seed is optional.
	randOf: (a: Array<string>, seed?: number ): any => {
		let i = Math.floor( 
					(typeof seed === 'undefined' ?  Math.random() : seed )
					* a.length);
		return a[i];
	},

	randNumbers: (rows: number, cols: number = 3, max_n: number = 10): Array<number> =>{
		const alpha = 'abcdefghijklmnopqrstuvwxyz';
		let results = Array();
		let result = {};

		for(let i=0; i<rows; i++) {
			result = {};
			for(let j=0; j<cols; j++)  {
				result[ alpha.substr(j,1) ] = DataFactory.randB(0, max_n);
			}
			results.push(result);
		}
		return results;
	},

	randDates: (rows: number, columns: number = 1, 
				options: Object={ a_range: 600, b_range: 600, c_range: 600}): Array<Object> => {
		let results = [];
		for(let i=0; i<rows; i++) {
			results.push({ a: DataFactory.randDate( -1*DataFactory.randB(0,options.a_range) ) });	
			// ugly/lazy hack
			if(columns > 1) results[results.length-1]['b'] = DataFactory.randDate( -1*DataFactory.randB(0,options.b_range) );
			if(columns > 2) results[results.length-1]['c'] = DataFactory.randDate( -1*DataFactory.randB(0,options.c_range) );
		}
		return results;
	},

	randPeople: (rows: number): Array<Object> => {
		let results = [];
		for(let i=0; i<rows; i++) {
			results.push({ 'a': DataFactory.randOf(NAMES.first), 'b': DataFactory.randOf(NAMES.last) });
		}
		return results;
	},

	randNumbersAndColors: (rows: number): Array<Object> => {
		let result = [];
		for(let i=0; i<rows; i++)
			result.push({ a: DataFactory.randB(0, 10), b: DataFactory.randOf(['red', 'blue', 'yellow', 'green']) });
		return result;
	},

	// Randomize a given array in place.
	// Slightly modified version of that given 
	// in an answer at https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	// May be identical to original list.
	randomizeList: (old_array: Array<any>): Array<any> => {
		let array = old_array.slice(0);
		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
	

};
module.exports.DataFactory = DataFactory;