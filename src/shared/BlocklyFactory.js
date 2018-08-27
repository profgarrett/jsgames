/**
	This library offers easy access for initializing Blockly Library.

	It doesn't deal with the actual html, but just the code segments.
*/



/*

Precision
{
  "type": "example_byte",
  "message0": "%1",
  "args0": [
    {
      "type": "field_number",
      "name": "VALUE",
      "value": 0,
      "min": -128,
      "max": 127,
      "precision": 1
    }
  ]
}

*/


function build_equal() {

	const json = { 
		'type': 'equal',
		'message0': '%1 %2',
		'args0': [
			{
				'type': 'field_label',
				'text': '=',
				'class': 'blocklyEqual'
			},
			{
				'type': 'input_value',
				'name': 'equal'
			}
		],
		'inputsInline': true,
		'colour': 20,
		'tooltip': '=',
		'helpUrl': ''
	};

	const f = (block) => {
		var value_equal = Blockly.JavaScript.valueToCode(block, 'equal', Blockly.JavaScript.ORDER_NONE);
		var code = '=' + value_equal;
		return code;
	};

	return {json, f};
}



function build_reference(ref) {
	const json = {
			'type': 'reference_'+ref,
			'message0': ref.toUpperCase(),
			'output': null,
			'colour': 65,
			'tooltip': 'Value of ' + ref,
			'helpUrl': ''
	};
	const f = () => [ref.toUpperCase(), Blockly.JavaScript.ORDER_ATOMIC];

	return {json, f};
}



function build_value(value) {

	// Test to see if we should return a wildcard entry.
	if(value === '?') return build_value_number_input();
	if(value === '*') return build_value_string_input();

	// Nope, do an exact match.
	const json = {
			'type': 'value_'+value,
			// convert message0 if number to a string for interpolation.
			'message0': typeof value === 'number' ? ''+value : '"'+value+'"', 
			'output': typeof value === 'number' ? 'Number' : 'String',
			'colour': 290,
			'tooltip': 'Value of ' + value,
			'helpUrl': ''
	};

	const f = () => [ 
			typeof value === 'number' ? value : '"'+value+'"', 
			Blockly.JavaScript.ORDER_ATOMIC
		];

	return {json, f};
}

function build_value_number_input() {
	const json = {
		'type': 'block_type',
		'message0': '%1',
		'args0': [
			{
				'type': 'field_number',
				'name': 'input',
				'value': 0
			}
		],
		'inputsInline': true,
		'output': 'Number',
		'colour': 60,
		'tooltip': '',
		'helpUrl': ''
	};

	const f = (block) => {
		var number_input = block.getFieldValue('input');
		var code = number_input;
		return [code, Blockly.JavaScript.ORDER_ATOMIC];
	};

	return {json, f};
}

function build_value_string_input() {
	const json = {
		'type': 'block_type',
		'message0': '"%1"',
		'args0': [
			{
				'type': 'field_input',
				'name': 'input',
				'text': 'abc'
			}
		],
		'inputsInline': true,
		'output': 'String',
		'colour': 60,
		'tooltip': '',
		'helpUrl': ''
	};

	const f = (block) => {
		var string_input = block.getFieldValue('input');
		var code = '"'+string_input+'"';
		return [code, Blockly.JavaScript.ORDER_ATOMIC];
	};

	return {json, f};
}



// This dictionary is used to translate a symbol into a word.
// Needed to refer to dictionary entries.
const symbol_to_word = {
	'+': 'addition',
	'-': 'subtraction',
	'/': 'division',
	'*': 'multiplication',
	'^': 'exponent',
	'=': 'equality'   // NOTE: This is different from equal, as that's the =len('a') type.
};

function build_symbol(symbol) {

	if(symbol === '?') return build_symbol_dropdown();

	const type = symbol_to_word[symbol]; 

	const json = {
			'type': 'formula_'+type,
			'message0': '%1 %2 %3',
			'args0': [
				{
					'type': 'input_value',
					'name': 'leftNumber',
					'check': 'Number'
				},
				{
					'type': 'field_label',
					'text': ' '+symbol+' ',
					'class': 'blocklyArith'
				},
				{
					'type': 'input_value',
					'name': 'rightNumber',
					'check': 'Number'
				}
			],
			'inputsInline': true,
			'output': 'Number',
			'colour': 120,
			'tooltip': '',
			'helpUrl': ''
	};

	const f = ( block ) => {
			var value_leftnumber = Blockly.JavaScript.valueToCode(block, 'leftNumber', Blockly.JavaScript.ORDER_ATOMIC);
			var value_rightnumber = Blockly.JavaScript.valueToCode(block, 'rightNumber', Blockly.JavaScript.ORDER_ATOMIC);
			// TODO: Assemble JavaScript into code variable.
			var code = value_leftnumber + ' ' + symbol + ' ' + value_rightnumber;
			// TODO: Change ORDER_NONE to the correct strength.
			return [code, Blockly.JavaScript.ORDER_ATOMIC];
		};

	return {json, f};
}

function build_symbol_dropdown() {
	const json = {
		'type': 'formula_symbol_dropdown',
		'message0': '%1 %2 %3 %4',
		'args0': [
			{
				'type': 'input_value',
				'name': 'leftNumber',
				'check': 'Number'
			},
			{
				'type': 'field_dropdown',
				'name': 'operation',
				'options': [
					[
						'+', '+'
					],
					[
						'-', '-'
					],
					[
						'*', '*'
					],
					[
						'/', '/'
					],
					[
						'^', '^'
					]
				]
			},
			{
				'type': 'input_dummy'
			},
			{
				'type': 'input_value',
				'name': 'rightNumber',
				'check': 'Number'
			}
		],
		'inputsInline': true,
		'output': 'Number',
		'colour': 120,
		'tooltip': 'Add',
		'helpUrl': ''
	};

	const f = (block) => {
		var value_leftnumber = Blockly.JavaScript.valueToCode(block, 'leftNumber', Blockly.JavaScript.ORDER_ATOMIC);
		var dropdown_operation = block.getFieldValue('operation');
		var value_rightnumber = Blockly.JavaScript.valueToCode(block, 'rightNumber', Blockly.JavaScript.ORDER_ATOMIC);
		var code = value_leftnumber+' '+dropdown_operation+' '+value_rightnumber;
		return [code, Blockly.JavaScript.ORDER_ATOMIC];
	};

	return {json, f};
}


const function_arguments = {
	'left': [ 'String', 'Number'],
	'floor': ['Number'],
	'if': ['Boolean', 'Any', 'Any']
};


// Used to add a check to the json object *if*
//  the check type is not "any"
const add_check_if_not_any = (json, check) => {
	if( check.toLowerCase() !== 'any' ) {
		json['check'] = check;
	}
	return json;
};


function build_function(f_name) {

	const args = function_arguments[f_name];
	if(typeof args === 'undefined') 
			throw new Error('Invalid type '+f_name+' in BlocklyFactory.build_function');

	if(args.length === 1) return build_function1(f_name, args[0]);
	if(args.length === 2) return build_function2(f_name, args[0], args[1]);
	if(args.length === 3) return build_function3(f_name, args[0], args[1], args[2]);

	throw new Error('Invalid argument length in BlocklyFactory.build_function');
}


function build_function1(f_name, arg_type0){

	const json = {
		'type': 'function_'+f_name,
		'lastDummyAlign0': 'CENTRE',
		'message0': f_name.toUpperCase()+'( %1 %2 )',
		'args0': [
			{
				'type': 'input_dummy',
				'align': 'CENTRE'
			},
			add_check_if_not_any({
				'type': 'input_value',
				'name': 'condition',
				'align': 'CENTRE'
			}, arg_type0)
		],
		'inputsInline': true,
		'output': '',
		'colour': 330,
		'tooltip': '',
		'helpUrl': ''
	};

	const f = (block) => {
		var value_condition = Blockly.JavaScript.valueToCode(block, 'condition', Blockly.JavaScript.ORDER_ATOMIC);
		return [f_name.toUpperCase()+'('+value_condition+')', Blockly.JavaScript.ORDER_NONE];
	};

	return {json, f};
}




function build_function2(f_name, arg_type0, arg_type1){

	const json = {
		'type': 'function_'+f_name,
		'lastDummyAlign0': 'CENTRE',
		'message0': f_name.toUpperCase()+'( %1 %2, %3 )',
		'args0': [
			{
				'type': 'input_dummy',
				'align': 'CENTRE'
			},
			add_check_if_not_any({
				'type': 'input_value',
				'name': 'first',
				'align': 'CENTRE'
			}, arg_type0),
			add_check_if_not_any({
				'type': 'input_value',
				'name': 'second',
				'align': 'CENTRE'
			}, arg_type1)
		],
		'inputsInline': true,
		'output': '',
		'colour': 330,
		'tooltip': '',
		'helpUrl': ''
	};

	const f = (block) => {
		var first = Blockly.JavaScript.valueToCode(block, 'first', Blockly.JavaScript.ORDER_ATOMIC);
		var second = Blockly.JavaScript.valueToCode(block, 'second', Blockly.JavaScript.ORDER_ATOMIC);
		return [f_name.toUpperCase()+'('+first+','+second+')', Blockly.JavaScript.ORDER_NONE];
	};

	return {json, f};
}




function build_function3(f_name, arg_type0, arg_type1, arg_type2){

	const json = {
		'type': 'function_'+f_name,
		'lastDummyAlign0': 'CENTRE',
		'message0': f_name.toUpperCase()+'( %1 %2, %3, %4 )',
		'args0': [
			{
				'type': 'input_dummy',
				'align': 'CENTRE'
			},
			add_check_if_not_any({
				'type': 'input_value',
				'name': 'first',
				'align': 'CENTRE'
			}, arg_type0),
			add_check_if_not_any({
				'type': 'input_value',
				'name': 'second',
				'align': 'CENTRE'
			}, arg_type1),
			add_check_if_not_any({
				'type': 'input_value',
				'name': 'third',
				'align': 'CENTRE'
			}, arg_type2)
		],
		'inputsInline': true,
		'output': '',
		'colour': 330,
		'tooltip': '',
		'helpUrl': ''
	};

	const f = (block) => {
		var first = Blockly.JavaScript.valueToCode(block, 'first', Blockly.JavaScript.ORDER_ATOMIC);
		var second = Blockly.JavaScript.valueToCode(block, 'second', Blockly.JavaScript.ORDER_ATOMIC);
		var third = Blockly.JavaScript.valueToCode(block, 'third', Blockly.JavaScript.ORDER_ATOMIC);
		return [f_name.toUpperCase()+'('+first+','+second+','+third+')', Blockly.JavaScript.ORDER_NONE];
	};

	return {json, f};
}




// Add a single item's definition *if needed* to blockly.
// Always return the block_title so it can be added to the toolbox.
function build_block(block_title, f) {

	let block = null;
	if(typeof Blockly.JavaScript[block_title] === 'undefined') {
		block = f();
		Blockly.JavaScript[block_title] = block.f;
		Blockly.Blocks[block_title] = {
			init: function() { this.jsonInit(block.json); }
		};
	}
	return block_title;
}




/**
	This function does 2 things:
	  * initialize blocks
	  * return a string XML for initialized the toolbox.
*/
function get_toolbox_xml( page ) {
	const toolbox = [];

	if(page.toolbox == null || page.toolbox.length === 0)
		throw new Error('Invalid BlocklyFactor page, no toolbox items');

	// Always add the = block.
	toolbox.push(build_block('equal', build_equal));

	// Create each rule as needed.
	page.toolbox.forEach( rule => {
		if(rule.has === 'values' ) {
			rule.args.forEach( value => 
				toolbox.push(build_block( 'values_'+ value,  () => build_value(value) ))
			);
		} else if(rule.has === 'references' ) {
			rule.args.forEach( value => 
				toolbox.push(build_block( 'references_'+ value,  () => build_reference(value) ))
			);
		} else if (rule.has === 'functions' ) {
			rule.args.forEach( value => 
				toolbox.push(build_block( 'functions_'+ value,  () => build_function(value) ))
			);
		} else if (rule.has === 'symbols' ) {
			rule.args.forEach( value => 
				toolbox.push(build_block( 'symbols_'+ symbol_to_word[value],  () => build_symbol(value) ))
			);
		} else {
			console.log(rule);
			throw new Error('Invalid *has* for page in BlocklyFactory: ' + rule);
		}
	});

	return '<xml>' +
			toolbox.map( item => '<block type="'+item+'"></block>').join('\n') +
			'</xml>';

}


module.exports = {
	get_toolbox_xml
};