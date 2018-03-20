

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

class DataFactory {

	

	random_sequence(n_max=100, n_count = 10) {
		let data = [], i;

		for(i=0; i<n_count; i++) {
			data.push( Math.round(Math.random()*n_max) );
		}

		return data;
	}

} 
module.exports.DataFactory = DataFactory;