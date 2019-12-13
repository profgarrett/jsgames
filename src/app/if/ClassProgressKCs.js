// @flow
import React from 'react';
import ReactTable from 'react-table';
import { Popover, Table, Modal, Button } from 'react-bootstrap';
import { turn_array_into_map, turn_object_keys_into_array, turn_object_values_into_array } from './../../shared/misc.js';
import { HtmlDiv } from './../components/Misc.js';
import { ResponsiveBar, Bar } from '@nivo/bar'
import { Pie } from '@nivo/pie'
import { Line } from '@nivo/line'
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



    _render_kcs(levels: Array<IfLevelSchema>): Node {
        if(levels.length === 0) return null;

        const level_map = turn_array_into_map( levels, l => l.code );
        const html = [];
        let temp = [];

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

    _render_kc_charts_percentcorrect( correct_percentage: number ): Node {
        const chart_data = [
            {
                id: 'Wrong',
                value: 100 - correct_percentage,
                color: colors['Incorrect'],
            },{
                id: 'Ok',
                value: correct_percentage ,
                color: colors['Correct'],
            }
        ];

        // Build pie
        const pie = <Pie
                data={ chart_data }
                width={ 35 }
                height={ 35 }
                margin={{ top: 0, right: 5, left: 5, bottom: 0 }}
                innerRadius={ 0 }
                padAngle={ 0 }
                tooltip={ o => o.id + ' ' + o.value + '%' }
                colors={ c => c.color }
                enableSlicesLabels={ false }
                enableRadialLabels={ false }
                sliceLabel={function(e){return ''; /*e.id+", "+e.value+"%" */}}
            />;
        
        return pie;

    }


    _render_kc_charts_timeline( answers: Array<IfPageAnswer> ): Node {
        const chart_data = [];
        const INTERVAL = 10;
        const MAX = 120;

        // build data points.
        for(let i=0; i<=MAX; i = i + INTERVAL) {
            chart_data.push({
                x: i,
                y: 0,
            });
        }

        // go through each answer, incrementing as needed.
        answers.forEach( a => {
            for(let i=0; i*INTERVAL <= a.seconds && i<chart_data.length-1; i++) {
                chart_data[i].y = chart_data[i].y + 1;
            }
        });

        // Build chart
        const chart_el = <Line
                data={ [ { id: 'Completion', color: 'black', data: chart_data }] }
                groups={[ 'Correct', 'Incorrect']}
                values='seconds'
                width={ 100 }
                height={ 30 }
                curve='cardinal'
                enableArea={true}
                enablePoints={false}
                enableGridX={false}
                enableGridY={false}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                tooltip={ o => console.log(o) }
                colors={ c => 'black' }
                isInteractive={true}
                axisTop={null}
                axisBottom={null}
                axisLeft={null}
                axisRight={null}
            />;
        
        return chart_el;

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

            // Build summary data for pie.
            data = kc_data.filter( d => d.kcs_as_string === kc )
            if(data.length !== 1) {
                console.log(data);
                throw new Error('Should be only a single kc');
            }

            // Build pie data
            const incorrect = typeof(data[0]['Incorrect']) === 'undefined' ? 0 : data[0]['Incorrect'];
            const correct = typeof(data[0]['Correct']) === 'undefined' ? 0 : data[0]['Correct'];
            const slow = typeof(data[0]['Correct, but slow']) === 'undefined' ? 0 : data[0]['Correct, but slow'];
            const max = (incorrect + correct + slow) / 100;

            let chart_data = [   
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

            // Build pie
            const pie = <Pie
                    data={ chart_data }
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
                />;


            // Build summary data for detail information by solution.
            const kc_answers = answers.filter( a => a.kcs_as_string === kc);
            const answer_keys = get_distinct_values_from_answers(kc_answers, 'solution');
            const answer_map = turn_array_into_map( kc_answers, a => a.solution );

            const questions_el = answer_keys.map( (code,i) => {
                const answers = answer_map.has(code) ? answer_map.get(code) : [];
                const correct = Math.round(100 * answers.reduce( (accum, a) => accum + (a.correct ? 1 : 0), 0 ) / answers.length);
                const seconds = Math.round(answers.reduce( (accum, a) => accum + a.seconds, 0 ) / answers.length);

                return <table key={'classprogresskcsdetailsanswers'+i}>
                        <tbody><tr>
                        <td>{ this._render_kc_charts_percentcorrect( correct )}</td>
                        <td>{ this._render_kc_charts_timeline( answers ) }</td>
                        <td><kbd>{ answers[0].solution_pretty }</kbd></td>
                        </tr></tbody>
                        </table>;
            }); 


            // Return actual elements.
            els.push(<div 
                    key={'classprogresskcpiechart'+level_code+kc} >
                <table style={{ width: '90%' }}>
                    <tbody><tr>
                        <td style={{ width: '200px' }}>
                            { pie }
                        </td>
                        <td>
                            <h5>{ kc_pretty }</h5>
                            { questions_el }
                        </td>
                    </tr></tbody>
                </table>
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
            { this._render_kcs(iflevels) }
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
