// @flow

function turn_array_into_map( a: Array<any>, get_p: any, sort_order_alpha: boolean = true ): Map {

	var m = new Map();
	var index = '';

	// Create a new array that is properly sorted by get_p
	// Map uses insertion order, so this sets insertion order 
	// the get_p function's result (i.e., string, date, etc..)

	var sorted_a = sort_order_alpha
		? a.sort( (a,b) => get_p(a) < get_p(b) ? -1 : 1 )
		: a.sort( (a,b) => get_p(a) > get_p(b) ? -1 : 1 );

	sorted_a.map( item => {
		// Add new map [] if the key doesn't exist.
		index = get_p(item);

		if( !m.has(index) ) m.set(index, []);
		m.get(index).push(item);
	});

	return m;
}




module.exports = {
	turn_array_into_map
};