// @flow
import React from 'react';
import ReactTable from 'react-table';
import { Popover, Table, Modal, Button } from 'react-bootstrap';
import { turn_array_into_map } from './../../shared/misc.js';
import { HtmlDiv } from './../components/Misc.js';
import { ResponsiveBar, Bar } from '@nivo/bar'
import { Pie } from '@nivo/pie'
import IfLevelScore from './IfLevelScore';
import { prettyDateAsString } from './../components/Misc';
import { IfLevelSchema, GREEN_GRADE, PASSING_GRADE, DEFAULT_TUTORIAL_LEVEL_LIST } from './../../shared/IfLevelSchema';
import { IfPageBaseSchema, IfPageFormulaSchema } from './../../shared/IfPageSchemas';
import { fill_template } from './../../shared/template.js';

import type { Node } from 'react';

import 'react-table/react-table.css';

import { IfLevels } from './../../shared/IfLevelSchema';
import { DEMO_MODE } from './../../server/secret';


type PropsType = {
	data: Array<any>,
};

type StateType = {
    code: string,
    caption: string,
    el: Object,
};


const colors = {
    'Correct': 'rgb(102, 166, 30)',
    'Correct, but slow': 'rgb(230, 171, 2)',
    'Incorrect': 'rgb(231, 41, 138)',
}

const MAX_VALUE_FOR_CHART = 120;

export class ClassProgressKCs extends React.Component<PropsType, StateType> {
	constructor(props: any) {
		super(props);
        this.state = {
            code: 'math2',
            caption: '',
            el: null,
        };
        (this: any)._on_hover_to_show = this._on_hover_to_show.bind(this);
	}

    // Focus on a specific item.
    _on_hover_to_show(caption: string, el: Node) {
        this.setState({ caption, el });
    }


    _render_users_by_time_bar(s: Object): Node {
        const data = s.pages;

        return (<div>
            { s.username }
            <Bar
            data={ data }
            keys={['Correct', 'Incorrect', 'Correct, but slow' ]}
            indexBy='sequence_in_level'
            enableLabel={false}
            height={200}
            width={600}
            groupMode='grouped'
            colors={ c => colors[c.id] }
            margin={{ top: 20, right: 25, left: 35, bottom: 50 }}
            tooltip={
                o => {
                    // Show a tooltip with the people.
                    //console.log(caption);
                    return o.data.caption;
                    //caption.props.children = caption;

                    //this._on_hover_to_show( o.data.caption );
                    //return 'Click to see in side panel';
                    //return 'Solution: ' + o.data.solution  + ', and Attempted: '+ o.data.attempts;
                }
            }
            gridYValues={[0, 30, 60, 90, 120]}
            axisLeft={{
                tickValues: [0, 30, 60, 90, 120]
            }}
            onClick={
                o => { // Show a focus on that item.
                    //console.log(o);
                    //this._on_hover_to_show( o.data.caption );
                }
            }
            isInteractive={true}
            animate={true}
            onMouseEnter={(data, event) => {
                event.target.style.opacity = 0.75;
                //console.log(data);
            }}
            maxValue={MAX_VALUE_FOR_CHART}
            onMouseLeave={(data, event) => {
                event.target.style.opacity = 1;
            }}
            />

        </div>);
    }
    

	_render_users_by_time(levels: Array<IfLevelSchema>): Node {
		if(levels.length < 1) return null;
        
        const filtered_data = levels.filter( p => p.code === this.state.code );

        const summaries = create_summaries(filtered_data);

        const lis = summaries.map( (s,i) => <li key={'classprogresskc'+i}>{ this._render_users_by_time_bar(s) }</li>);
        const pop = this.state.caption === '' ? null :
            <Popover id={`popover-positioned-top`} >
                <Popover.Title as="h3">Details for question</Popover.Title>
                <Popover.Content>
                    <HtmlDiv html={ this.state.caption} />
                </Popover.Content>
            </Popover>;
        

		return (<div>
            <h3>Progress for { this.state.code }</h3>
            
            { pop }
            <ul>{ lis }</ul>
            </div>);
	}

    _render_kcs(levels: Array<IfLevelSchema>): Node {
        if(levels.length === 0) return null;

        const level_map = turn_array_into_map( levels, l => l.code );
        const html = [];
        let temp = [];

        console.log( IfLevels.map( l => l.code ));

        IfLevels.forEach( level => {
            if(level.code === 'tutorial'
                || level.code.search('survey') !== -1
                || level.code.search('review') !== -1  ) return;

            if(!level_map.has(level.code) )  return;

            // Add title for level.
            html.push(<h3 key={'renderkcslevel'+level.code} style={{ clear: 'both' }}>{ level.title }</h3>);

            // Add each KC at a separate chart.
            this._render_kc_charts( level_map.get(level.code) ).forEach( el => html.push(el) );
        });

        return html;
    }

    // Return an array of charts, one per KC in the passed levels array.
    _render_kc_charts(levels: Array<IfLevelSchema>): Array<Node> {
        if(levels.length === 0) return;
        const els = [];
        const answers = [];
        let data = [];
        const level_code = levels[0].code;

        levels.forEach( l => {
            let a = build_answers_from_level(l);
            a.forEach( a => answers.push(a));
        });

        const kc_keys = get_distinct_values_from_answers(answers, 'kcs_as_string' );
        const kc_data = get_classification_by_kcs( answers );
   
        kc_keys.forEach( kc => {
            const kc_pretty = kc === '' ? 'General' : kc.split(',').join(', ').replace( /kc\_/g, '').replace(/\_/g, ' ');

            data = kc_data.filter( d => d.kcs_as_string === kc )
            if(data.length !== 1) {
                console.log(data);
                throw new Error('Should be only a single kc');
            }
            const incorrect = typeof(data[0]['Incorrect']) === 'undefined' ? 0 : data[0]['Incorrect'];
            const correct = typeof(data[0]['Correct']) === 'undefined' ? 0 : data[0]['Correct'];
            const slow = typeof(data[0]['Correct, but slow']) === 'undefined' ? 0 : data[0]['Correct, but slow'];

            const max = (incorrect + correct + slow) / 100;

            data = [   
                {
                    id: 'Wrong',
                    value: Math.round(incorrect / max) ,
                    color: colors['Incorrect'],
                },{
                    id: 'Ok',
                    value: Math.round(correct / max) ,
                    color: colors['Correct'],
                },{
                    id: 'Slow',
                    value: Math.round(slow / max),
                    color: colors['Correct, but slow'],
                }
            ];

            els.push(<div 
                    key={'classprogresskcpiechart'+level_code+kc} 
                    style={{ float: 'left', height: 250, width: 200, textAlign: 'center' }}>
                <Pie
                    data={ data }
                    width={ 150 }
                    height={ 150 }
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    innerRadius={ 0 }
                    padAngle={ 0 }
                    tooltip={ o => o.id + ' ' + o.value + '%' }
                    colors={ c => c.color }
                    enableSlicesLabel={ false }
                    enableRadialLabels={false}
                    sliceLabel={function(e){return e.id+", "+e.value+"%"}}
                    slicesLabelsSkipAngle={20}
                />
                <i>{ kc_pretty }</i>
                </div>);
                
        });

        return els;
/*
            tooltip={
                o => {
                    // Show a tooltip with the people.
                    //console.log(caption);
                    //return o.data.caption;
                    //caption.props.children = caption;

                    //this._on_hover_to_show( o.data.caption );
                    //return 'Click to see in side panel';
                    //return 'Solution: ' + o.data.solution  + ', and Attempted: '+ o.data.attempts;
                }
            }
            onClick={
                o => { // Show a focus on that item.
                    //console.log(o);
                    //this._on_hover_to_show( o.data.caption );
                }
            }
            onMouseEnter={(data, event) => {
                event.target.style.opacity = 0.75;
                //console.log(data);
            }}
            onMouseLeave={(data, event) => {
                event.target.style.opacity = 1;
            }}

        */
    }

    render(): Node {
        const iflevels = this.props.data.map( l => new IfLevelSchema(l) );
        return <div>
            { this._render_users_by_time(iflevels) }
            </div>;
    }
}

function get_distinct_values_from_answers( answers: Array<IfPageAnswer>, prop: string ): Array<string> {
    const results_obj = {};
    answers.forEach( a => {
        // $FlowFixMe
        if(typeof results_obj[a[prop]] === 'undefined') results_obj[a[prop]] = true;
    });

    return turn_object_keys_into_array(results_obj);
}

function get_classification_by_kcs( answers: Array<IfPageAnswer> ): any {
    let kcs = get_distinct_values_from_answers(answers, 'kcs_as_string');
    let classifications = get_distinct_values_from_answers(answers, 'classification');
    let data_o = {};

    // Create a new data element for each kc, with a value for each classification.
    kcs.forEach( key => {
        data_o[key] = { kcs_as_string: key };
        classifications.forEach( c => data_o[key][c] = 0 );
    });

    // Go through each answer, incrementing as needed.
    answers.forEach( answer => {
        data_o[ answer.kcs_as_string ][ answer.classification ] += 1;
    });

    return turn_object_values_into_array(data_o);
}


function turn_object_keys_into_array( o: any): Array<any> {
    const results_a = [];
    for( let key in o ) {
        if(o.hasOwnProperty(key)) {
            results_a.push(key);
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


/**
	Class used to quickly transmit essential information to summarize the success / failure of a page.
	Used to reduce the amount of data to be transmitted across the wire when profs want to see
	a quick summary of how their class is doing.
 */
class IfPageAnswer {
    username: string
    sequence_in_level: number
    kcs_as_string: string // comma delimited list.
    answers: Array<string>
    solution: string
    solution_pretty: string
    correct: ?boolean
    seconds: number
    classification: string
}


// Initialize from a page.
function build_answers_from_level( level: IfLevelSchema ): Array<IfPageAnswer> {
    const username = level.username;
    const answers = [];
    let a = null;

    level.pages.forEach( (p,i)=> {
        if(p.type !== 'IfPageFormulaSchema' && p.type !== 'IfPageHarsonsSchema') return;

        a = new IfPageAnswer();
        a.username = username;
        a.sequence_in_level = i;
        a.kcs_as_string = p.kcs.join(',');
        a.solution = p.get_solution();
        a.solution_pretty = ''+fill_template( a.solution, p.template_values )
        a.correct = p.correct;
        a.seconds = p.get_time_in_seconds();

        // Grab all of the answers in the given page and return as an array of an array of strings.
        // [  ['=1', '=23'], ['=32'], ...]
        const non_intermediate_histories = typeof p.history  === 'undefined' || p.history.length == 0 
            ? []
            : p.history.filter( history => {
                if( typeof history.tags === 'undefined') return false;

                // If this history has an INTERMEDIATE, no!
                if( history.tags.filter( t => t.tag === 'INTERMEDIATE' ).length !== 0)  return false;

                // Only give histories for thing we understand, like client_f
                if( typeof history.client_f === 'undefined') return false;

                return true;
            });
        
        a.answers = non_intermediate_histories.map( h => h.client_f );
        a.classification = !p.correct 
            ? 'Incorrect' 
            : a.seconds > 60 ? 'Correct, but slow' : 'Correct';
        
        answers.push(a)
    });

    return answers;
}


// Return 
function get_kcs_from_pages(pages: Array<IfPageBaseSchema>): any {
    return turn_array_into_map( pages, p => p.kcs.join(', ') );
}


// Go through all of the pages in *each* level, and split into a map keyed by the question.
function get_pages_from_levels(levels: Array<IfLevelSchema>): any {
    const ret = new Map();
    let temp = null;

    levels.forEach( (l: IfLevelSchema) => {
        // Add pages to the return value.
        l.pages.forEach( (p: IfPageBaseSchema) => {

            // Save username
            p.username = l.username; 

            // Add to list.
            if(!ret.has(p.get_solution()) ) {
                ret.set(p.get_solution(), [ p ]);
            } else {
                temp = ret.get(p.get_solution());
                if(typeof temp === 'undefined' ) throw new Error("Invalid key in get_pages_from_levels");
                temp.push( p )
            }
        });
    });

    return ret;
}


function get_level_kcs(levels: Array<IfLevelSchema>): Array<Object> {

    const kcs_questions_as_map = {};
    debugger;
    kcs_questions_as_one_array.forEach( (pages,key) => {
        kcs_questions_as_map[key] = turn_array_into_map(pages, p => p.get_solution() );
    })

    // Now we have a map of levels, with a map of pages.
    // Turn into a pretty array of data.
    const kc_summary_info = [];

    kcs_questions_as_map.forEach( (pages, key) => {
        kc_summary_info.push( {
            solution: key
        })
    })

    return kc_summary_info;
}

// Grab all of the problems inside of this KC, and turn them into 
// an array of objects with the page solution and matching solutions.
function get_kc_problems( pages: IfPageBaseSchema): Array<Object> {
    const problems = [];

    const problem_map = turn_array_into_map( pages, p => p.solution_f );

    problem_map.forEach( (pages) => {
        problems.push( get_kc_problem_answers(pages) )
    })

    return problems;
}



// Goes through all of the given pages and return a summary 
function get_page_user( pages: Array<IfPageBaseSchema>): Array<Object> {
    const user_pages = turn_array_into_map( pages, p => p.username );

    const ret = [];
    user_pages.forEach( (pages, user_id) => {

        ret.push({
            user: '',
            correct: true,
            seconds: 0,
            answers: get_page_history_answers( pages )
        })
    });

    return ret;
}



////   Summaries by user


function create_summaries(levels: Array<IfLevelSchema>): Array<Object>{
    const summaries = levels.map( l => create_level_summary(l) );
    return summaries;
}

// Return a simplified version of the level for use in the chart.
function create_level_summary(level: IfLevelSchema) {
    const formula_pages = level.pages.filter( p => p.type === 'IfPageFormulaSchema');

    return {
        _id: level._id,
        username: level.username,
        pages: formula_pages.map( (p, i) => create_page_summary(p, i)),
        code: level.code, 
        completed: level.completed,
        score: level.completed ? level.get_test_score_as_percent() : null,
        pages_length: level.pages.length,
        classification: level.get_completion_status(),
    }
}

// Create a simple version of the page to display.
function create_page_summary( p: IfPageBaseSchema, i: number): Object {
    const full_history = p.history;
    const attempts = [];

    full_history.forEach( h => {
        // Not al histories have tags.
        if( typeof h.tags === 'undefined') return;

        // If this history doesn't have an INTERMEDIATE, then add it to the list of client attempts.
        if( h.tags.filter( t => t.tag === 'INTERMEDIATE' ).length === 0) {
            attempts.push(h.client_f)
        }
    })

    const s = p.get_time_in_seconds();
    const s_max = Math.min(MAX_VALUE_FOR_CHART, s);

    const solution =  fill_template( p.get_solution(), p.template_values);
    const attempt_string = '"' + attempts.join('", "') + '"';
    const kcs = p.kcs.length === 0 ? '' : ' (Knowledge Areas: ' +p.kcs.join(', ') + ")";

    let caption = `${s} seconds to solve ${solution}, 
        by trying ${attempt_string}
        ${kcs}`;
        

    const ret = {
        sequence_in_level: ''+i,
        caption: caption,
        'Correct': (p.correct && s < MAX_VALUE_FOR_CHART) ? s : 0,
        'Correct, but slow': (p.correct && s >= MAX_VALUE_FOR_CHART) ? MAX_VALUE_FOR_CHART : 0,
        'Incorrect': (!p.correct) ? s_max : 0,
        correct: p.correct,
        type: p.type,
    }

    //console.log(ret);
    return ret;

}