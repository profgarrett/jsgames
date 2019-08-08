/*      */
const { DataFactory } = require('./../server/DataFactory');

//const fillTemplate = require('es6-dynamic-template');

/*

Template rules for kc and tutorials.


Use these codes inside of 
	${name}
		Define the value for this inside of template_values.
		For simple values, use this.


	Converts cell1 and cell2 into cell1_ref and cell1_title. I.E.
		template_values: {
			'cell1': 'randomCell1',
			'cell2': 'randomCell2'
		},

		${cell1_ref}
		${cell2_title}

		Cell references allow using either the ref or the title.


Template_values defines the value of each of the data values passed to the formatting function.
String should match the given.

Special values:

	[2-5]
		Integer value between the two numbers, inclusive.

	[0.1-0.99]
		If either is a decimal, then return up to 2 decimal points.

	'popCell()'
	'popCell(a1,b1,c1)'
		Returns the next item off of a persistant and randomly sorted stack of cell references
		You can use multiple times without repeating until the stack is empty.
		Does not re-use references.
		If you don't pass anything, then assumes all columns are included.
		If you pass, split by commas. No quotes or array.

	'randOf(a1|b1|c1)'
		Returns any of the items, split by |


After the objects are turned into new pages, these values turn from their template form into actual data.
This makes analysis much easier, as we don't want to split up the repsonses into 10k different unique items.

Since this happens on the server only during initial creation, there's no reason to make it deterministic.

*/

const assert = ( result ) => {
	if(!result) {
		throw new Error('Assert failed in template');
	}
};


// Test the libraries as neeeded.
if(false) {
	console.log('TESTING template.js');

	// Test Data Generation
	let values = {};
	const basepage = {
		column_titles: ['as', 'bs', 'cs']
	};


	values = compile_template_values({ ...basepage, template_values: { n: '[1-1]' }});
	assert(values.n === 1);

	values = compile_template_values({ ...basepage, template_values: { n: '[1-9]' }});
	assert(values.n >= 0 && values.n <= 10);

	values = compile_template_values({ ...basepage, template_values: { n: '[10-100]' }});
	assert(values.n >= 10 && values.n <= 100);


	// Choice
	values = compile_template_values({ ...basepage, template_values: { x: 'randOf(x,y,z)' }});
	assert(values.x == 'x' || values.x === 'y' || values.x === 'z');


	// Cell
	values = compile_template_values({ 
		...basepage, 
		column_titles: ['test1', 'test2'],
		template_values: { 
			x: 'popCell()' 
		}
	});
	assert(values.x_ref == 'a1' || values.x_ref === 'b1' );
	assert(values.x_title == 'test1' || values.x_title === 'test2' );



	// Test template filling.

	// Make sure that when we fill a number that's by itself, we return a number instead of a string.
	let s = fill_template('{n}', {n: 1});
	assert(1 === s);

	s = fill_template('Hello {n} and {n}', {n: 1, x:1, y:1});
	assert('Hello 1 and 1' === s);

	s = fill_template('{n}{x}', {n: 1, x:'bob', y:1});
	assert('1bob' === s);


	values = compile_template_values({ 
		...basepage, 
		column_titles: ['test1'],
		template_values: { 
			x: 'popCell()' 
		}
	});
	assert(values.x_ref == 'a1'  );
	assert(values.x_title == 'test1' );

	s = fill_template('Yo {x_ref}', values );
	assert('Yo a1' === s);

	s = fill_template('Yo {x_title}', values );
	assert('Yo test1' === s);


	// Test limiting the results.
	values = compile_template_values({ 
		...basepage, 
		template_values: { 
			x: 'popCell(a1,b1)' 
		}
	});
	assert(values.x_ref == 'a1' || values.x_ref === 'b1' );

	values = compile_template_values({ 
		...basepage, 
		template_values: { 
			x: 'popCell(a1,b1)' 
		}
	});
	assert(values.x_ref == 'a1' || values.x_ref === 'b1' );

	values = compile_template_values({ 
		...basepage, 
		template_values: { 
			x: 'popCell(a1,b1)' 
		}
	});
	assert(values.x_ref == 'a1' || values.x_ref === 'b1' );





}


function build_random_refs(page        )         {
	const cols = typeof page.column_titles === 'undefined' ? [] : page.column_titles;

	// If no column titles, then use tests.
	if(cols.length < 1) {
		
		// No test defined.
		if(typeof page.tests === 'undefined') return [];

		for(let key in page.tests[0]) {
			if(page.tests[0].hasOwnProperty(key)) {
				cols.push(key + '1');
			}
		}
	}

	let refs =  cols.map( (s,i) => { 
		return { 
			title: s,
			ref: 'abcdefghijklmnopqrstuvwxyz'.charAt(i) + '1'
		};
	});
	return DataFactory.randomizeList(refs);
}



/**
	Transforms template data generation strings into the actual data.

	Used when creating a new page.  This takes the page's template_values,
	parses the various options, and then turns them into discrete values.

	Returns the new object of values.
	Use:
		page.template_values = compile_template_values(page);
**/
function compile_template_values(page        )         {
	if(typeof page.template_values === 'undefined') return {};

	let values = {};
	let s = '';
	let tempA = [];
	let refs = build_random_refs( page );
	let filter_refs = [];

	for(var index in page.template_values) {
		if(page.template_values.hasOwnProperty(index)) {
			s = page.template_values[index];

			if(s.substr(0,1) === '[') {
				// Range!
				tempA = s.substr(1, s.length-2).split('-').map( s => parseInt(s, 10) );
				values[index] = DataFactory.randB( tempA[0], tempA[1]);


			} else if( s.substr(0,8) === 'popCell(' ) {
				// Cell.
				if(refs.length<1) refs = build_random_refs(page);

				// Remove any refs that don't match something in the filter.
				if(s !== 'popCell()') {
					filter_refs = s.substr(8, s.length-9).split(',');
					refs = refs.filter( ref => filter_refs.includes(ref.ref));
				}
				values[index+'_ref'] = refs[refs.length-1].ref; 
				values[index+'_title'] = refs[refs.length-1].title; 

				// Remove cell now that we've added it to the list.
				refs.pop();


			} else if( s.substr(0,7) === 'randOf(') {
				// Random of the list of items.
				tempA = s.substr(7, s.length-8).split(',');
				values[index] = DataFactory.randOf( tempA );

			}
		}
	}

	return values;
}

/**
	Fills in a string with the appropriate template values.

	Assumes that template values are enclosed in {} marks.
	We don't use ${value}, as that means that any strings enclosed
	in ` would be immediately evaluated.

	Returns new string or number.
**/
function fill_template(s                 , values        )                  {
	
	if(s === null) return '';

	// Check in case we are passed a number instead of a string.
	// If a number, then no templates are needed.
	// Happens with Harsons, which cares about data type.
	if(typeof s === 'number') return s;

	if(typeof s.replace !== 'function') {
		console.log(s);
		debugger;
	}

	//const quoted_s = s.replace( /\{/g, '${'); // add $ to strings.

	// Replace every key values in the string.
	let result = s;
	for(let key in values) {
		if(values.hasOwnProperty(key)) {
			result = result.replace( new RegExp( '{'+key+'}', 'g'), values[key] );
		}
	}
	//const result = fillTemplate(quoted_s, values);

	// Test to see if we can convert the string into a number.
	if(s.substr(0,1) === '{' && s.substr(s.length-1,1) === '}') {
		if( parseInt(result,10)+'' === result) {
			return parseInt(result, 10);
		}
	}

	return result;
}


module.exports = { 
	compile_template_values: compile_template_values,
	fill_template: fill_template
};