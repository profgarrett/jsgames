import React, { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { turn_array_into_map, turn_object_keys_into_array } from '../../shared/misc';
import {  Bar } from '@nivo/bar'
import { LevelModal } from './LevelModal';
import { IStringIndexJsonObject, prettyDateAsString } from '../components/Misc';
import { IfLevelPagelessSchema, DEFAULT_TUTORIAL_LEVEL_LIST } from '../../shared/IfLevelSchema';
import { StyledReactTable } from '../components/StyledReactTable';


import { DEMO_MODE } from '../configuration';


const colors = {
    Completed: 'rgb(102, 166, 30)',
    Fail: 'rgb(230, 171, 2)',
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

    _render_bar = (levels: Array<IfLevelPagelessSchema>): ReactElement => {
        let keys = [ ...DEFAULT_TUTORIAL_LEVEL_LIST].reverse();
        const map_classifications = turn_array_into_map( levels, l => l.props.classification );
        let a_classifications = turn_object_keys_into_array(map_classifications);

        let c_data : any[] = [];
        let code_levels : any[] = [];

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
                //o[classification+'Tooltip'] = classification + ': ' + this._render_bar_popup(matching_levels);
            });

            c_data.push(o);
        });

		// Switch text from 'Needs repeating' to 'Fail'
		let c_data2 = c_data.map( (c) => {
			c['Fail'] = c['Needs repeating']; 
			delete c['Needs repeating']; 
			return c; 
		});
		a_classifications = ['Completed', 'Fail', 'Uncompleted'];

		
		// Remove all items with a value of zero
		c_data2 = c_data2.map( o => {
			let new_o = {...o};
			if(new_o.Completed == 0) delete new_o.Completed;
			if(new_o.Fail == 0) delete new_o.Fail;
			if(new_o.Uncompleted == 0) delete new_o.Uncompleted;
			return new_o;
		});

        // The responsive bar isn't setting width, so grab the width of the screen and use that.
        // Breaks if the screen is resized, but otherwise ok.
        // $FlowFixMe
        const width = document.body.clientWidth * 0.8;

        return <Bar
            data={ c_data2}
			layout='horizontal'
            keys={a_classifications}
            indexBy='key'
            height={600}
            width={width}
            margin={{ top: 25, right: 25, left: 150, bottom: 25 }}
            colors={ c => colors[c.id] }
            onClick={
                o => { // Show a focus on that item.
                    this._on_click_to_show_code( ''+o.indexValue, ''+o.id );
                }
            }
            legends={[{
                dataFrom: 'keys',
                anchor: 'bottom-right',
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
        />;
    }
    
    _render_details = (levels: Array<IfLevelPagelessSchema>): ReactElement => {

        if(this.state.code === '') return <div style={{ textAlign:'center'}}><i>Click on a bar to see detailed student progress</i></div>;
        
		// Turn uncompleted into Fail
		const classification = this.state.classification == 'Fail' ? 'Needs repeating' : this.state.classification;

        const row_data = levels.filter( l => l.code === this.state.code && l.props.classification === classification  );

		const columns = [
			{
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

        //const pageSize = 30;

        //const cell = (t, c, i) => {
         //   return c.accessor(t);
        //}

		const table = <StyledReactTable 
					data={row_data}
					columns={columns} 
				/>
			
		/*
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
		*/

        return (<div style={{ marginTop: 10 }}><h3>Progress for&nbsp;{ this.state.classification.toLowerCase() }
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
