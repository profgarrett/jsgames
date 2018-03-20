

/**
	Creates data for use in simulation.
	
	Returns: {
		data: 
			[1, 2, 3]  
			or  
			[{ 'x': [1,2,3], 'y': [1,2,3]}]
		questions: [
			{ 	text: 'What is the biggest number?',
				answer: 3
			},
			...
		]
	}
}
*/


const NAMES = {
	first: [ 'John', 'Sarah', 'Bill', 'Amos', 'Armine', 'Zack', 'Maria', 'Ayoub', 'Thomas', 'James',
		'Jennifer', 'Ani', 'Rosamond', 'Joyce', 'Nina', 'Alex' ],
	last: ['Smith', 'Tsao', 'Atlas', 'Morales', 'Sanchez', 'Lin', 'Ballard', 'Ellis', 'Castro', 'Lee',
		'Brady', 'Marshall', 'Sorrel', 'Grooters']
};

const DataFactory = {

	randB: (from, to) => {
		return Math.floor(Math.random()*(to-from+1)+from);
	},

	randOf: (a) => {
		let i = Math.floor(Math.random() * a.length);
		return a[i];
	},

	randNumbers: (rows, cols=3, max_n=10)=>{
		const alpha = 'abcdefghijklmnopqrstuvwxyz';
		let results = [];
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

	randPeople: (rows) => {
		let results = [];
		for(let i=0; i<rows; i++) {
			results.push({ 'a': DataFactory.randOf(NAMES.first), 'b': DataFactory.randOf(NAMES.last) });
		}
		return results;
	},

	randNumbersAndColors: (rows) => {
		let result = [];
		for(let i=0; i<rows; i++)
			result.push({ a: DataFactory.randB(0, 10), b: DataFactory.randOf(['red', 'blue', 'yellow', 'green']) });
		return result;
	},
	
	/*
		Returns a number of random data points in an array with labels

		[
			{ value: 1, label: 'asdf'},
			...
		]

	*/
	random_sequence: (props) => {
		let data = [], i,
			n = props.n ? props.n : 5,
			max = props.max ? props.max : 100,
			min = props.min ? props.min : 0,
			title = props.titles ? i => props.titles[i] : i => i;


		for(i=0; i<n; i++) {
			data.push( {
				value: Math.floor(Math.random()*(max-min)) + min,
				title: title(i)
			});

		}

		return data;
	}

};
module.exports.DataFactory = DataFactory;