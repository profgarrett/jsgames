import React, { ReactElement } from 'react';

import { Button, Modal } from 'react-bootstrap';
import CSS from 'csstype';

import { fill_template } from '../../shared/template';
import { IfPageBaseSchema } from '../../shared/IfPageSchemas';

import { TIME_BEFORE_SHOWING_SOLUTION, MINIMUM_TIME_BETWEEN_SUBMIT_EVENTS } from './../configuration.js'; 


/** 
 We have one or more specific items of feedback to tell the user.
 Return a full-screen pop-up IF props.show_feedback


 This has several different possible display states.
 
 page.complete 
     page.correct - we have the right answer.
     !page.correct - wrong
 page.complete 
     page.correct - good job
     !page.correct
         Feedback.length > 0
             Solution
             !Solution
         !Feedback
             Solution
             !Solution
*/
interface IProps {
    page: IfPageBaseSchema;
	onHideModal: Function;
};

export default class LevelPlayFeedbackModal extends React.Component<IProps> {

	render = (): ReactElement => {
		const page = this.props.page;
		const feedback = typeof page.client_feedback === 'undefined' || page.client_feedback === null 
				? [] 
				: page.client_feedback;
		
		let body: ReactElement[] = [];
		let typedPage: IfPageBaseSchema;


		if(page.completed) {
			if(page.correct) {
				// Complete & right
				body.push(<div>Great job! Go onto the next problem.</div>);
			} else {
				// Complete but wrong
				body.push(<div>Sorry, but that is not the correct answer.</div>);

				if(	page.type === 'IfPageFormulaSchema' || 
					page.type === 'IfPagePredictFormulaSchema' || 
					page.type === 'IfPageHarsonsSchema' ) {
					// Formula page.
					typedPage = page.toIfPageFormulaSchema();

					body.push(<div>The right answer was <code>{ fill_template(typedPage.solution_f, typedPage.template_values)}</code></div>);
				}

			}

		} else if(!page.completed){
			if(page.correct) {
				// Correct, but not submitted.
				body.push(<div>Your answer is correct! Click 
					the&nbsp; <kbd>next page</kbd> &nbsp;button to submit it.</div>);

			} else {
				// Wrong, but not submitted.
				if(	page.type === 'IfPageFormulaSchema' || 
					page.type === 'IfPagePredictFormulaSchema' ||
					page.type === 'IfPageHarsonsSchema') {

					// Formula page
					typedPage = page.toIfPageFormulaSchema();
					
					// Item feedback
					if( feedback.length > 0) {
						// Add feedback to the page.
						body.push( <ul>
							{ feedback.map( (f: string, i: number): ReactElement => <li key={i}>{f}</li>) }
						</ul>);
					}

					// Show correct solution
					if(typedPage.solution_f !== null && typedPage.solution_f.length > 0) {

						// Should we show the solution to the user?
						if(feedback.length > 0) {
							// No, still feedback.
							body.push(<div>Try to resolve the problems above. Once you do that, and if you&apos;re still stuck, you can come back here for the solution</div>);

						} else if ( typedPage.correct ) {
							body.push(<div>Correct answer!</div>);
						
						} else if( typedPage.get_time_in_seconds_since_first_history() < TIME_BEFORE_SHOWING_SOLUTION ) {
							// No, haven't  tried for at least 3 minutes.
							//console.log(typedPage.get_time_in_seconds());
							body.push(<div>Sorry, but that answer is not correct.<br/><br/>
								You have spent around {typedPage.get_time_in_seconds_since_first_history()} seconds
								trying to solve the problem on your own. Please try for 
								at least three minutes. You can then 
								come back here for the solution.</div>);
						
						} else {
							// Yes, give the solution.
							body.push(<div>Sorry, but your solution is not correct. The correct answer is &nbsp;
								<code>{ fill_template(typedPage.solution_f, typedPage.template_values)}</code>
								</div>);

						}
					}

				} else {
					// Non formula page.
					body.push(<div>Sorry, but that is not the correct answer. Please try again</div>);
				}
			}
		}

		const styleFullPageDiv: CSS.Properties = {
			position: 'fixed',
			top: 0, left: 0, right: 0, bottom: 0,
			zIndex: 100000,
			cursor: 'pointer' // see https://github.com/facebook/react/issues/1169
			
		}

		// Return full-screen feedback.
//style = {styleFullPageDiv} 
		return (<div id='LevelPlayFeedbackModal'
						style = {styleFullPageDiv}
						onKeyDown = { (e) => { e.preventDefault; this.props.onHideModal(); } }
						onClick = { (e) => { e.preventDefault; this.props.onHideModal();  }  }
					>
					<Modal show={true}>
						<Modal.Header closeButton>
							<Modal.Title>Problem Feedback</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							{ body.map( (d,i) => <div key={'pagefeedbackmodal'+i}>{d}</div>) }
						</Modal.Body>
						<Modal.Footer>
							Press <kbd>space</kbd> or 
							<Button variant='primary' size='sm'>click</Button>
						</Modal.Footer>
					</Modal>
				</div>);
	}
}

