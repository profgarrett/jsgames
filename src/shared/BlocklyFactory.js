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
//		'inputsInline': true,
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
			'message0': '%1 %2', 
			'args0': [
				{
					'type': 'field_label',
					'text': ref.toUpperCase(),
				},
				{
					'type': 'input_value',
					'name': 'right',
				}
			],

						'output': null,
			'colour': 65,
			'tooltip': 'Value of ' + ref,
			'helpUrl': ''
	};

	const f = block => {
		var value_right = Blockly.JavaScript.valueToCode(block, 'right', Blockly.JavaScript.ORDER_NONE);
		var code = ref.toUpperCase() + ' ' + value_right;
		return [code, Blockly.JavaScript.ORDER_ATOMIC ];
	};

	return {json, f};
}



function build_value(value, accept_right_input=true) {

	// Test to see if we should return a wildcard entry.
	if(value === 'number?') return build_value_number_input(accept_right_input);
	if(value === 'string?') return build_value_string_input(accept_right_input);

	const isNumber = typeof value === 'number';

	// Nope, do an exact match.
	const json = accept_right_input
		? {
			'type': 'value_'+value,
			// convert message0 if number to a string for interpolation.
			'message0':  '%1 %2', 
			'args0': [
				{
					'type': 'field_label',
					'text': (isNumber ? ''+value : '"'+value+'"')
				},
				{
					'type': 'input_value',
					'name': 'right',
					'check': (isNumber ? 'number_operator' : 'string_operator' )
				}
			],
			'output': typeof value === 'number' ? 'Number' : 'String',
			'colour': 290,
			'tooltip': 'Value of ' + value,
			'helpUrl': ''
		}
		: {
			'type': 'value_'+value,
			// convert message0 if number to a string for interpolation.
			'message0': typeof value === 'number' ? ''+value : '"'+value+'"', 
			'output': typeof value === 'number' ? 'Number' : 'String',
			'colour': 290,
			'tooltip': 'Value of ' + value,
			'helpUrl': ''
		};

	const f = block => {
		var value_right = accept_right_input 
			? ''
			: ' ' + Blockly.JavaScript.valueToCode(block, 'right', Blockly.JavaScript.ORDER_NONE);
		var code = (typeof value === 'number' ? value : '"'+value+'"') + value_right;
		return [code, Blockly.JavaScript.ORDER_ATOMIC ];
	};

	return {json, f};
}

function build_value_number_input(accept_right_input) {
	const json = accept_right_input
		?
		{
			'type': 'block_type',
			'message0': '%1 %2',
			'args0': [
				{
					'type': 'field_number',
					'name': 'input',
					'value': 0
				},
				{
					'type': 'input_value',
					'name': 'right',
					'check': 'number_operator'
				}
			],
			'output': 'Number',
			'colour': 60,
			'tooltip': '',
			'helpUrl': ''
		}
		:
		{
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
		var value_right = accept_right_input 
			? ''
			: ' ' + Blockly.JavaScript.valueToCode(block, 'right', Blockly.JavaScript.ORDER_NONE);
		var number_input = block.getFieldValue('input');
		var code = number_input + value_right;
		return [code, Blockly.JavaScript.ORDER_ATOMIC];
	};

	return {json, f};
}

function build_value_string_input(accept_right_input) {
	const json = accept_right_input
		?
		{
			'type': 'block_type',
			'message0': '"%1" %2',
			'args0': [
				{
					'type': 'field_input',
					'name': 'input',
					'text': 'abc'
				},
				{
					'type': 'input_value',
					'name': 'right',
					'check': 'string_operator'
				}
			],
			'output': 'String',
			'colour': 60,
			'tooltip': '',
			'helpUrl': ''
		}
		:
		{
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
		var value_right = accept_right_input 
			? ''
			: ' ' + Blockly.JavaScript.valueToCode(block, 'right', Blockly.JavaScript.ORDER_NONE);
		var string_input = block.getFieldValue('input');
		var code = '"'+string_input+'"' + value_right;
		return [code, Blockly.JavaScript.ORDER_ATOMIC];
	};

	return {json, f};
}



// This dictionary is used to translate a symbol into a word.
// Needed to refer to dictionary entries.
const symbol_to_word = {
	'<': 'lt',
	'>': 'gt',
	'<=': 'le',
	'>=': 'ge',
	'=': 'equality',   // NOTE: This is different from equal, as that's the =len('a') type.	'+': 'addition',
	'comparison?': 'comparisonwildcard',

	'-': 'subtraction',
	'/': 'division',
	'*': 'multiplication',
	'^': 'exponent',
	'&': 'concatenate',
	'arithmetic?': 'arithmeticwildcard'
};

function build_symbol(symbol) {

	if(symbol === 'comparison?') return build_symbol_comparison_dropdown();
	if(symbol === 'arithmetic?') return build_symbol_arithmetic_dropdown();

	const type = symbol_to_word[symbol]; 

	// Is this a comparison or an addition/division/...?
	const comparison = symbol.substr(0,1) === '<' 
			|| symbol.substr(0,1) === '>' 
			|| symbol.substr(0,1) === '=';


	const json = comparison 
			? 
				{ // < > <= >= =
				'type': 'symbol_'+type,
				'message0': '%1 %2 %3',
				'args0': [
					{
						'type': 'input_value',
						'name': 'leftValue',
					},
					{
						'type': 'field_label',
						'text': ' '+symbol+' ',
						'class': 'blocklyArith'
					},
					{
						'type': 'input_value',
						'name': 'rightValue',
					}
				],
				'inputsInline': true,
				'output': 'Boolean',
				'colour': 180,
				'tooltip': '',
				'helpUrl': ''
				}
			:
			{ // + - / * &
				'type': 'symbol_'+type,
				'message0': '%1 %2',
				'args0': [
					{
						'type': 'field_label',
						'text': ' '+symbol+' ',
						'class': 'blocklyArith'
					},
					{
						'type': 'input_value',
						'name': 'rightValue',
						'check': symbol === '&' ? 'String' : 'Number'
					}
				],
				//'inputsInline': true,
				'output': symbol === '&' ? 'string_operator' : 'number_operator',
				'colour': 120,
				'tooltip': '',
				'helpUrl': ''
			};

	const f = ( block ) => {
			const value_leftvalue = comparison 
					? Blockly.JavaScript.valueToCode(block, 'leftValue', Blockly.JavaScript.ORDER_ATOMIC) + ' '
					: '';
			const value_rightvalue = Blockly.JavaScript.valueToCode(block, 'rightValue', Blockly.JavaScript.ORDER_ATOMIC);
			
			// Return formula.
			const code = value_leftvalue + symbol + ' ' + value_rightvalue;

			return [code, Blockly.JavaScript.ORDER_ATOMIC];
		};

	return {json, f};
}


function build_symbol_comparison_dropdown() {
	const json = {
		'type': 'formula_symbol_comparison_dropdown',
		'message0': '%1 %2 %3 %4',
		'args0': [
			{
				'type': 'input_value',
				'name': 'leftValue'
			},
			{
				'type': 'field_dropdown',
				'name': 'operation',
				'options': [
					[
						'=', '='
					],
					[
						'<', '<'
					],
					[
						'<=', '<='
					],
					[
						'>', '>'
					],
					[
						'>=', '>='
					]
				]
			},
			{
				'type': 'input_dummy'
			},
			{
				'type': 'input_value',
				'name': 'rightValue'
			}
		],
		'inputsInline': true,
		'output': 'Boolean',
		'colour': 120,
		'tooltip': 'Compare to values',
		'helpUrl': ''
	};

	const f = (block) => {
		var value_leftvalue = Blockly.JavaScript.valueToCode(block, 'leftValue', Blockly.JavaScript.ORDER_ATOMIC);
		var dropdown_operation = block.getFieldValue('operation');
		var value_rightvalue = Blockly.JavaScript.valueToCode(block, 'rightValue', Blockly.JavaScript.ORDER_ATOMIC);
		var code = value_leftvalue+' '+dropdown_operation+' '+value_rightvalue;
		return [code, Blockly.JavaScript.ORDER_ATOMIC];
	};

	return {json, f};
}



function build_symbol_arithmetic_dropdown() {
	const json = {
		'type': 'formula_symbol_arithmetic_dropdown',
		'message0': '%1 %2',
		'args0': [
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
				'type': 'input_value',
				'name': 'rightNumber',
				'check': 'Number'
			}
		],
		'output': 'Number',
		'colour': 120,
		'tooltip': 'Arithmetic dropd-down',
		'helpUrl': ''
	};

	const f = (block) => {
		var dropdown_operation = block.getFieldValue('operation');
		var value_rightnumber = Blockly.JavaScript.valueToCode(block, 'rightNumber', Blockly.JavaScript.ORDER_ATOMIC);
		var code = dropdown_operation+' '+value_rightnumber;
		return [code, Blockly.JavaScript.ORDER_ATOMIC];
	};

	return {json, f};
}


const function_arguments = {
	'left': [ 'String', 'Number'],
	'right': [ 'String', 'Number'],
	'floor': ['Number'],
	'round': ['Number', 'Number'],
	'if': ['Boolean', 'Any', 'Any'],
	'not': [ 'Boolean'],
	'and': ['Boolean', 'Boolean'],
	'and3': ['Boolean', 'Boolean', 'Boolean'],
	'or': ['Boolean', 'Boolean'],
	'or3': ['Boolean', 'Boolean', 'Boolean'],
	'andor2': ['Boolean', 'Boolean'],
	'andor3': ['Boolean', 'Boolean', 'Boolean']
};




function build_function(f_name) {

	const args = function_arguments[f_name.toLowerCase()];
	if(typeof args === 'undefined') 
			throw new Error('Invalid type '+f_name+' in BlocklyFactory.build_function');

	if(args.length === 1) return build_function1(f_name, args[0]);
	if(args.length === 2) return build_function2(f_name, args[0], args[1]);
	if(args.length === 3) return build_function3(f_name, args[0], args[1], args[2]);

	throw new Error('Invalid argument length in BlocklyFactory.build_function');
}

// Used to add a check to the json object *if*
//  the check type is not "any"
const add_check_if_not_any = (json, check) => {
	if( check.toLowerCase() !== 'any' ) {
		json['check'] = check;
	}
	return json;
};



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

	if(f_name === 'andor2') return build_function_andor2();

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
				'align': 'CENTRE',

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


function build_function_andor2(){

	const json = {
		'type': 'function_andor2',
		'lastDummyAlign0': 'CENTRE',
		'message0': '%1( %2, %3 )',
		'args0': [
			{
				'type': 'field_dropdown',
				'name': 'operation',
				'options': [
					[ 'AND', 'AND' ],
					[ 'OR', 'OR' ]
				]
			},
			{
				'type': 'input_value',
				'name': 'first',
				'align': 'CENTRE',
				'check': 'Boolean'
			},
			{
				'type': 'input_value',
				'name': 'second',
				'check': 'Boolean'
			}
		],
		'inputsInline': true,
		'output': 'Boolean',
		'colour': 330
	};


	const f = (block) => {
		var dropdown = block.getFieldValue('operation');
		var first = Blockly.JavaScript.valueToCode(block, 'first', Blockly.JavaScript.ORDER_ATOMIC);
		var second = Blockly.JavaScript.valueToCode(block, 'second', Blockly.JavaScript.ORDER_ATOMIC);
		return [dropdown+'('+first+','+second+')', Blockly.JavaScript.ORDER_NONE];
	};

	return {json, f};
}



function build_function3(f_name, arg_type0, arg_type1, arg_type2){

	if(f_name === 'andor3') return build_function_andor3();

	// Remove 3 from the end of the function name.
	const label = (f_name.toLowerCase() === 'and3' || f_name.toLowerCase() === 'or3') 
		? f_name.substr(0, f_name.length-1)
		: f_name;

	const json = {
		'type': 'function_'+f_name,
		'lastDummyAlign0': 'CENTRE',
		'message0': label.toUpperCase()+'( %1 %2, %3, %4 )',
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
		return [label.toUpperCase()+'('+first+','+second+','+third+')', Blockly.JavaScript.ORDER_NONE];
	};

	return {json, f};
}



function build_function_andor3(){

	const json = {
		'type': 'function_andor2',
		'lastDummyAlign0': 'CENTRE',
		'message0': '%1( %2, %3, %4 )',
		'args0': [
			{
				'type': 'field_dropdown',
				'name': 'operation',
				'options': [
					[ 'AND', 'AND' ],
					[ 'OR', 'OR' ]
				]
			},
			{
				'type': 'input_value',
				'name': 'first',
				'align': 'CENTRE',
				'check': 'Boolean'
			},
			{
				'type': 'input_value',
				'name': 'second',
				'check': 'Boolean'
			},
			{
				'type': 'input_value',
				'name': 'third',
				'check': 'Boolean'
			}
		],
		'inputsInline': true,
		'output': 'Boolean',
		'colour': 330
	};


	const f = (block) => {
		var dropdown = block.getFieldValue('operation');
		var first = Blockly.JavaScript.valueToCode(block, 'first', Blockly.JavaScript.ORDER_ATOMIC);
		var second = Blockly.JavaScript.valueToCode(block, 'second', Blockly.JavaScript.ORDER_ATOMIC);
		var third = Blockly.JavaScript.valueToCode(block, 'third', Blockly.JavaScript.ORDER_ATOMIC);
		return [dropdown+'('+first+','+second+','+third+')', Blockly.JavaScript.ORDER_NONE];
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
 Use to set sort order for toolbox items
*/
const toolbox_sort_order = {
	equal: 0,
	functions: 1,
	symbols: 2,
	references: 3,
	values: 4
};
const get_toolbox_item_sort = (s) => {
	if(typeof toolbox_sort_order[s] !== 'undefined') return toolbox_sort_order[s];

	if(s.search('_') !== -1)  {
		if( typeof toolbox_sort_order[s.substr(0, s.search('_'))] !== 'undefined') 
			return toolbox_sort_order[s.substr(0, s.search('_'))];
	}
	return 99;
};


/**
	This function does 2 things:
	  * initialize blocks
	  * return a string XML for initialized the toolbox.

	It'll default to page.toolbox. If that's not present, it'll fall back to
	feedback (which uses the same rules). If there are both, then it'll 
	combine by adding anything unique. Lastly, it'll run parseFormula to pick up 
	any symbols not explicitly added by the rules.

*/
function get_toolbox_xml( page ) {

	if(page.toolbox == null || page.feedback === null) {
		throw new Error('Null toolbox or feedback for get_toolbox_xml');
	}
	const source = page.toolbox.length === 0 ? page.feedback : page.toolbox;
	const toolbox = [];

	if(source.length === 0) 
		throw new Error('Empty toolbox and feedback for get_toolbox_xml');

	// Always add the = block. Note that this is different from the equality test = sign.
	toolbox.push(build_block('equal', build_equal));

	// Create each rule as needed.
	source.forEach( rule => {
		if (rule.has === 'functions' ) {
			rule.args.forEach( value => 
				toolbox.push(build_block( 'functions_'+ value,  () => build_function(value) ))
			);
		} else if (rule.has === 'symbols' ) {
			rule.args.forEach( value => 
				toolbox.push(build_block( 'symbols_'+ symbol_to_word[value],  () => build_symbol(value) ))
			);
		} else if(rule.has === 'references' ) {
			rule.args.forEach( value => 
				toolbox.push(build_block( 'references_'+ value,  () => build_reference(value) ))
			);
		} else if(rule.has === 'values' ) {
			rule.args.forEach( value => 
				toolbox.push(build_block( 'values_'+ value,  () => build_value(value) ))
			);
		} else if (rule.has === 'equal') {
			// Already added equal block.
		} else {
			console.log(rule);
			throw new Error('Invalid *has* for page in BlocklyFactory: ' + rule);
		}
	});

	toolbox.sort( (a,b) => get_toolbox_item_sort(a) > get_toolbox_item_sort(b) );

	return '<xml>' +
			toolbox.map( item => '<block type="'+item+'"></block>').join('\n') +
			'</xml>';

}


module.exports = {
	get_toolbox_xml
};