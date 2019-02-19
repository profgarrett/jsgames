//      
import React from 'react';
import { IfLevels } from './../../shared/IfGame';

                                                                                                       
                                  
import { DEMO_MODE } from './../../server/secret';

import { HtmlDiv } from './../components/Misc';
import { turn_array_into_map } from './../../shared/misc';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import he from 'he';
const { parseFeedback } = require('./../../shared/parseFeedback');


                  
                          
               
  

                        
                         
  



// When we group up questions, should we differentiate between upper/lower 
// case instructions?  This may be useful for comparing =LEFT v. =left
const USE_CASE_SENSITIVE_DESCRIPTION_COMPARISONS = false;

// toLocaleTimeString is super slow when used with a larger number of objects.
// Create a custom little formatter to speed things up.  Changed from 6s to 
// almost nothing.
const formatDate = (dt      )         => {

	if(typeof dt === 'undefined') return 'undefined';
	if(typeof dt.getFullYear === 'undefined') return 'undefined';

	return dt.getFullYear().toString().substr(2) + '/' +
		dt.getMonth() + 1 + '/' +
		dt.getDate() + ', ' +
		dt.getHours() + ':' + 
		(dt.getMinutes() + ':').padStart(3, '0') +
		(dt.getSeconds() + '').padStart(2, '0');

	//return '123'; //.toLocaleTimeString('en-US')
};

// Show a history item in an appealing fashion.
const pretty_history = h => {
	const tags = h.tags
			.map( t => '<span class="badge badge-pill badge-primary">'+ he.encode(t.tag)+'</span>' );

	return he.encode(h.client_f) + ' ' + tags.join(' ');
};

// Return if the tag array has a matching tag.
// T/F
const has_tag = (tags               , match        )          => {
	return 0 < tags.filter( t => t.tag === match ).length;
};
const get_first_matching_tag = (tags               , match        )          => {
	const f_tags = tags.filter( t => t.tag === match );
	if(f_tags.length > 0) return f_tags[0];
	return null;
};
// Return the count for the given tag. 
// Returns 0 if not found.
function get_tag_n( tags            , tag        )         {
	for(let i=0; i<tags.length; i++) {
		if(tags[i].tag == tag) return tags[i].n;
	}
	return 0;
}



/*
	Pass in an array of pages.
	Returns a listing of the top tags and their counts.
	Filters our intermediate, invalid token, and correct tags.
	@return [ { tag: '', n: 2} ]
*/
function rollup_tags(pages                 )             {

	const tags = [];

	pages.map( (p          ) => {
		if(typeof p.history == 'undefined') return;

		p.history.map( h => {
			// Parson pages don't have tags. Ignore.
			if(typeof h.tags === 'undefined') return;

			h.tags.map( tag => {
				let tag_summary = get_first_matching_tag(tags, tag.tag);
				if(tag_summary === null) {
					tags.push({ tag: tag.tag, n: 1});
				} else {
					tag_summary.n = tag_summary.n+1;
				}
			});
		});
	});

	return tags.filter( 
			t => t.tag !== 'INTERMEDIATE' && 
				t.tag !== 'INVALID_TOKEN' &&
				t.tag !== 'CORRECT')
				.sort( (t1, t2) => t1.n < t2.n ? 1 : -1 ) ;
}


// Return a complexity analysis of the ideal solution.
function get_complexity( solution_f         )                {
	const complexity = [];

	const parsed_f = parseFeedback( solution_f );

	parsed_f.map( has => { 
		// Add count.
		if( has.args.length > 0)
			complexity.push( { tag: has.args.length + ' ' + has.has });

		// Add individual tags
		has.args.map( arg => { complexity.push( { tag: has.has + ' ' + arg }); });
	});

	// See if we have parens.
	// These get removed by the parsing code.
	if( /[^A-z]\(/.test(solution_f)  ) {
		complexity.push( { tag: 'symbols (' });
	}

	return complexity;
}





////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/*
	Used to prepare data for use in each module.

	Turn a simple array of levels into a more complex data structure.

Input: 
	[ LevelType, ... ]
	Inside each LevelType is an array of pages.
	Mixed up by user and level.

Output: 
	<LevelSummary>
		code: string
		n: 0, 
		...
		questions: [ 
			<QuestionSummary>
				n: 0, 
				... 
				answers: [ PageType ]

*/

////////////////////////////////////////////////////////////////////////////////
function create_summary( levels                  )      {
	const summaries = [];

	// Add username to all pages (since that data is stored in the level, not page)
	levels.map( l => l.pages.map( p => p.username = l.username ));


	// Split up array into a map of levels, each with an array of matching levels.
	const level_map = turn_array_into_map(levels, 
		(l           )         => l.code
	);

	level_map.forEach( (levels                   ) => {
		summaries.push( create_summary_level( levels ) );
	});

	return summaries;
}

// Take in an array of *matching* levels and turn into properly formatted level summary
function create_summary_level( levels                  )      {
	const summary_level = { 
		code: levels[0].code,
		n: levels.length,
		questions: []
	};

	// Gather all pages together, and then sort them out into a map.
	// Needed, as the pages are currently organized into levels by individual users.
	const all_pages = levels.reduce( 
			(all_pages, level) => {
				level.pages.map( p => all_pages.push(p));
				return all_pages;
			}, [] );

	const all_pages_but_text = all_pages.filter( l => l.type !== 'IfPageTextSchema' );

	const page_map = turn_array_into_map(all_pages_but_text, 
		(p          )         => 
			USE_CASE_SENSITIVE_DESCRIPTION_COMPARISONS 
				? p.description + '\n' + p.instruction
				: (p.description + '\n' + p.instruction).toLowerCase()
	);

	// Pull individual pages from the original objects and insert 
	// into the question format.
	page_map.forEach( (pages                 ) => {
		summary_level.questions.push( create_summary_question( pages ));
	});

	return summary_level;
}

// Take in an array of *matching* pages, and return a properly formatted question summary.
function create_summary_question( pages                 )      {
	const summary_question = {
		n: pages.length,
		description: pages[0].description,
		instruction: pages[0].instruction,
		type: pages[0].type,
		correct:
			pages.reduce( (sum, p) => sum + (p.correct?1:0), 0 ), 
		seconds:
			pages.reduce((sum, p) => sum + p.get_time_in_seconds(), 0 ),
		breaks: 
			pages.reduce( (count, p) => count + p.get_break_times_in_minutes().length,	0),
		answers:
			pages.map( p => create_summary_answer(p)),
		tags: 
			rollup_tags(pages)
	};

	summary_question.complexity = 
			typeof pages[0].solution_f !== 'undefined' 
				? get_complexity( pages[0].solution_f ) 
				: false;
	summary_question.solution_f = 
			typeof pages[0].solution_f !== 'undefined' 
				? pages[0].solution_f 
				: pages[0].solution;

	// Averages.
	summary_question.correct_average = summary_question.correct / summary_question.n;
	summary_question.seconds_average = summary_question.seconds / summary_question.n;
	summary_question.breaks_average = summary_question.breaks / summary_question.n;

	return summary_question;
}

function increment_tag( tags            , tagname         ) {	
	for(let i=0; i<tags.length; i++) {
		if(tags[i].tag === tagname) {
			tags[i].n = 1 + (typeof tags[i].n !== 'undefined' ? tags[i].n : 0 );
			return;
		}
	}
	tags.push({ tag: tagname, n: 1});
}

function create_summary_answer( page           )      {
	const summary_answer = {
		username: page.username,
		seconds: page.get_time_in_seconds(),
		breaks: page.get_break_times_in_minutes().join(', '),
		completed: page.completed,
		correct: page.correct,
		tags: [],
		page: page
	};

	// Harsons and/or formulas
	if( page.type === 'IfPageHarsonsSchema' || page.type === 'IfPageFormulaSchema' ) {
		const history = page.history.filter( h => !has_tag(h.tags, 'INTERMEDIATE' ) );
		const history_string = history.map( h => pretty_history(h) ).join('<br/>');
		const expand_string = page.history
			.filter( h => typeof h.client_f !== 'undefined')
			.map( h => formatDate(h.dt) + ': ' + pretty_history(h) )
			.join('<br/>');

		summary_answer.type = 'formulas';
		summary_answer.html = history_string;
		summary_answer.expand = expand_string;

		summary_answer.answer = page.client_f;
		summary_answer.intermediate = history.map( h => pretty_history(h) ).join('\n');
		summary_answer.all = page.history
			.filter( h => typeof h.client_f !== 'undefined')
			.map( h => formatDate(h.dt) + ': ' + pretty_history(h) )
			.join('\n');

		// Add tags.
		page.history.map( h => {
			h.tags.map( tag => {
				increment_tag( summary_answer.tags, tag.tag );
			});
		});
	}

	// Choice.
	if( page.type === 'IfPageChoiceSchema') {
		summary_answer.breaks = page.get_break_times_in_minutes().join(', ');
		summary_answer.type = 'choice';
		summary_answer.html = page.client;
		summary_answer.expand = '';
		summary_answer.answer = page.client;
		summary_answer.intermediate = '';
		summary_answer.all = '';
		summary_answer.code = page.code;
	}

	return summary_answer;
}




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Class used to show data in a react table that can be easily viewed.
////////////////////////////////////////////////////////////////////////////////
class IfPagesTable extends React.Component                  {


	// Render a single summary row
	_render_answers_for_pages_with_same_question(question     )       {

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: answer => DEMO_MODE ? '*****' : answer.username,
			width: 150
		}, {
			id: 'seconds',
			Header: 'Time (s)',
			accessor: answer => answer.seconds,
			style: {textAlign: 'right'},
			width: 75
		}, {
			id: 'breaks',
			Header: 'breaks',
			accessor: answer => answer.breaks,
			style: {textAlign: 'right'},
			width: 30
		}, {
			id: 'correct',
			Header: 'Correct?',
			accessor: answer => answer.correct ? 'Y' : '',
			width: 80
		}, {
			id: 'completed',
			Header: 'completed',
			accessor: answer => answer.completed ? 'Y' : '' ,
			width: 50
		}, {
			id: 'html',
			Header: 'html',
			accessor: answer => <HtmlDiv html={answer.html} />,
			width: 450
		}, {
			expander: true,
			Header: () => <b>More</b>,
			width: 65,
			Expander: ({ isExpanded, ...rest }) => 
				<div> 
					{ isExpanded 
						? <span>&#x2299;</span>
						: <span>&#x2295;</span>}
				</div>,
			style: {
				cursor: 'pointer',
				fontSize: 32
			}
		}];


		return (<div>
					<div style={{ backgroundColor: 'gray', marginTop: 20 }}>
						{ question.description }
						{ question.instruction }
						<b>{ question.solution_f }</b>
						<div>{ question.complexity.map( 
							(tag,i) => 
									<span key={'questioncomplexity'+i} className='badge badge-pill badge-info'>
										{ tag.tag }</span>) }
						</div>
					</div>
					<ReactTable 
						data={question.answers} 
						filterable={true}
						columns={columns}
						defaultSorted={['type', 'seconds']}
						defaultPageSize={question.answers.length}
						style={{ backgroundColor: '#f5f5f5' }}
						SubComponent={ (p) => <HtmlDiv html={p.original.expand} /> }
					/> 
				</div>);

	}


	// Return a table with the questions for the given level.
	_render_a_levels_questions(level_summary     )       {

		const columns = [{
			id: 'description',
			Header: 'Desc',
			accessor: q => q.description,
			width: 150
		}, {
			id: 'type',
			Header: 'Type',
			accessor: q => q.type.substr(6),
			width: 70
		}, {
			id: 'count',
			Header: 'N',
			accessor: q => q.n,
			style: {textAlign: 'right'},
			width: 50
		}, {
			id: 'correct',
			Header: 'Correct',
			accessor: q => Math.round(q.correct_average*100)+'%',
			style: {textAlign: 'right'},
			width: 100
		}, {
			id: 'seconds',
			Header: 'Seconds',
			accessor: q => Math.round(q.seconds_average),
			style: {textAlign: 'right'},
			width: 50
		}, {
			id: 'tags',
			Header: 'Tags',
			accessor: q => q.tags.map( t => t.n + ' ' + t.tag ).join(', '),
			width: 400
		}, {
			id: 'breaks',
			Header: 'breaks',
			accessor: q => q.breaks === 0 ? '' : q.breaks,
			style: {textAlign: 'right'},
			width: 50
		}, {
			expander: true,
			Header: () => <b>More</b>,
			width: 65,
			Expander: ({ isExpanded, ...rest }) => 
				<span> 
					{ isExpanded 
						? <span>&#x2299;</span>
						: <span>&#x2295;</span>}
				</span>,
			style: {
				cursor: 'pointer',
				fontSize: 16
			}
		}];

		return <ReactTable
			data={level_summary.questions}
			filterable={true}
			columns={columns}
			SubComponent={ (q) => this._render_answers_for_pages_with_same_question(q.original) }
			/>;
		
	}


	render()       {
		const levels = this.props.levels;


		// If empty, return a div.
		if(levels.length < 1) 
			return <div/>;

		// Go through each map of levels and return a table for each.
		const html = levels.map( 
			(level_summary,i) => 
				<div key={'IfPagesTableRender' + i}>
					<h1>{ level_summary.code }</h1>
					{ this._render_a_levels_questions(level_summary) }
				</div>
			);

		return html;
	}
}


class IfPagesExcel extends React.Component                  {


	// Convert the nested structure into a flat table of common values.
	flatten_levels(levels     )      {
		const columns = [
			'level',
			'q_code',
			'q_solution_f', 
			'q_solution_f_length',

			'q_complexity',
			'q_complexity_functions', 'q_complexity_values', 'q_complexity_symbols', 'q_complexity_references',
			//'q_description', 'q_instruction', 
			'q_type','q_n', 
			'q_correct_average', 'q_seconds_average', 'q_tags',
			
			'a_username', 'a_seconds', 
			//'a_breaks', 
			'a_correct', 'a_completed',
			// 'a_html',
			/*
			'a_tag_ABS_REF', 'a_tag_NO_STARTING_EQUAL', 'a_tag_NON_ROW_1_REFERENCE', 'a_tag_NON_EXISTANT_COLUMN_REFERENCE',
			'a_tag_USES_A_REFERENCE_NOT_IN_SOLUTION', 'a_tag_MISSING_A_REFERENCE_USED_IN_SOLUTION', 
			'a_tag_USES_FUNCTION_NOT_IN_SOLUTION', 'a_tag_FORMULA_WITHOUT_PAREN', 'a_tag_USES_NUMBER_IN_QUOTES',
			'a_tag_USES_VALUE_NOT_IN_SOLUTION', 
			*/
			'a_tag_INTERMEDIATE',
			//'a_tag_TYPO', 'a_tag_CORRECT',
			'a_answer_final', 'a_answer_intermediate', 
			'a_tutorial'
			//'a_answer_all'
			];
		const rows = [];

		levels.map( level_summary => {
			const defaults = { 'level': level_summary.code };
			this.flatten_level_questions( rows, level_summary, columns, defaults );
		});
		

		return { columns, rows };
	}

	flatten_level_questions(rows            , level_summary     , columns     , defaults     ) {

		level_summary.questions.map( question => {
			const complexity = question.complexity ? question.complexity : [];
			const local = {
				q_code: question.description + '. ' + question.instruction,
				q_solution_f: question.solution_f ? "'" + question.solution_f : '',
				q_solution_f_length: question.solution_f ? question.solution_f.length : '',

				q_complexity: complexity.map( c => c.tag).join(', '),
				q_complexity_functions: complexity.filter( c => c.tag.substr(0,4) === 'func').length,
				q_complexity_values: complexity.filter( c => c.tag.substr(0,4) === 'valu').length,
				q_complexity_symbols: complexity.filter( c => c.tag.substr(0,4) === 'symb').length,
				q_complexity_references: complexity.filter( c => c.tag.substr(0,4) === 'refe').length,
				q_description: question.description,
				q_instruction: question.instruction,
				q_type: question.type.substr(6),
				q_n: question.n,
				q_correct_average: Math.round(question.correct_average*100)+'%',
				q_seconds_average: Math.round(question.seconds_average),
				q_tags: question.tags.map( t => t.n + ' ' + t.tag ).join(', '),
				//q_solution_f: question.solution_f,
				...defaults
			};
			this.flatten_level_question_answers( rows, question, columns, local);
		});
	}

	replace_spans(s        )         {
		if(s === null) return;
		if(typeof s === 'undefined') return;

		return s
			.replace( new RegExp('<span class="badge">', 'g'), '[')
			.replace( new RegExp('</span>', 'g'), ']');
	}
	

	flatten_level_question_answers(rows            , question     , columns     , defaults     ) {

		question.answers.map( answer => {
			
			const local = {
				'a_username': answer.username, 
				'a_seconds' : answer.seconds, 
				//'a_breaks': answer.breaks, 
				'a_correct': answer.correct ? 1 : 0,
				'a_completed': answer.completed ? 1 : 0, 
				'a_html': answer.html,
				'a_tag_ABS_REF': get_tag_n(answer.tags, 'ABS_REF'),
				'a_tag_NO_STARTING_EQUAL': get_tag_n(answer.tags, 'NO_STARTING_EQUAL'),
				'a_tag_NON_ROW_1_REFERENCE': get_tag_n(answer.tags, 'NON_ROW_1_REFERENCE'),
				'a_tag_NON_EXISTANT_COLUMN_REFERENCE': get_tag_n(answer.tags, 'NON_EXISTANT_COLUMN_REFERENCE'),
				'a_tag_USES_A_REFERENCE_NOT_IN_SOLUTION': get_tag_n(answer.tags, 'USES_A_REFERENCE_NOT_IN_SOLUTION'),
				'a_tag_MISSING_A_REFERENCE_USED_IN_SOLUTION': get_tag_n(answer.tags, 'MISSING_A_REFERENCE_USED_IN_SOLUTION'),
				'a_tag_USES_FUNCTION_NOT_IN_SOLUTION': get_tag_n(answer.tags, 'USES_FUNCTION_NOT_IN_SOLUTION'),
				'a_tag_FORMULA_WITHOUT_PAREN': get_tag_n(answer.tags, 'FORMULA_WITHOUT_PAREN'),
				'a_tag_USES_NUMBER_IN_QUOTES': get_tag_n(answer.tags, 'USES_NUMBER_IN_QUOTES'),
				'a_tag_USES_VALUE_NOT_IN_SOLUTION': get_tag_n(answer.tags, 'USES_VALUE_NOT_IN_SOLUTION'),
				'a_tag_INTERMEDIATE': get_tag_n(answer.tags, 'INTERMEDIATE'),
				'a_tag_TYPO': get_tag_n(answer.tags, 'TYPO'),
				'a_tag_CORRECT': get_tag_n(answer.tags, 'CORRECT'),

				a_tutorial: answer.page.code === 'tutorial' ? 1 : 0,
				'a_answer_final': "'" + this.replace_spans(answer.answer),
				'a_answer_intermediate': "'" + this.replace_spans(answer.intermediate),
				'a_answer_all': "'" + this.replace_spans(answer.all),

				...defaults
			};

			rows.push(local);
		});

	}

/*

   "ajv": "^6.9.1",
    "ajv-keywords": "^3.4.0",
    "babel-cli": "^6.26.0",
    "babel-core": "^6.26.3",
    "babel-eslint": "^8.2.6",
    "babel-jest": "^23.6.0",
    "babel-loader": "^7.1.5",
    "babel-plugin-transform-flow-strip-types": "^6.22.0",
    "babel-plugin-transform-object-rest-spread": "^6.26.0",
    "babel-polyfill": "^6.26.0",
    "babel-preset-env": "^1.7.0",
    "babel-preset-flow": "^6.23.0",
    "babel-preset-react": "^6.24.1",
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.18.3",
    "bugsnag": "^2.4.3",
    "bugsnag-js": "^4.7.3",
    "bugsnag-react": "^1.1.1",
    "chokidar": "^2.1.1",
    "clean-webpack-plugin": "^0.1.19",
    "compression": "^1.7.3",
    "cookie-parser": "^1.4.3",
    "cross-fetch": "^2.2.3",
    "css-loader": "^1.0.1",
    "eslint": "^5.13.0",
    "eslint-config-standard": "^11.0.0",
    "eslint-plugin-flowtype": "^2.50.3",
    "eslint-plugin-import": "^2.16.0",
    "eslint-plugin-node": "^7.0.1",
    "eslint-plugin-promise": "^3.8.0",
    "eslint-plugin-react": "^7.12.4",
    "eslint-plugin-standard": "^3.1.0",
    "eslint-watch": "^4.0.2",
    "express": "^4.16.4",
    "flow": "^0.2.3",
    "flow-bin": "^0.78.0",
    "flow-remove-types": "^1.2.3",
    "fsevents": "^1.2.7",
    "he": "^1.2.0",
    "hot-formula-parser": "^3.0.0",
    "html-webpack-plugin": "^3.2.0",
    "jsonwebtoken": "^8.4.0",
    "lodash": "^4.17.11",
    "mysql": "^2.16.0",
    "nodemon": "^1.18.10",
    "npm": "^6.7.0",
    "promise-mysql": "^3.3.1",
    "promise-polyfill": "^8.1.0",
    "prop-types": "^15.7.1",
    "rc-slider": "^8.6.5",
    "react": "^16.8.1",
    "react-beautiful-dnd": "^9.0.2",
    "react-bootstrap": "^0.32.4",
    "react-dom": "^16.8.1",
    "react-router-bootstrap": "^0.24.4",
    "react-router-dom": "^4.3.1",
    "react-spinners": "^0.3.3",
    "react-table": "^6.9.2",
    "seedrandom": "^2.4.4",
    "serve-static": "^1.13.2",
    "socket.io": "^2.2.0",
    "style-loader": "^0.22.1",
    "url-search-params-polyfill": "^4.0.1",
    "webpack": "^4.29.3",
    "webpack-cli": "^3.2.3",
    "webpack-dev-server": "^3.1.14",
    "whatwg-fetch": "^2.0.4"

*/
	render()       {
		const levels = this.props.levels;
		const flat = this.flatten_levels(levels);
		const rows = flat.rows;
		const columns = flat.columns;
		const td_style = {
			'border': 'solid 1px black',
			'padding': 5,
			'textAlign': 'right'
		};

		// Go through each map of levels and return a table for each.
		const trs = rows.map( 
			(answer,i) => {
				const tds = [];

				for(let i=0; i<columns.length; i++) {
					tds.push( <td key={'excel_td_'+i} style={td_style}>{ answer[columns[i]]}</td> );
				}

				return <tr key={'excel_tr_'+i}>{ tds }</tr>;
			}
			);

		const ths = columns.map( (col,i) => <th key={'excel_ths_'+i}>{col}</th>);

		// If empty, return a div.
		if(rows.length < 1) return <table/>;

		return (<table>
				<thead><tr>{ ths }</tr></thead>
				<tbody>{ trs }</tbody>
				</table>);
	}
}




export default class IfQuestions extends React.Component            {

	render()       {
		if(this.props.levels.length < 1) 
			return <div/>;

		const levels = create_summary(this.props.levels);

		console.log(levels);

		if(this.props.output === 'table')
			return <IfPagesTable levels={levels} />;

		if(this.props.output === 'excel')
			return <IfPagesExcel levels={levels} />;

		throw new Error('Invalid output type passed to IfQuestions');
	}



}
