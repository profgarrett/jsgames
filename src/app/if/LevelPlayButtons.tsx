import React, { ReactElement } from 'react';

import { Button } from 'react-bootstrap';
import { IfPageBaseSchema } from '../../shared/IfPageSchemas';
 

// Create button to validate any formula, parsons, or choice answers.
// This only shows if there are the proper conditions.
const page_validate_button = (page: IfPageBaseSchema, isLoading: boolean, onclick: Function): ReactElement => {
	
	// Don't show 'validate' button if correct is required.
	if(page.correct_required) return <></>;

	// Don't have validate button for all types of pages.
	if(page.type === 'IfPageTextSchema') return <></>;

	// Hide validate for pages that don't show feedback.
	if(!page.show_feedback_on) return <></>;

	// Test pages don't get validate options
	if (page.code ==='test') return <></>;


	//  Button style. If required, primary. Else secondary.
	let button_style = 'primary';
	let button_text = 'Check answer';

	// All pages should be tutorials at this point. 
	if(page.client_has_answered() && !page.correct) {
		// Require a correct answer.
		button_style = 'primary';
	} else if(page.client_has_answered() && page.correct) {
		button_style = 'success'; 
	} else {
		// No answer, or unknown if correct (e.g., on a quiz question)
		button_style = 'primary';
	}
		
	return <Button id='iflevelplayvalidate' 
				variant={button_style}
				disabled={isLoading}
				style={{ marginRight: '5px' }}
				onClick = { (e) => { e.preventDefault(); onclick(); } }
				>{ button_text }</Button>;
};



	// Create the pop-up or pop-over elements
	//_render_page_feedback_inline( /*page: IfPageBaseSchema, button: Node, orientation: string */): Node {
	//	return null;

		/*
		if(!(orientation == 'left' || orientation == 'right')) 
			throw Error('invalid orientation ' + orientation);

		// Don't show feedback.
		if(!this.props.show_feedback) return null;

		// No feedback to show.
		if(typeof page.client_feedback === 'undefined' || 
				page.client_feedback === null ) return null;

		// If feedback, then don't create inline but defer to pop-up.
		if(page.client_feedback.length > 0) return null;

		// $FlowFixMe
		const get_target = (): any => document.getElementById(button.props.id);

		//Return overlay
		return (
			<div>
				<Overlay
					show={true}
					target={ get_target }
					placement={ orientation==='left' ? 'left' : 'right' }
					container={document.body}
					containerPadding={0}
					>
					<Popover 
						id='_render_page_feedback_inline'
						onClick={ this._on_click }
						>
						<Popover.Content>
						{ page.correct ? 
							<div style={{color: 'rgb(60, 118, 61)'}}>Correct!</div> : 
							<div style={{color: 'rgb(169, 68, 66)'}}>Sorry, that's not correct</div>
						}
						{ page.correct ? null : <p>Try asking for a hint!</p> }
						</Popover.Content>
					</Popover>
				</Overlay>
			</div>
		);
		*/
	//}



/*
	Create lower 'next page' & exit buttons.
	The next button respects the time_minimum setting, being disabled until the timer runs from page load
*/
const page_submit_button = (page: IfPageBaseSchema, isLoading: boolean, lastPageI_displayed_at_time: Date, onclick: () => void ): ReactElement => {
	// Use a different color for the submission button if we are test v. tutorial.
	let button_style = 'primary';
	let button_text = 'Next page';
	let button_disabled = false;
	let time_page_displayed_in_ms = new Date().getTime() - lastPageI_displayed_at_time.getTime();

	// Disable button if the user needs to take longer on a problem.
	/*
	console.log({
		loading: this.props.isLoading,
		time_min: page.time_minimum,
		displayed: this.state.lastPageI_displayed_at_time,
		time: new Date().getTime() - this.state.lastPageI_displayed_at_time.getTime()
	});
	*/


	// if a tutorial that allows skipping questions, then change to skip instead of submit.
	if(page.code === 'tutorial' && !page.correct_required && page.type !== 'IfPageTextSchema') {
		if(page.correct) {
			button_text = 'Next page';
			button_style = 'primary';
		} else {
			button_text = 'Skip to next page';
			button_style = 'secondary';
		}
	} 

	// If there is a timer on the page, add it to the button_text.
	if(isLoading) {
		if( page.time_minimum !== null && page.time_minimum > 0) {
			if(page.time_minimum*1000 > time_page_displayed_in_ms) {
				button_disabled = true;
				button_text += ' ('+ Math.ceil( (page.time_minimum*1000 - time_page_displayed_in_ms)/1000) + ')';
			} else {
				button_disabled = false;
			}
		}
	}
			
	// If a test, make sure that they've submitted something.
	if (page.code ==='test' && !page.client_has_answered()) {
		button_disabled = true;
		button_style = 'primary';
	}

	return <Button id='_render_page_submit_button' 
			type='submit' 
			variant={button_style}
			disabled={button_disabled}
			onClick = { (e) => { e.preventDefault(); onclick(); } }
			>{button_text}</Button>;
};

// Create lower 'hint ' button.
const page_hint_button = (page: IfPageBaseSchema, isLoading: boolean, onclick: Function): ReactElement => {
	// Use a different color.
	
	// Hint for formula.
	if(	page.type === 'IfPageFormulaSchema' ) {
		// No hints for test pages.
		if (page.code !== 'tutorial') return <></>;
				
		return <Button id='_render_page_hint_button' 
			style={{ marginRight: '5px' }}
			onClick = { (e) => { e.preventDefault(); onclick(); } }
			variant='warning'
			disabled={isLoading}
			>Get a hint</Button>;
	}

	// No hint for other types of pages.
	return <></>;
}

export { page_validate_button, page_submit_button, page_hint_button }