//      

function turn_array_into_map( a            , get_p     , sort_order_alpha          = true )                   {

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
		// $FlowFixMe
		m.get(index).push(item);
	});

	return m;
}



// toLocaleTimeString is super slow when used with a larger number of objects.
// Create a custom little formatter to speed things up.  Changed from 6s to 
// almost nothing.
const formatDate = (dt      )         => {

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


const padL = ( s_or_n     , length         )         => {
	// If n, convert to string and return.
	if(typeof s_or_n === 'number') {
		return padL(s_or_n.toString(), length);
	}
	return s_or_n.padStart(length, '_');
};



module.exports = {
	turn_array_into_map,
	formatDate,
	padL,
};