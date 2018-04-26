// @flow
import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import type { Node } from 'react';

import type { ChoicePageType } from './IfTypes';


type PropsType = {
	page: ChoicePageType,
	editable: boolean,
	handleChange: (any) => void,
	showSolution: boolean
};


/**
	A Parsons problem shows a list, allowing a user to drag and drop
	any elements from a potential_items into user_items.
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
					<ListGroup>
						{ page.client_items.map( 
							(ans: string, i: number): Node => 
								<ListGroupItem 
									key={i}
									active={ ans === page.client }
									>{ans}</ListGroupItem>) }
					</ListGroup>
				);

			} else {
				// Only show selected.
				return (
					<ListGroup>
						<ListGroupItem bsStyle={style}>{ page.client }</ListGroupItem>
					</ListGroup>
				);
			}
		} else {
			return (
				<ListGroup>
					{ page.client_items.map( 
						(ans: string, i: number): Node => 
							<ListGroupItem 
								key={i}
								active={ ans === page.client }
								onClick={ (): void => this.handleChange(ans) }
								>{ans}</ListGroupItem>) }
				</ListGroup>
			);
		}
	}
}
