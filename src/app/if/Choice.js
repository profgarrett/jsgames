// @flow
import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import type { Node } from 'react';
import { IfPageChoiceSchema } from './../../shared/IfPageSchemas';

type PropsType = {
	page: IfPageChoiceSchema,
	editable: boolean,
	handleChange: (any) => void,
	showSolution: boolean
};




/**
	This problem shows a list of items, allowing a user to select any of them.
*/
export default class Choice extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
		(this: any).handleChange = this.handleChange.bind(this);
	}

	handleChange(new_value: string) {
		this.props.handleChange({ client: new_value});	
	} 

	// Build out the table 
	render(): Node {
		const page = this.props.page;

		if(!this.props.editable) {
			let style = 'info';
			if(page.correct !== null) style = page.correct ? 'success' : 'warning';

			if(this.props.showSolution) {
				// Give full list.
				return (
					<div className='list-group'>
						{ page.client_items.map( 
							(ans: string, i: number): Node => 
								<button type="button" 
									key={i}
									className={ 'list-group-item list-group-item-action' + (ans===page.client ? ' active' : '') }
									>{ans}</button>) }
					</div>
				);

			} else {
				// Only show selected.
				return (
					<div className='list-group'>
						<li href='#' variant={style}>{ ''+page.client }</li>
					</div>
				);
			}
		} else {
			return (
				<div className='list-group'>
					{ page.client_items.map( 
						(ans: string, i: number): Node => 
							<button type="button" 
								className={ 'list-group-item list-group-item-action' + (ans===page.client ? ' active' : '') }
								key={i}
								onClick={ (): void => this.handleChange(ans) }
					>{ans}</button>  )}
				</div>
			);
		}
	}
}

