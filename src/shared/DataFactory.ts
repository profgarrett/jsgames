var seedrandom = require('seedrandom');

const NAMES = {
	first: [ 'John', 'Sarah', 'Bill', 'Amos', 'Armine', 'Zack', 'Maria', 'Ayoub', 'Thomas', 'James',
		'Jennifer', 'Ani', 'Rosamond', 'Joyce', 'Nina', 'Alex' ],
	last: ['Smith', 'Tsao', 'Atlas', 'Morales', 'Sanchez', 'Lin', 'Ballard', 'Ellis', 'Castro', 'Lee',
		'Brady', 'Marshall', 'Sorrel', 'Grooters']
};

const STATES = [ 'Idaho', 'California', 'Texas', 'New York', 'Oregon', 'Nevada', 'New Jersey', 'Arkansas',
	'Florida', 'West Virginia', 'Maine'];

const STREET_NAMES = ['Main', 'West', 'North', 'South', 'East', 'Upper', 'Lower', 
	'Elk', 'Deer', 'Squirrel', 'Rabbit'
	];

const CITY_NAMES = ['Elmsdale', 'Oakland', 'Birchland', 'Flowerville', 'Bog City', 'Swamptown'];


const DataFactory = {

	// Return a date before or after today by a certain range.
	// @seed is optional.
	randDate(plus_or_minus_days: number = 0, seed?: number): Date {
		let d = new Date();
		let offset = DataFactory.randB(-plus_or_minus_days, plus_or_minus_days, seed);
		d.setDate(d.getDate() + offset);
		return d;
	},

	// Return a random percentage (2 decimals) between the two given numbers.
	// If the number is > 1, then assume that we should convert. If <1, then 
	// assume it's already in decimal form.
	// @seed is optional.
	randPercent: (from: number, to: number, seed?: number): number => {

		if(from>=1 && to>=1) {
			// > 1
			return Math.floor(
				(typeof seed === 'undefined' ? Math.random() : seed )
				* (to-from+1)+from
			)/100;
		} else {
			// < 1
			return Math.floor(
				(typeof seed === 'undefined' ? Math.random() : seed )
				* ((to*100)-(from*100)+1)+(from*100)
			)/100;
		}

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
	randOf: (a: Array<string | number>, seed?: number ): any => {
		let i = Math.floor( 
					(typeof seed === 'undefined' ?  Math.random() : seed )
					* a.length);
		return a[i];
	},

	randNumbers: (rows: number, cols: number = 3, max_n: number = 10, seed?: number): Array<number> =>{
		const alpha = 'abcdefghijklmnopqrstuvwxyz';
		let results = Array();
		let result = {};

		for(let i=0; i<rows; i++) {
			result = {};
			for(let j=0; j<cols; j++)  {
				// @ts-ignore
				result[ alpha.substr(j,1) ] = DataFactory.randB(0, max_n, seed);
			}
			results.push(result);
		}
		return results;
	},

	randDates: (rows: number, columns: number = 1, 
				options: any={ a_range: 600, b_range: 600, c_range: 600}): Array<Object> => {
		let results : any[] = [];
		// ugly/lazy hacks
		for(let i=0; i<rows; i++) {
			// @ts-ignore
			results.push({ a: DataFactory.randDate( -1*DataFactory.randB(0,options.a_range) ) });	
			// @ts-ignore
			if(columns > 1) results[results.length-1]['b'] = DataFactory.randDate( -1*DataFactory.randB(0,options.b_range) );
			// @ts-ignore
			if(columns > 2) results[results.length-1]['c'] = DataFactory.randDate( -1*DataFactory.randB(0,options.c_range) );
		}
		return results;
	},

	randName: (seed?: number): string => {
		return DataFactory.randOf(NAMES.first, seed);
	},

	randPeople: (rows: number): Array<Object> => {
		let results: any[] = [];
		for(let i=0; i<rows; i++) {
			results.push({ 'a': DataFactory.randOf(NAMES.first), 'b': DataFactory.randOf(NAMES.last) });
		}
		return results;
	},

	randNumbersAndColors: (rows: number): Array<Object> => {
		let results: any[] = [];
		for(let i=0; i<rows; i++)
			results.push({ a: DataFactory.randB(0, 10), b: DataFactory.randOf(['red', 'blue', 'yellow', 'green']) });
		return results;
	},

	randAddress: (rows: number): Array<Object> => {
		let results: any[] = [];
		for(let i=0; i<rows; i++)
			results.push({ 
				a: DataFactory.randB(100, 1000).toString() + ' ' + DataFactory.randOf(STREET_NAMES),
				b: DataFactory.randOf(CITY_NAMES),
				c: DataFactory.randOf(STATES),
			});
		return results;

	},



	// Randomize a given array in place.
	// Slightly modified version of that given 
	// in an answer at https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	// May be identical to original list.
	randomizeListInPlace: (array: Array<any>, seed?: number) => {
		const r = typeof seed !== 'undefined' ? seedrandom(seed) : Math.random;

		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(r() * (i + 1));
			// $FlowFixMe
			[array[i], array[j]] = [array[j], array[i]];
		}
	},



	// Randomize a given array. 
	// Slightly modified version of that given 
	// in an answer at https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	// May be identical to original list.
	randomizeList: (old_array: Array<any>, seed?: number): Array<any> => {
		let array = old_array.slice(0);
		const r = typeof seed !== 'undefined' ? seedrandom(seed) : Math.random;

		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(r() * (i + 1));
			// $FlowFixMe
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
	

};

export { DataFactory }