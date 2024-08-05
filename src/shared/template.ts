import { DataFactory } from './../shared/DataFactory';
// Note: Do not import IfLevel/IfPages here. It's nice to have the type annotations,
//		but importing will lead to a import loop that breaks everything.

const DEBUG = false;

/*

Template rules for kc and tutorials.


Use these codes inside of 
	{name}
		Define the value for this inside of template_values.
		For simple values, use this.


	Converts cell1 and cell2 into cell1_ref and cell1_title. I.E.
		template_values: {
			'cell1': 'a1',
			'value': '23a'
		},

		{cell1_ref}
		{cell2_title}

		Cell references allow using either the ref or the title.


Template_values defines the value of each of the data values passed to the formatting function.
String should match the given.

Special values:

	[2-5]
		Integer value between the two numbers, inclusive.
		To get decimals, do math in formula (i.e., {n}/100)

	'popString(title,sales price,goal)
		Returns the next item off of a persistant and randomly sorted list of columns
		Doesn't look at any source tables, but instead 

	'popCell()' OR 'popCell(a1,b1,c1)'
		Returns the next item off of a persistant and randomly sorted stack of cell references
		Cell references are persistant for each page during initial setup only.
		You can call a=popCell() and b=popCell(), or a=popCell(a1,b1) and b=popCell(a1,b1)
		But, you can't combine both ways of calling the function.
		
		You can use multiple times without repeating until the stack is empty. Throws an error
		upon empty stack.

		If you don't pass anything, then assumes all columns are included.
		If you pass, split by commas. No quotes, spaces, or array.

		Do not combine both popCell() and popCell(a1,a2)!

	'randOf(a1,b1,c1)'
		Returns any of the items, split by a comma

	'level._id'
		Returns the ID of the currently-used level.

After the objects are turned into new pages, these values turn from their template form into actual data.
This makes analysis much easier, as we don't want to split up the repsonses into 10k different unique items.

Since this happens on the server only during initial creation, there's no reason to make it deterministic.
*/

const assert = ( result: any ) => {
	if(!result) {
		throw new Error('Assert failed in template');
	}
};


// Test the libraries as neeeded.
if(DEBUG) {
	console.log('TESTING template');

	// Test Data Generation
	let values: IStringIndexJsonObject = {};
	const basepage = {
		column_titles: ['as', 'bs', 'cs']
	};
	const baselevel = { type: 'IfLevelSchema', _id: '999' };
	//baselevel._id = '999';
	

	values = get_compiled_template_values({ ...basepage, template_values: { n: '[1-1]' }});
	assert(values.n === 1);

	values = get_compiled_template_values({ ...basepage, template_values: { n: '[1-9]' }});
	assert(typeof values.n === 'number' && values.n >= 0 && values.n <= 10);

	values = get_compiled_template_values({ ...basepage, template_values: { n: '[10-100]' }});
	assert(typeof values.n === 'number' && values.n >= 10 && values.n <= 100);


	// Choice
	values = get_compiled_template_values({ ...basepage, template_values: { x: 'randOf(x,y,z)' }});
	assert(values.x === 'x' || values.x === 'y' || values.x === 'z');


	// Cell
	values = get_compiled_template_values({ 
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


	values = get_compiled_template_values({ 
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
	values = get_compiled_template_values({ 
		...basepage, 
		template_values: { 
			x: 'popCell(a1,b1)' 
		}
	});
	assert(values.x_ref == 'a1' || values.x_ref === 'b1' );

	values = get_compiled_template_values({ 
		...basepage, 
		template_values: { 
			x: 'popCell(a1,b1)' 
		}
	});
	assert(values.x_ref == 'a1' || values.x_ref === 'b1' );

	values = get_compiled_template_values({ 
		...basepage, 
		template_values: { 
			x: 'popCell(a1,b1)' 
		}
	});
	assert(values.x_ref == 'a1' || values.x_ref === 'b1' );


	values = get_compiled_template_values({ 
		...basepage, 
		template_values: { 
			x: 'popCell(a1)' 
		}
	});
	assert(values.x_ref == 'a1' );

	values = get_compiled_template_values({ 
		...basepage, 
		template_values: { 
			x: 'popCell(a1,b1)' 
		}
	});
	assert(values.x_ref == 'a1' || values.x_ref === 'b1' );



	values = get_compiled_template_values({ 
			column_titles: ['aTitle', 'bTitle', 'cTitle'],
			template_values: { 
				x1: 'popCell(c1,b1)',
				x2: 'popCell(c1,b1)' 
			}
		},baselevel);

	assert(values.x1_ref != 'a1')
	assert(values.x2_ref != 'a1')


	// Test popColumn for sql pages
	values = get_compiled_template_values({ 
		t1_titles: ['aTitle', 'bTitle', 'cTitle'],
		template_values: { 
			x1: 'popColumn(aTitle,bTitle)',
			x2: 'popColumn(aTitle,bTitle)' 
		}
	},baselevel);
	assert(values.x1 != 'cTitle')
	assert(values.x2 != 'cTitle')
	assert(values.x1 !== values.x2)


	values = get_compiled_template_values({ 
		t1_titles: ['aTitle'],
		t2_titles: ['bTitle'],
		t3_titles: ['cTitle'],
		template_values: { 
			x1: 'popColumn(aTitle,bTitle)',
			x2: 'popColumn(aTitle,bTitle)' 
		}
	},baselevel);
	assert(values.x1 != 'cTitle')
	assert(values.x2 != 'cTitle')
	assert(values.x1 !== values.x2)

	values = get_compiled_template_values({ 
		t1_titles: ['aTitle', 'bTitle', 'cTitle'],
		template_values: { 
			x1: 'popColumn()',
			x2: 'popColumn()',
			x3: 'popColumn()',
		}
	},baselevel);

	assert(values.x1 === 'aTitle' || values.x1 === 'bTitle' || values.x1 === 'cTitle' )
	assert(values.x2 === 'aTitle' || values.x2 === 'bTitle' || values.x2 === 'cTitle' )
	assert(values.x3 === 'aTitle' || values.x3 === 'bTitle' || values.x3 === 'cTitle' )
	assert(values.x1 !== values.x2 && values.x2 !== values.x3)

}


interface ILevel {
	_id: string
	type: string
}

interface IStringIndexJsonObject {
	[key: string]: string | number
}
/**
 * Interface for pages.
 * Don't use page schemas directly, as this needs to be more portable.
 */
interface IPage {
	template_values?: IStringIndexJsonObject 
	column_titles?: string[]
	tests?: IStringIndexJsonObject[]
	t1_titles?: string[]
	t2_titles?: string[]
	t3_titles?: string[]
}
interface IExcelRow1Reference {
	title: string,
	ref: string,
}


/**
 * Return a list of columns for the page
 */
function get_all_table_titles(page: IPage): string[] {
	let titles: string[];

	// t1
	if(typeof page.t1_titles !== 'undefined') {
		titles = [...page.t1_titles];
	} else {
		titles = [];
	}

	// t2/3
	if(typeof page.t2_titles !== 'undefined') {
		titles.push(...page.t2_titles);
	}
	if(typeof page.t3_titles !== 'undefined') {
		titles.push(...page.t3_titles);
	}

	// Remove duplicates
	titles = titles.filter((value, index, array) => array.indexOf(value) === index);

	return titles;
}

/**
 * Return a list of references (Excel) that exist in the page tests.
 * Note that all refs are guaranteed to be lowercase.
 * 
 * @param page R
 * @returns 
 */
function get_all_excel_row1_references(page: IPage): IExcelRow1Reference[] {
	const cols = typeof page.column_titles === 'undefined' ? [] : page.column_titles;

	// If no column titles, then use tests.
	if(cols.length < 1) {
		
		// No test defined.
		if(typeof page.tests === 'undefined') return [];

		for(let key in page.tests[0]) {
			if( Object.prototype.hasOwnProperty.call(page.tests[0], key) ) {
				cols.push(key.toLowerCase() + '1');
			}
		}
	}

	const refs =  cols.map( (s: string, i: number): IExcelRow1Reference => { 
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
		page.template_values = get_compiled_template_values(page);
**/
function get_compiled_template_values(page: IPage, level?: ILevel): IStringIndexJsonObject {
	if(typeof page.template_values === 'undefined') return {};

	// Make sure that we have all lowercase references.
	let page_excel_references: IExcelRow1Reference[] = get_all_excel_row1_references( page );
	let page_column_titles: string[] = get_all_table_titles(page);

	// Temporary variables for use below.
	let s: string;
	let tempA: any[] = [];
	let filter_refs: any[] = [];

	// Return result
	let return_values: IStringIndexJsonObject = {};

	// Go through each index value.
	// See if they should have logic applied. If so, update.
	for(let key in page.template_values) {
		if(	Object.prototype.hasOwnProperty.call( page.template_values, key) ) {
			
			// No alterations are needed on number.
			if(typeof page.template_values[key] === 'number') {
				return_values[key] = page.template_values[key];
				continue;
			}

			// String. Uses extra assignment to avoid typescript error number->string
			s = "" +  page.template_values[key]; 

			// Pattern [12-23] )
			// Requires integers only! No double.
			if(s.startsWith('[')) {
				// Only integers
				if(s.indexOf('.') !== -1) throw new Error('Invalid period found in input to template.js, '+s);

				// Range! Pull 12 and 23, split, turn into integers.
				tempA = s.slice(1, s.length-1).split('-').map( s => parseInt(s, 10) );

				// randomize number between two integers.
				return_values[key] = DataFactory.randB( tempA[0], tempA[1]);
				continue;
			} 
			
			// References, for Excel pages.
			// Return one of a list of cells available in the underlying data.
			// Persistant, so don't return a cell previously returned.
			if( s.startsWith('popCell(') ) {

				// Make sure that we aren't out of filter references.
				if(page_excel_references.length === 0) throw new Error('template.js popCell run out of refs');

				// Remove any refs that don't match something in the filter.
				// Safe to run multiple times, as it only removes items that don't match.
				if(s !== 'popCell()') {
					filter_refs = s.slice(8, s.length-1).toLowerCase().split(',');
					page_excel_references = page_excel_references.filter( (ref: any) => filter_refs.includes(ref.ref));
				}
				
				if(typeof page_excel_references[page_excel_references.length-1] === 'undefined')  {
					throw new Error('Invalid reference in template.get_compiled_template_values');
				}
				
				// Add both the ref and title to the return values.
				return_values[key+'_ref'] = page_excel_references[page_excel_references.length-1].ref; 
				return_values[key+'_title'] = page_excel_references[page_excel_references.length-1].title; 

				// Remove cell now that we've added it to the list.
				page_excel_references.pop();
				continue;
			}  


			// Columns, used for SQL pages
			if(s.startsWith('popColumn(')) {

				// Make sure we aren't out of columns.
				if(page_column_titles.length < 1) throw new Error('template.js popColumn run out of refs');


				// Remove any refs that don't match something in the filter.
				// Safe to run multiple times, as it only removes items that don't match.
				if(s !== 'popColumn()') {
					if(s.indexOf('"') !== -1) throw new Error('template.get_compiled_template_values can not handle "quoted" strings');
					if(s.indexOf("'") !== -1) throw new Error('template.get_compiled_template_values can not handle \'quoted\' strings');
					
					filter_refs = s.slice(10, s.length-1).toLowerCase().split(',');
					page_column_titles = page_column_titles.filter( (title: string) => filter_refs.includes(title.toLowerCase()));
				}
				
				if(page_column_titles.length < 1 )  {
					console.log(page);
					console.log(filter_refs);
					console.log(page_column_titles);
					throw new Error('Invalid reference in template.page_column_titles');
				}
				
				// Add the title to the return values.
				// Have the || to avoid typeScript error of returning undef if array is too short.
				return_values[key] = page_column_titles.pop() || '';
				continue;
			}
	
			
			if( s.startsWith('randOf(')) {
				// Make sure that there is no period.
				if(s.indexOf('.') !== -1) throw new Error('Invalid period found in input to template.js, '+s);

				// Random item from the list.
				tempA = s.slice(7, s.length-1).split(',');
				tempA = [DataFactory.randOf( tempA )];
				
				// Look to see if we can safely turn it into a number.
				if(s === ''+parseInt(tempA[0])) {
					return_values[key] = parseInt(tempA[0]);
				} else {
					return_values[key] = tempA[0];
				}
				continue;
			} 
			
			if ( s === 'level._id') {
				if(typeof level === 'undefined' || level === null) {
					throw new Error('Undefined level for compile_template');
				} else {
					if(typeof level._id === 'undefined' ) {
						throw new Error('You must pass Level to get_compiled_template_values');
					}
					return_values[key] = level._id;
				}
			}
		}
	}

	return return_values;
}

/**
	Fills in a string with the appropriate template values.

	Assumes that template values are enclosed in {} marks.
	We don't use ${value}, as that means that any strings enclosed
	in ` would be immediately evaluated.

	Returns new string or number.
**/
function fill_template(s: string | number, values: IStringIndexJsonObject): string | number {
	if(s === null) return '';

	// Check in case we are passed a number instead of a string.
	// If a number, then no templates are needed.
	// Happens with Harsons, which cares about data type.
	if(typeof s === 'number') return s;

	if(typeof s.replace !== 'function') {
		throw new Error('Invalid function passed to template\fill_template');
	}

	// Replace every key values in the string.
	let result = s;
	for(let key in values) {
		if(	Object.prototype.hasOwnProperty.call( values, key) ) {
			result = result.replace( new RegExp( '{'+key+'}', 'g'), ''+values[key] );
		}
	}

	// Test to see if we can convert the string into a number.
	if(s.startsWith('{') && s.endsWith("}") ) {
		if( parseInt(result,10)+'' === result) {
			return parseInt(result, 10);
		}
	}

	return result;
}


export { 
	get_compiled_template_values,
	fill_template
};