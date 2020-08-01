// @flow
import React, { useState } from 'react';
import { Collapse, Accordion, Card, Popover, Table, Modal, Button } from 'react-bootstrap';
import { turn_array_into_map, turn_object_keys_into_array, turn_object_values_into_array } from './../../shared/misc.js';
import { HtmlDiv } from './../components/Misc.js';
import { ResponsiveBar, Bar } from '@nivo/bar'
import { Pie } from '@nivo/pie'
import { Line } from '@nivo/line'
import { prettyDateAsString } from './../components/Misc';
import { IfLevelSchema, GREEN_GRADE, PASSING_GRADE, DEFAULT_TUTORIAL_LEVEL_LIST } from './../../shared/IfLevelSchema';
import { IfPageAnswer, IfPageBaseSchema, IfPageFormulaSchema } from './../../shared/IfPageSchemas';
import { fill_template } from './../../shared/template.js';
import { LevelModal } from './LevelModal';
import type { Node } from 'react';

//import 'react-table/react-table.css';

import { IfLevels } from './../../shared/IfLevelSchema';
import { DEMO_MODE } from './../../server/secret';


type PropsType = {
	answers: Array<IfPageAnswer>,
};

type StateType = {
    level_id: ?string,
    sequence_in_level: ?number,
};


const colors = {
    'Correct': 'rgb(102, 166, 30)',
    'Correct, but slow': 'rgb(230, 171, 2)',
    'Incorrect': 'rgb(231, 41, 138)',
}


export class KCCharts extends React.Component<PropsType, StateType> {
	constructor(props: any) {
		super(props);
        this.state = {
            level_id: null,
            sequence_in_level: null,
        };
        (this: any).show_modal = this.show_modal.bind(this);
        (this: any).hide_modal = this.hide_modal.bind(this);
	}

    // Show a specific level and sequence.
    show_modal( level_id: string, sequence_in_level: number ) {
        this.setState({ level_id, sequence_in_level });
    }

    // Show a specific level and sequence.
    hide_modal( ) {
        this.setState({ level_id: null, sequence_in_level: null });
    }


    // Bring back the charts for each KC component, split by level.code.
    _render_kcs(answers: Array<IfPageAnswer>): Node {
        if(answers.length === 0) return null;

        const answer_map = turn_array_into_map( answers, a => a.level_code );
        const html = [];

        IfLevels.forEach( level => {
            // See if we have matching answers for this particular level. If not, return null.
            if(!answer_map.has(level.code) ) return;

            // Add title for level.
            html.push(<h3 key={'renderkcslevel'+level.code} style={{ clear: 'both' }}>{ level.title }</h3>);

            // Add each KC as a separate chart.
            let answers = answer_map.get(level.code)
            if(typeof answers === 'undefined' || answers === null ) {
                throw new Error('Missing answers.code for ' + level.code);
            } else {
                // Multiple elements can be returned. Add each to the array.
                this._render_kc_charts( answers ).forEach( el => html.push(el) );
            }
        });

        if(this.state.level_id !== null && this.state.sequence_in_level !== null) {
            html.push(<LevelModal level_id={this.state.level_id} sequence_in_level={this.state.sequence_in_level} hide={ () => this.hide_modal() } />);
        }

        return html;
    }


    // Return a simple pie chart for the percentage correct number given.
    _render_kc_charts_percentcorrect( data: { Correct: number, Incorrect: number, 'Correct, but slow': number } ): Node {
        const sum = data.Correct+data.Incorrect+data['Correct, but slow'];
        const chart_data = [
            {
                id: 'Incorrect',
                value: Math.round( 100*data.Incorrect / sum ),
                color: colors['Incorrect'],
            },{
                id: 'Correct',
                value: Math.round( 100*data.Correct / sum ),
                color: colors['Correct'],
            },{
                id: 'Slow',
                value: Math.round( 100*data['Correct, but slow'] / sum ),
                color: colors['Correct, but slow'],
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
                animate={false}
            />;
        
        return pie;

    }


    // Build a timeline chart for a single set of answers.
    _render_kc_charts_timeline( answers: Array<IfPageAnswer> ): Node {
        const chart_data = [];
        const INTERVAL = 10;
        const MAX = 120;

        // build data points with an empty set of data.
        for(let i=0; i<=MAX; i = i + INTERVAL) {
            chart_data.push({
                x: i,
                y: 0,
            });
        }

        // go through each answer, incrementing data points as needed.
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
                tooltip={ o => 
                        <div style={{ backgroundColor: 'white', padding: '10px' }}>
                            {o.point.data.y + ' student' + (o.point.data.y === 1 ? ' was' : 's were' ) + 
                            ' still working after ' + o.point.data.x + ' seconds'}
                        </div> } 
                colors={ c => 'black' }
                isInteractive={true}
                useMesh={true}
                axisTop={null}
                axisBottom={null}
                axisLeft={null}
                axisRight={null}
                animate={false}
            />;
        
        return chart_el;

    }

    // Build details for a given answer in a collapsible panel.
    _render_kc_answer_expandable( answers: Array<IfPageAnswer>): Node {
        const sorted_answers = answers.sort( (a: IfPageAnswer,b: IfPageAnswer) => b.seconds - a.seconds )
        const body = 
            <Table>
                <thead>
                <tr>
                <td>Username</td>
                <td>Seconds</td>
                <td>Solution</td>
                <td>Answers</td>
                <td>View</td>
                </tr>
                </thead>
                <tbody>
                {
                sorted_answers.map( a => <tr>
                        <td>{a.username}</td>
                        <td>{a.seconds}</td>
                        <td>{ a.solution_pretty }</td>
                        <td>{ a.answers.map( a => <p>{ a }</p> ) }</td>
                        <td><Button onClick={ () => this.show_modal( a.level_id, a.sequence_in_level ) }>View</Button></td>
                    </tr> )
                }
                </tbody>
            </Table>;

        return <Card>
                <Expandable title={ answers[0].page_code + ': ' + answers[0].solution_pretty } body={ body} />
            </Card>;
    }

    // Return an array of charts, one per KC in the passed levels array.
    // Note, only a single .code value should be present.
    _render_kc_charts( answers: Array<IfPageAnswer> ): Array<Node> {
        const els = [];

        const kc_summaries = get_classification_by_kcs( answers );
        const sorted_kc_summaries = [...kc_summaries].sort( 
                    (a, b) => a.kcs_as_string > b.kcs_as_string ? 1 : -1
                );

        // [ { kcs_as_string, Correct: 1, 'Incorrect': n, ...}]
        const style = { verticalAlign: 'top'};

        sorted_kc_summaries.forEach( data => {
            const level_code = answers[0].level_code; // assumes only a single level has been passed.
            const kc = data.kcs_as_string;
            const kc_pretty = kc === '' ? 'General' : kc.split(',').join(', ').replace( /kc\_/g, '').replace(/\_/g, ' ');


            // Build pie data
            const incorrect = typeof(data['Incorrect']) === 'undefined' ? 0 : data['Incorrect'];
            const correct = typeof(data['Correct']) === 'undefined' ? 0 : data['Correct'];
            const slow = typeof(data['Correct, but slow']) === 'undefined' ? 0 : data['Correct, but slow'];
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

            // Build big KC pie
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
                    animate={false}
                />;


            // Build summary data for detail information by solution.
            const kc_answers = answers
                .filter( a => a.kcs_as_string === kc)
            
            const answer_map = turn_array_into_map( kc_answers, a => a.page_code + ': ' + a.solution );
            const sorted_map = new Map([...answer_map].sort( 
                    (a,b) => a[0]  > b[0] ? -1 : 1));
            
            const answer_els = [];

            sorted_map.forEach( (answers,i) => {
                
                // Summary stats
                const classifications = {
                    'Correct': answers.filter( a => a.classification === 'Correct').length,
                    'Correct, but slow': answers.filter( a => a.classification === 'Correct, but slow').length,
                    'Incorrect': answers.filter( a => a.classification === 'Incorrect').length,
                };
                
                const seconds = Math.round(answers.reduce( (accum, a) => accum + a.seconds, 0 ) / answers.length);

                answer_els.push(<table key={'classprogresskcsdetailsanswers'+level_code+'0'+i}>
                        <tbody><tr>
                        <td style={style}>{ this._render_kc_charts_percentcorrect( classifications )}</td>
                        <td style={style}>{ this._render_kc_charts_timeline( answers ) }</td>
                        <td style={style}>{ this._render_kc_answer_expandable( answers ) }</td>
                        <td style={ {paddingLeft: 5, color: 'lightgray', ...style}} >{ answers.length } responses</td> 
                        
                        </tr></tbody>
                </table>);
            }); 


            // Return actual elements.
            els.push(<div 
                    key={'classprogresskcpiechart'+level_code + '0'+kc} >
                <table style={{ width: '90%' }}>
                    <tbody><tr>
                        <td style={{ width: '200px', verticalAlign: 'top' }}>
                            { pie }
                        </td>
                        <td>
                            <h5>{ kc_pretty }</h5>
                            { answer_els }
                        </td>
                    </tr></tbody>
                </table>
                </div>);
                
        });

        return els;
    }

    render(): Node {
        if(this.props.answers.length === 0) return null;

        const answers = this.props.answers.filter( 
                answer => !(
                    answer.level_code === 'tutorial'
                    || answer.level_code.search('survey') !== -1
                    || answer.level_code.search('review') !== -1 )
            );


        return this._render_kcs(answers);
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

/*
    Take in an array of answers and return an array with each answer and classification.
    []
*/
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




function Expandable(props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <kbd
        onClick={() => setOpen(!open)}
        aria-controls="example-collapse-text"
        aria-expanded={open}
      >
        {props.title}
      </kbd>
      <Collapse in={open}>
        <div id="example-collapse-text" onClick={ ()=> setOpen(!open)}>
            { props.body}
            <br/>
        </div>
      </Collapse>
    </div>
  );
}
