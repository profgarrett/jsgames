// @flow
import React from 'react';
import ReactTable from 'react-table';
import { Table, Modal, Button } from 'react-bootstrap';

import { IfLevelSchema } from './../../shared/IfLevelSchema';

import type { Node } from 'react';

import 'react-table/react-table.css';

import { IfLevels } from './../../shared/IfLevelSchema';
import { DEMO_MODE } from './../../server/secret';

/*
    Data: 
    [
        {   username: '',
            levels: [
                {   code: '',
                    max: 0,
                },
                ...
            ]
        }
    ]
*/
type PropsType = {
	data: Array<any>
};

type StateType = {
	// Store feedback to be displayed.
	feedback: string,
};



export class ClassProgress extends React.Component<PropsType, StateType> {
	constructor(props: any) {
		super(props);
        this.state = {
            feedback: ''
        };
        (this: any)._on_click = this._on_click.bind(this);
	}

    // Dismiss feedback.
    _on_click() {
        this.setState({ feedback: '' });
    }

	// Backdrop that allow us to click anywhere to dismiss pop-up or inline pop-up.
	_render_fullpage_invisible_div(): Node {
		if(!this.state.feedback === '') return null;

		return <div style={{
					position: 'fixed',
					top: 0, left: 0, right: 0, bottom: 0,
					zIndex: 100000,
					cursor: 'pointer' // see https://github.com/facebook/react/issues/1169
					}}
					onClick={ this._on_click }
					></div>;
	}

	/** 
		We have one or more specific items of feedback to tell the user.
		Return a full-screen pop-up 
	 */
	_render_page_feedback_popup(): Node {
		if( !this.state.feedback === '') return null;

		// Return full-screen feedback.
		return (<Modal onHide={this._on_click}>
					<Modal.Header closeButton>
						<Modal.Title>Description</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{ this.state.feedback }
					</Modal.Body>
					<Modal.Footer>
						<Button variant='primary' size='sm' onClick={this._on_click}>close</Button>
					</Modal.Footer>
				</Modal>);
	}

    // Get a list of levels
    _get_level_summaries(): Object {
        const levels = {};
        
        this.props.data.forEach( d => {
            d.levels.forEach(l => {
                // Create level?
                if(typeof levels[l.code] === 'undefined') {
                    levels[l.code] = {
                        code: l.code,
                        n: 0,
                        completed: 0,
                        uncompleted: 0,
                        passed: 0,
                        failed: 0,
                    };
                }

                // Add to completed.
                levels[l.code].n++;

                // Passed/Failed
                if(l.max > 70) {
                    levels[l.code].passed++;
                } else {
                    levels[l.code].failed++;
                }

                // Completed.
                if(l.completed) {
                    levels[l.code].completed++;
                } else {
                    levels[l.code].uncompleted++;
                }
            })
        });

        return levels;
    }



	/**
		Return historical information
	*/
	_render_grades_table(): Node {
        const html = [];
        const html_level_trs = [];
        const level_summaries = this._get_level_summaries();

		// Create a list of distinct levels
		// Don't include the waivers.
		const tutorials = IfLevels.map( l => l.code ).filter( s => s.substr(0,13) !== 'surveywaiver_' );
        
        tutorials.forEach( (t, i) => {
            const summary = typeof level_summaries[t] === 'undefined' 
                ? { code: t, passed: 0, n: 0, uncompleted: 0 }
                : level_summaries[t];

            html_level_trs.push(<tr key={'rendergradestable'+i}>
                    <td>{ summary.code }</td>
                    <td>{ summary.n }</td>
                    <td>{ summary.uncompleted }</td>
                    <td>{ summary.n > 0 
                            ? Math.round(100*summary.passed / summary.n) + '%'
                            : '' }</td>
                </tr>);
        });

        const html_level = (<Table>
            <thead>
                <tr>
                    <th>Tutorial</th>
                    <th>Attempts</th>
                    <th>Uncompleted</th>
                    <th>Pass Rate</th>
                </tr>
            </thead>
            <tbody>
                { html_level_trs }
            </tbody>
        </Table>);


		return (<div>
				{ html_level }
				</div>);
	}



	render(): Node {
		if(this.props.data.length < 1) 
			return <div/>;

		return this._render_grades_table();
	}

}