// @flow

function turn_array_into_map( a: Array<any>, get_p: any, sort_order_alpha: boolean = true ): Map<string, any> {
	
	var m = new Map();
	var index = '';

	// Create a new array that is properly sorted by get_p
	// Map uses insertion order, so this sets insertion order 
	// the get_p function's result (i.e., string, date, etc..)
	var sorted_a = sort_order_alpha
		? a.slice().sort( (a,b) => get_p(a) < get_p(b) ? -1 : 1 )
		: a.slice().sort( (a,b) => get_p(a) > get_p(b) ? -1 : 1 );

	sorted_a.forEach( item => {
		// Add new map [] if the key doesn't exist.
		index = get_p(item);

		if( !m.has(index) ) m.set(index, []);
		// $FlowFixMe
		m.get(index).push(item);
	});

	return m;
}




function turn_object_keys_into_array( o: any): Array<any> {
    const results_a = [];

	// Test for map.
	if( o instanceof Map) {
		o.forEach( (values, key) => results_a.push(key))

	} else {
		// Assume regular object.
		for( let key in o ) {
			if(o.hasOwnProperty(key)) {
				results_a.push(key);
			}
		}
		

	}
    return results_a;
}


function turn_object_values_into_array( o: any): Array<any> {
    const results_a = [];
    for( let key in o ) {
        if(o.hasOwnProperty(key)) {
            results_a.push(o[key]);
        }
    }

    return results_a;
}

// Turn a string into a y/n value.
const random_boolean_from_string = (s: string): boolean => {
	const s_as_number = s.split('').reduce( (i, s) => s.charCodeAt(0) + i, 1 );
	return (s_as_number % 2) === 1;
};



// toLocaleTimeString is super slow when used with a larger number of objects.
// Create a custom little formatter to speed things up.  Changed from 6s to 
// almost nothing.
const formatDate = (dt: Date): string => {

	if(typeof dt === 'undefined') return 'undefined';
	if(typeof dt.getFullYear === 'undefined') return 'undefined';

	return dt.getFullYear().toString() + '/' +
		(1+parseInt(dt.getMonth(),10)) + '/' +
		dt.getDate() + ' ' +
		dt.getHours() + ':' + 
		(dt.getMinutes() + ':').padStart(3, '0') +
		(dt.getSeconds() + '').padStart(2, '0');

	//return '123'; //.toLocaleTimeString('en-US')
};


const padL = ( s_or_n: any, length: number ): string => {
	// If n, convert to string and return.
	if(typeof s_or_n === 'number') {
		return padL(s_or_n.toString(), length);
	}
	return s_or_n.padStart(length, '_');
};

// Are the arrays similar or different?
const arrayDifferent = (a1: Array<any>, a2: Array<any>): boolean => {
	if(a1.length !== a2.length) return true;

	for(let i=0; i<a1.length; i++) {
		if(a1[i] !== a2[i]) return true;
	}

	return false;
};



const clean_text_of_tabs_and_newlines = ( dirty: string ): string => {

	// Remove tabs & newlines.
	let clean = dirty.replace(/\t/g, ' ').replace( /\n/g, ' ');
	let d = '';

	do {
		d = clean;
		clean = clean.replace( / {2}/g, ' ');
	} while( d !== clean);

	return clean;
};

module.exports = {
	turn_array_into_map,
	formatDate,
	padL,
	random_boolean_from_string,
	arrayDifferent,
	clean_text_of_tabs_and_newlines,
	turn_object_keys_into_array,
	turn_object_values_into_array,
};