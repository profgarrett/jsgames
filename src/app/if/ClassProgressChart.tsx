import React, { ReactElement } from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import { turn_array_into_map, turn_object_keys_into_array } from '../../shared/misc';
import { ResponsiveBar, Bar } from '@nivo/bar'
import { LevelModal } from './LevelModal';
import { IStringIndexJsonObject, prettyDateAsString } from '../components/Misc';
import { IfLevelSchema, IfLevelPagelessSchema, GREEN_GRADE, PASSING_GRADE, DEFAULT_TUTORIAL_LEVEL_LIST } from '../../shared/IfLevelSchema';
import { IfPageBaseSchema, IfPageFormulaSchema } from '../../shared/IfPageSchemas';


//import 'react-table/react-table.css';

import { IfLevels } from '../../shared/IfLevelSchema';
import { DEMO_MODE } from '../configuration';


const colors = {
    Completed: 'rgb(102, 166, 30)',
    "Needs repeating": 'rgb(230, 171, 2)',
    Uncompleted: 'rgb(231, 41, 138)',
}

interface PropsType {
	data: Array<IfLevelPagelessSchema>;
};

interface StateType {
	// what info are we currently viewing in the table below?
	code: string;
    classification: string;
    // are we looking at a particular modal item?
    modal_id: null|string;
}


export class ClassProgressChart extends React.Component<PropsType, StateType> {
	constructor(props: any) {
		super(props);
        this.state = {
            code: '',
            classification: '',
            modal_id: null,
        };
	}

    // Tell the container to load a modal for the given item.
    _on_click_to_show_modal =( modal_id: string ) => {
        this.setState({ modal_id} );
    }

   // Tell the container to load a modal for the given item.
    _on_click_to_hide_modal =( ) => {
        this.setState({ modal_id: null } );
    }


    // Focus on a specific item.
    _on_click_to_show_code = (code: string, classification: string) => {
        this.setState({ code, classification });
    }


    // Convenience function used for rendering a pop-up in the chart.
    _render_bar_popup = ( o: any ): string => {
        return o
            .map( d => d.username )
            .sort( (s1, s2) => s1.toLowerCase() - s2.toLowerCase() )
            .slice(0, 15)
            .join(', ')
            + (o.length > 15 ? ', and...' : '');
    }

    _render_bar = (levels: Array<IfLevelPagelessSchema>): ReactElement => {
        const keys = [ ...DEFAULT_TUTORIAL_LEVEL_LIST];
        const map_classifications = turn_array_into_map( levels, l => l.props.classification );
        const a_classifications = turn_object_keys_into_array(map_classifications);

        // Grab any completed levels that don't show in the default list, and add them.
        // But, only for surveycharts_wu
        const keys_obj = turn_array_into_map( keys, s => s );
        levels.forEach( (l: IfLevelPagelessSchema) => {
            if(!keys_obj.has(l.code) && l.code === 'surveycharts_wu') {
                keys_obj.set(l.code, true);
                keys.push(l.code);
            }
        });

        let c_data : any[] = [];
        let code_levels : any[] = [];
        let completed : any[] = [];
        let uncompleted : any[] = [];
        let needs_repeating : any[] = [];

        // Build by code and completion

        // Break down each item.
        keys.forEach(key => {
            // Build lists for each category.
            code_levels = levels.filter( l => l.code === key ).sort( (a, b) => a.username > b.username ? 1 : -1 );

            // Return object for the chart.
            let o: IStringIndexJsonObject = {};
            o.key = key;

            // Build classification for 'Completed' as a higher priority than all others.
            const completed_users = code_levels.filter( l=> l.props.classification === 'Completed').map( l => l.username );

            a_classifications.forEach( classification => {
                let matching_levels = code_levels.filter( l => l.props.classification === classification );

                if(classification !== 'Completed') {
                    matching_levels = matching_levels
                            .filter( 
                                l => typeof completed_users.find( user => user === l.username ) === 'undefined' )
                }

                o[classification] = matching_levels.length;
                o[classification+'Tooltip'] = classification + ': ' + this._render_bar_popup(matching_levels);
            });

            c_data.push(o);
        });

        // The responsive bar isn't setting width, so grab the width of the screen and use that.
        // Breaks if the screen is resized, but otherwise ok.
        // @TODO: Fix responsive bar for screen refreshes.
        // $FlowFixMe
        const width = document.body.clientWidth;

        return (<div>
            <Bar
            data={ c_data}
            keys={a_classifications}
            indexBy='key'
            height={400}
            width={width*.9}
            
            margin={{ top: 20, right: 25, left: 25, bottom: 50 }}
// Not sure, disabled by NDG 12/13/22
//            colorBy={ c => c.id }
            colors={ c => colors[c.id] }
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
                    this._on_click_to_show_code( ''+o.indexValue, ''+o.id );
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
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 0.5
                        }
                    }
                ]
            }]}
            isInteractive={true}
            animate={true}
            onMouseEnter={(data, event) => {
				// @ts-ignore
                event.target.style.opacity = 0.75;
            }}
            onMouseLeave={(data, event) => {
				// @ts-ignore
				event.target.style.opacity = 1;
            }}
        />
        </div>);
    }
    
    _render_details = (levels: Array<IfLevelPagelessSchema>): ReactElement => {

        if(this.state.code === '') return <div style={{ textAlign:'center'}}><i>Click on a bar to see detailed student progress</i></div>;
        
        const row_data = levels.filter( l => l.code === this.state.code && l.props.classification === this.state.classification  );

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
			accessor: (l: IfLevelPagelessSchema) => l.props.minutes,
			style: {textAlign: 'right'},
			width: 150
		}, {
			id: 'pages',
			Header: 'Pages Completed',
			accessor: l => l.props.pages_length,
			style: {textAlign: 'right'},
			width: 200
		}, {
			id: 'score',
			Header: 'Score',
			accessor: l => !l.completed ? 'Unfinished' : (l.props.test_score_as_percent == null ? '' : l.props.test_score_as_percent + '%'),
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

        const pageSize = 30;

        const cell = (t, c, i) => {
            return c.accessor(t);
        }

        const table = <Table striped bordered hover>
			<thead><tr>{
				columns.map( (c,i) => <th key={'trcode'+i}>{c.id}</th>)
			}</tr>
			</thead>
			<tbody>
			{ row_data.map( 
				(t: any,i) => <tr key={'tr'+i}>
					{
						columns.map( 
							(c,i) => ( <td key={'td'+i}>{ cell(t, c, i)}</td> )
						)
					}
					</tr>) 
			}
			</tbody>
		</Table>;		

        return (<div><h3>Progress for &nbsp;
                    { this.state.classification.toLowerCase() }
                    &nbsp;
                    <kbd style={{ backgroundColor: colors[this.state.classification] }}>{ this.state.code}</kbd></h3>
                    { table }
                    </div>);
    }


	render = (): ReactElement => {
		if(this.props.data.length < 1) return <></>;
        
        //const summaries = create_summaries(this.props.data);
        const modal = this.state.modal_id === null
            ? <></>
            : <LevelModal level={null} level_id={this.state.modal_id} hide={ () => this._on_click_to_hide_modal() } />;
        
		return (<div>
            { modal }
            { this._render_bar(this.props.data) }
            { this._render_details(this.props.data) } 
        </div>);
	}

}
