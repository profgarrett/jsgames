// @flow
import React from 'react';
import ReactTable from 'react-table';
import { Table, Modal, Button } from 'react-bootstrap';
import { turn_array_into_map } from './../../shared/misc.js';
import { ResponsiveBar, Bar } from '@nivo/bar'
import IfLevelScore from './IfLevelScore';
import { prettyDateAsString } from './../components/Misc';
import { IfLevelSchema, GREEN_GRADE, PASSING_GRADE, DEFAULT_TUTORIAL_LEVEL_LIST } from './../../shared/IfLevelSchema';
import { IfPageBaseSchema, IfPageFormulaSchema } from './../../shared/IfPageSchemas';

import type { Node } from 'react';

import 'react-table/react-table.css';

import { IfLevels } from './../../shared/IfLevelSchema';
import { DEMO_MODE } from './../../server/secret';


type PropsType = {
	data: Array<any>,
    show_modal: function,
};

type StateType = {
	// what info are we currently viewing in the table below?
	code: string,
    classification: string,
};


export class ClassProgressChart extends React.Component<PropsType, StateType> {
	constructor(props: any) {
		super(props);
        this.state = {
            code: '',
            classification: '',
        };
        (this: any)._on_click_to_show_code = this._on_click_to_show_code.bind(this);
        (this: any)._on_click_to_show_modal = this._on_click_to_show_modal.bind(this);
	}

    // Tell the container to load a modal for the given item.
    _on_click_to_show_modal( code: string ) {
        this.props.show_modal( code );
    }

    // Focus on a specific item.
    _on_click_to_show_code(code: string, classification: string) {
        this.setState({ code, classification });
    }


    // Convenience function used for rendering a pop-up in the chart.
    _render_bar_popup( o: any ): string {
        return o
            .map( d => d.username )
            .sort( (s1, s2) => s1.toLowerCase() - s2.toLowerCase() )
            .slice(0, 15)
            .join(', ')
            + (o.length > 15 ? ', and...' : '');
    }

    _render_bar(data: Array<Object>): Node {
        const keys = DEFAULT_TUTORIAL_LEVEL_LIST;
        let c_data = [];
        let code_levels = [];
        let completed = [];
        let uncompleted = [];
        let needs_repeating = [];

        if( true ) {
            // Build by code and completion

            // Break down each item.
            keys.forEach(key => {
                // Build lists for each category.
                code_levels = data.filter( d => d.code === key );

                completed = code_levels.filter( 
                        d => d.completed && d.score >= PASSING_GRADE );
                needs_repeating = code_levels.filter( 
                        d => d.completed && d.score < PASSING_GRADE)
                uncompleted = code_levels.filter( 
                        d => !d.completed );
                

                let o = {
                    key: key,

                    Completed: completed.length,
                    CompletedTooltip: 'Completed: '+this._render_bar_popup(completed),

                    "Needs repeating": needs_repeating.length,
                    "Needs repeatingTooltip": 'Completed, but with a low grade: ' + this._render_bar_popup(needs_repeating),

                    Uncompleted: uncompleted.length,
                    UncompletedTooltip: 'Incomplete: ' + this._render_bar_popup(uncompleted),
                };
                c_data.push(o);
            });

        }



        const colors = {
            Completed: 'rgb(102, 166, 30)',
            "Needs repeating": 'rgb(230, 171, 2)',
            Uncompleted: 'rgb(231, 41, 138)',
        }

        // $FlowFixMe
        const width = document.body.clientWidth;

        return (<div>
            <Bar
            data={ c_data}
            keys={['Needs repeating', 'Uncompleted', 'Completed', ]}
            indexBy='key'
            height={400}
            width={width*.9}
            
            margin={{ top: 20, right: 25, left: 25, bottom: 50 }}
            colorBy={ c => c.id }
            colors={ c => colors[c.id] }
            axisBottom={{      }}
            tooltip={
                o => {
                    // Show a tooltip with the people.
                    if(typeof o.data[o.id+'Tooltip'] !== 'undefined' ) {
                        return <div>{o.data[o.id+'Tooltip']}</div>
                    } else {
                        return <div>{o.value}</div>;
                    }
                    
                }
            }
            onClick={
                o => { // Show a focus on that item.
                    this._on_click_to_show_code( o.indexValue, o.id );
                }
            }
            legends={[{
                dataFrom: 'keys',
                anchor: 'top-right',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 30,
                itemDirection: 'left-to-right',
                symbolSize: 20,
            }]}
            isInteractive={true}
            animate={true}
            
        />
        </div>);
    }
    
    _render_details(summaries: Array<Object>): Node {

        if(this.state.code === '') return <div style={{ textAlign:'center'}}><i>Click on a bar to see detailed student progress</i></div>;
        
        const row_data = summaries.filter( s => s.code === this.state.code && s.classification === this.state.classification  );
        console.log(row_data);

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => DEMO_MODE ? '*****' : l.username,
			width: 250
		}, {
			id: 'updated',
			Header: 'Last Update',
			accessor: l => prettyDateAsString(l.updated),
			style: {textAlign: 'right'},
			width: 120
        },{
			id: 'minutes',
			Header: 'Time (minutes)',
			accessor: l => l.minutes,
			style: {textAlign: 'right'},
			width: 150
		}, {
			id: 'pages',
			Header: 'Pages Completed',
			accessor: l => l.pages_length,
			style: {textAlign: 'right'},
			width: 200
		}, {
			id: 'score',
			Header: 'Score',
			accessor: l => !l.completed ? 'Unfinished' : (l.score == null ? '' : l.score + '%'),
			style: {textAlign: 'right'},
			width: 120
		}, {
			id: 'view',
			Header: '',
			accessor: l => <Button onClick={ () => this._on_click_to_show_modal(l._id) }>View</Button>,
			width: 120,
            style: {textAlign: 'center'},
		},
        ];

        const pageSize = Math.min(30, row_data.length+1);

        return (<div><h3>Progress for <kbd>{ this.state.classification.toLowerCase() }</kbd> <kbd>{ this.state.code}</kbd></h3><ReactTable
						data={row_data} 
						filterable={true}
						columns={columns}
						defaultPageSize={pageSize}
                /></div>);
    }

	render(): Node {
		if(this.props.data.length < 1) return null;
        
        const summaries = create_summaries(this.props.data);

		return (<div>
            { this._render_bar(summaries) }
            { this._render_details(summaries) } 
        </div>);
	}

}


function create_summaries(levels: Array<Object>): Array<Object>{
    const iflevels = levels.map( l => new IfLevelSchema(l) );
    const summaries = iflevels.map( l => create_summary(l) );
    const ret = [];

    // See if there are any dups, meaning that a student has retaken a level.

    // Organize into a map of users.
    const users = turn_array_into_map(summaries, l => l.username.toLowerCase().trim() );

    // Organize each user into a map of levels.
    const user_levels = {};
    users.forEach( (levels, user) => {
        // Sort into buckets by code.
        user_levels[user] = turn_array_into_map(levels, l => l.code);

        // Take the "best" item out of each bucket.
        user_levels[user].forEach( (levels, code) => {
            // Completed.
            if( levels.filter(l => l.classification === 'Completed' ).length > 0) {
                //user_levels[user][code] = [ levels.filter(l => l.completed && l.score >= PASSING_GRADE )[0] ]
                ret.push(levels.filter(l => l.completed && l.score >= PASSING_GRADE )[0])
                return;
            }

            // In progress.
            if( levels.filter(l => l.classification === 'Uncompleted' ).length > 0) {
                //user_levels[user][code] = [ levels.filter(l => !l.completed )[0] ]
                ret.push( levels.filter(l => !l.completed )[0] )
                return;
            }

            // Completed, but low grade.
            if( levels.filter(l => l.classification === 'Needs repeating' ).length > 0) {
                //user_levels[user][code] = [ levels.filter(l => l.completed && l.score < PASSING_GRADE )[0] ]
                ret.push(levels.filter(l => l.completed && l.score < PASSING_GRADE )[0])
                return;
            }

            debugger; // error! Shouldn't get here.
        });

    });

    return ret;
}




function classify(level: IfLevelSchema): string {
    const score_nullable = level.completed ? level.get_test_score_as_percent() : null;
    
    if( !level.completed ) return 'Uncompleted';

    if( level.completed && score_nullable !== null && score_nullable >= PASSING_GRADE) return 'Completed';

    if( level.completed && score_nullable !== null && score_nullable < PASSING_GRADE ) return 'Needs repeating';


    throw new Error('Invalid type! classify in ClassProgressChart');
}

function create_summary(level: IfLevelSchema): Object {
    const ret = {
        _id: level._id,
        username: level.username,
        created: level.created,
        updated: level.updated,
        minutes: level.get_time_in_minutes(),
        code: level.code, 
        completed: level.completed,
        score: level.completed ? level.get_test_score_as_percent() : null,
        pages_length: level.pages.length,
        classification: classify(level)
    }

    return ret;
}