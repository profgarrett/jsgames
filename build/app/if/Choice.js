//      
import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
                                  
import { IfPageChoiceSchema } from './../../shared/IfPage';

                  
                          
                   
                             
                      
  




/**
	This problem shows a list of items, allowing a user to select any of them.
*/
export default class Choice extends React.Component            {
	constructor(props     ) {
		super(props);
		(this     ).handleChange = this.handleChange.bind(this);
	}

	handleChange(new_value        ) {
		this.props.handleChange({ client: new_value});	
	} 

	// Build out the table 
	render()       {
		const page = this.props.page;

		if(!this.props.editable) {
			let style = 'info';
			if(page.correct !== null) style = page.correct ? 'success' : 'warning';

			if(this.props.showSolution) {
				// Give full list.
				return (
					<div className='list-group'>
						{ page.client_items.map( 
							(ans        , i        )       => 
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
						(ans        , i        )       => 
							<button type="button" 
								className={ 'list-group-item list-group-item-action' + (ans===page.client ? ' active' : '') }
								key={i}
								onClick={ ()       => this.handleChange(ans) }
					>{ans}</button>  )}
				</div>
			);
		}
	}
}

