import React, { ReactElement } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { IfPageChoiceSchema } from './../../../shared/IfPageSchemas';
import { IfLevelSchema } from '../../../shared/IfLevelSchema';
import type { IStringIndexJsonObject } from '../../components/Misc';

interface PropsType {
	page: IfPageChoiceSchema;
	editable: boolean;
	readonly: boolean;
	onChange: (json: IStringIndexJsonObject) => void;
	show_solution?: boolean;
}


/**
	This problem shows a list of items, allowing a user to select any of them.
*/
export default class Choice extends React.Component<PropsType> {

	handleChange = (new_value: string) => {
		if(this.props.readonly) return;
		this.props.onChange({ client: new_value});	
	} 

	// Build out the table 
	render = (): ReactElement => {
		const page = this.props.page;
		
		
		if(!this.props.editable) {
			let style = 'info';
			if(page.correct !== null) style = page.correct ? 'success' : 'warning';

			if(this.props.show_solution) {
				// Give full list.
				return (
					<ListGroup>
						{ page.client_items.map( 
							(ans: string, i: number): ReactElement => 
								<button type="button" 
									key={i}
									className={ 'list-group-item list-group-item-action' + (ans===page.client ? ' active' : '') }
									>{ans}</button>) }
					</ListGroup>
				);

			} else {
				// Only show selected.
				return (
					<ListGroup className='list-group'>
						<ListGroup.Item variant={style}>{ ''+page.client }</ListGroup.Item>
					</ListGroup>
				);
			}
		} else {
			return (
				<ListGroup>
					{ page.client_items.map( 
						(ans: string, i: number): ReactElement => 
							<button type="button" 
								className={ 'list-group-item list-group-item-action' + (ans===page.client ? ' active' : '') }
								key={i}
								onClick={ (): void => this.handleChange(ans) }
					>{ans}</button>  )}
				</ListGroup>
			);
		}
	}
}

