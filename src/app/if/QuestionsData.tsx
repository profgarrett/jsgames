// @ts-nocheck
import { IfPageBaseSchema, IfPageFormulaSchema, IfPageChoiceSchema, IfPageNumberAnswerSchema } from './../../shared/IfPageSchemas';
import { IfLevelSchema } from './../../shared/IfLevelSchema';
import { formatDate } from './../../shared/misc';
import { turn_array_into_map } from './../../shared/misc';
import he from 'he';

//const { parseFeedback } = require('./../../shared/parseFeedback');
const { get_kcs } = require('./../../shared/kcs');


// When we group up questions, should we differentiate between upper/lower 
// case instructions?  This may be useful for comparing =LEFT v. =left
const USE_CASE_SENSITIVE_DESCRIPTION_COMPARISONS = false;

// Should we export only formula pages?  Note: includes Harsons.
const USE_FORMULA_PAGES_ONLY = false;

const SOLUTION_F_LIST = [];



// Show a history item in an appealing fashion.
const pretty_history = h => {
	const s = typeof h.client_f === 'undefined' || h.client_f == null ? '' : h.client_f;
	const tags = typeof h.tags === 'undefined' 
			? [] 
			: h.tags.map( t => '<span class="badge badge-pill badge-primary">'+ he.encode(t.tag)+'</span>' );

	return he.encode(s) + ' ' + tags.join(' ');
};

// Return if the tag array has a matching tag.
// T/F
const has_tag = (tags: Array<any>, match: string): boolean => {
	if( typeof tags === 'undefined' ) return false;
	return 0 < tags.filter( t => t.tag === match ).length;
};
const get_first_matching_tag = (tags: Array<any>, match: string): null|any => {
	const f_tags = tags.filter( t => t.tag === match );
	if(f_tags.length > 0) return f_tags[0];
	return null;
};



/*
	Pass in an array of pages.
	Returns a listing of the top tags and their counts.
	Filters our intermediate, invalid token, and correct tags.
	@return [ { tag: '', n: 2} ]
*/
function rollup_tags(pages: Array<IfPageBaseSchema>): Array<any> {

	const tags: any[] = [];

	pages.map( (p: IfPageBaseSchema) => {
		if(typeof p.history == 'undefined') return;

		p.history.map( (h: any) => {
			// Parson pages don't have tags. Ignore.
			if(typeof h.tags === 'undefined') return;

			h.tags.map( tag => {
				let tag_summary = get_first_matching_tag(tags, tag.tag);
				if(tag_summary == null) {
					tags.push({ tag: tag.tag, n: 1});
				} else {
					if(typeof tag_summary.n === 'undefined') tag_summary.n = 0;
					tag_summary.n = tag_summary.n+1;
				}
			});
		});
		return p;
	});

	return tags.filter( 
			t => t.tag !== 'INTERMEDIATE' && 
				t.tag !== 'INVALID_TOKEN' &&
				t.tag !== 'CORRECT')
				.sort( (t1, t2) => t1.n < t2.n ? 1 : -1 ) ;
}





// Take in an array of *matching* levels and turn into properly formatted level summary
function create_summary_level( levels: Array<IfLevelSchema>): any {
	const summary_level = { 
		code: levels[0].code,
		n: levels.length,
		questions: []
	};

	// Gather all pages together, and then sort them out into a map.
	// Needed, as the pages are currently organized into levels by individual users.
	const all_pages = levels.reduce( 
			(all_pages, level) => {
				level.pages.map( (p: any) => all_pages.push(p));
				return all_pages;
			}, [] );

	const all_formula_pages = !USE_FORMULA_PAGES_ONLY 
			? all_pages 
			: all_pages.filter( 
				l => l.type === 'IfPageFormulaSchema' || l.type === 'IfPageHarsonsSchema' || l.type === 'IfPagePredictFormulaSchema' );

	const page_map = turn_array_into_map(all_formula_pages, 
		(p: IfPageBaseSchema): string => 
			USE_CASE_SENSITIVE_DESCRIPTION_COMPARISONS 
				? p.description + '\n' + p.instruction
				: (p.description + '\n' + p.instruction).toLowerCase()
	);

	// Pull individual pages from the original objects and insert 
	// into the question format.
	page_map.forEach( (pages: Array<IfPageBaseSchema>) => {
		summary_level.questions.push( create_summary_question( pages ));
	});

	return summary_level;
}

// Take in an array of *matching* pages, and return a properly formatted question summary.
function create_summary_question( pages: Array<IfPageBaseSchema>): any {
	const summary_question = {
		n: pages.length,
		description: pages[0].description,
		instruction: pages[0].instruction,
		type: pages[0].type,
		solution_f: '',
		correct:
			pages.reduce( (sum, p) => sum + (p.correct ? 1 : 0), 0 ), 
		seconds:
			pages.reduce((sum, p) => sum + p.get_time_in_seconds(), 0 ),
		breaks: 
			pages.reduce( (count, p) => count + p.get_break_times_in_minutes().length,	0),
		answers:
			pages.map( p => create_summary_answer(p)),
		tags: 
			rollup_tags(pages),
		// fill in below items later
		correct_average: 0, 
		seconds_average: 0, 
		breaks_average: 0,
		kcs: [],
	};

	// Averages.
	summary_question.correct_average = summary_question.correct / summary_question.n;
	summary_question.seconds_average = summary_question.seconds / summary_question.n;
	summary_question.breaks_average = summary_question.breaks / summary_question.n;

	// 
	if(pages[0].type === 'IfPageFormulaSchema' || pages[0].type === 'IfPageHarsonsSchema' || pages[0].type === 'IfPagePredictFormulaSchema') {
		// $FlowFixMe
		let p: IfPageFormulaSchema = pages[0]; // not 100% correct, but close enough for typing.

		summary_question.kcs = get_kcs( p );
		summary_question.solution_f = p.solution_f ;

	} else if (pages[0].type === 'IfPageChoiceSchema') {
		let p: IfPageChoiceSchema = pages[0].toIfPageChoiceSchema();
		summary_question.solution_f = p.solution;
	} else if (pages[0].type === 'IfPageNumberAnswerSchema') {
		let p: IfPageNumberAnswerSchema = pages[0].toIfPageNumberAnswerSchema();
		summary_question.solution_f = p.solution.toString();
	}
	

	// Add to exportable list of solutions.
	if(SOLUTION_F_LIST.filter( f => f.solution_f === summary_question.solution_f ).length < 1 ) {
		SOLUTION_F_LIST.push( { solution_f: summary_question.solution_f, kcs: summary_question.kcs  });
	}

	return summary_question;
}

function increment_tag( tags: Array<any>, tagname: string ) {	
	for(let i=0; i<tags.length; i++) {
		if(tags[i].tag === tagname) {
			tags[i].n = 1 + (typeof tags[i].n !== 'undefined' ? tags[i].n : 0 );
			return;
		}
	}
	tags.push({ tag: tagname, n: 1});
}

function create_summary_answer( page: IfPageBaseSchema, ): any {
	const summary_answer = {
		template_id: page.template_id,
		type: page.type,
		username: page.username,
		seconds: page.get_time_in_seconds(),
		breaks: page.get_break_times_in_minutes().join(', '),
		completed: page.completed,
		correct: page.correct,
		tags: [],
		page: page,
		sequence_in_level: page.sequence_in_level,
		level_completed: page.level_completed,
		server_page_added: page.server_page_added,
		server_nextactivity: page.server_nextactivity,
		hints_parsed: page.hints_parsed,
		hints_viewsolution: page.hints_viewsolution,
	};

	// Harsons and/or formulas
	if( page.type === 'IfPageHarsonsSchema' || page.type === 'IfPageFormulaSchema' || page.type === 'IfPagePredictFormulaSchema' ) {

		const hints_parsed = page.history.filter( h => typeof h.hints_parsed !== 'undefined' ).length;
		const hints_viewsolution = page.history.filter( h => typeof h.hints_viewsolution !== 'undefined' ).length;
		summary_answer.hints_parsed = hints_parsed;
		summary_answer.hints_viewsolution = hints_viewsolution;

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
			const tags = typeof h.tags === 'undefined' || h.tags === null ? [] : h.tags;

			return tags.map( tag => {
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
		summary_answer.client = page.client;
		summary_answer.intermediate = '';
		summary_answer.all = '';
		summary_answer.code = page.code;
		summary_answer.client_n = page.client_items.indexOf(page.client);
	}

	// Number
	if( page.type === 'IfPageNumberAnswerSchema') {
		summary_answer.breaks = page.get_break_times_in_minutes().join(', ');
		summary_answer.type = 'number';
		summary_answer.html = page.client;
		summary_answer.answer = page.client;
		summary_answer.q_solution_f = page.solution;
		summary_answer.expand = '';
		summary_answer.client = page.client;
		summary_answer.intermediate = '';
		summary_answer.all = '';
		summary_answer.code = page.code;
	}

	return summary_answer;
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



// Convert dt to date if it is text.
function convert_to_date_if_string( s: any): Date {
	if(typeof s === 'string') return new Date(s);
	return s;
}

////////////////////////////////////////////////////////////////////////////////
export function create_summary( levels: Array<IfLevelSchema>): any {
	const summaries = [];

	// find the time/date that each page was created.
	// Depends on no filter being set on pagetype.
	const add_page_history = (l) => {
		const hist = l.history.filter( (h) => { return h.code === 'server_page_added'; } );
		if( hist.length !== l.pages.length) return;

		// Start dt
		l.pages.forEach( (p, i) => {
			p.server_page_added = convert_to_date_if_string(hist[i].dt);
		});
		// End dt
		for( let i=0; i<l.pages.length - 1 ; i++ ){
			l.pages[i].server_nextactivity = l.pages[i+1].server_page_added;
		}
		// Last page
		l.pages[l.pages.length-1].server_nextactivity = convert_to_date_if_string(l.history[l.history.length-1].dt);
		
	};
	levels.map( l => add_page_history( l ) );

	// Add several variables to all pages (since that data is stored in the level, not page)
	levels.map( l => l.pages.map( p => p.username = l.username ));
	levels.map( l => l.pages.map( p => p.id = l._id ));
	levels.map( l => l.pages.map( p => p.level_completed = l.completed ));
	levels.map( l => l.pages.map( p => p.standardize_formula_case = l.standardize_formula_case ));

	// Add the index (position) of each page in the level.  Since levels can use
	// questions in any order, this allows detecting the order of each question later on.
	levels.map( l=> l.pages.map( (p, i) => p.sequence_in_level = i ));

	// Split up array into a map of levels, each with an array of matching levels.
	const level_map = turn_array_into_map(levels, 
		(l: IfLevelSchema): string => l.code
	);

	level_map.forEach( (levels: Array<IfLevelSchema> ) => {
		summaries.push( create_summary_level( levels ) );
	});

	return summaries;
}


