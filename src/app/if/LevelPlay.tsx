import React, { ReactElement } from 'react';

import { Button, Table, Card, Popover, OverlayTrigger, Modal } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';

import CSS from 'csstype';

import { MINIMUM_TIME_BETWEEN_SUBMIT_EVENTS } from './../configuration.js'; 
import {  IStringIndexJsonObject, replaceClientFSmartQuotes } from '../components/Misc';
import { IfLevelSchema } from '../../shared/IfLevelSchema';

import LevelPlayFeedbackModal from './LevelPlayFeedbackModal';
import { page_validate_button, page_submit_button, page_hint_button } from './LevelPlayButtons';
import { render_page_lead, render_timer, render_chart, render_exercise_panel } from './LevelPlayRenders';
import level_play_score from './LevelPlayScore';


const leftTdStyle: CSS.Properties = {
	verticalAlign: 'middle',
	borderWidth: '0px',
};
const rightTdStyle: CSS.Properties = {
	...leftTdStyle,
	textAlign: 'right'
};
const titleTdStyle: CSS.Properties = {  /* use a title td to center vertically */
	...leftTdStyle,
	width: '1px',  /* set to 1 to minimize width, based on word */
	paddingRight: '0px',
	paddingLeft: '15px',
};




type PropsType = {
	level: IfLevelSchema,
	selected_page_index: number,
	onChange: ( json: IStringIndexJsonObject ) => void,
	onNext: () => void,
	onValidate: Function,
	onHideFeedback: Function,
	show_feedback: boolean,
	show_feedback_on: number,
	isLoading: boolean
};
type StateType = {
	// When feedback is given, force a delay before allowing a submission event.
	// Used to ignore 2nd half of double-click events.
	lastFeedbackDismissal: any
	// Last displayed index.  Used to trigger a page scroll event when we start 
	// showing a new page.
	lastPageI: number,
	// When when the page first showed? Used for minimum time requird before allowing
	// moving to a new page.
	lastPageI_displayed_at_time: any,
	// handle, used to track js event.
	handle: any
};



export default class IfLevelPlay extends React.Component<PropsType, StateType> {

	constructor(props: any) {
		super(props);
		
		this.state = {
			lastFeedbackDismissal: new Date(),
			lastPageI: 0,
			lastPageI_displayed_at_time: new Date(),
			handle: setInterval( this._on_tick, 500),
		};
	}

	componentWillUnmount = () => {
		window.clearTimeout(this.state.handle);
	}

	handleChange = (new_value: IStringIndexJsonObject ) => {
		// Clean out smartQuotes
		if(typeof new_value.client_f !== 'undefined') {
			new_value.client_f = replaceClientFSmartQuotes(new_value.client_f);
		}
		this.props.onChange(new_value );
	} 

//e: null|React.SyntheticEvent<unknown>
//if(e) e.preventDefault();

	handleValidate = (): void => {

		// Do not allow submissions within 1/2s of previous ones.
		// Keeps users who double-click from accidentally re-submitting.
		if( (new Date()).getTime() - this.state.lastFeedbackDismissal.getTime() < MINIMUM_TIME_BETWEEN_SUBMIT_EVENTS) return; 
		
		this.props.onValidate();
	}

	// Do not allow submissions within 1/2s of previous ones.
	// Keeps users who double-click from accidentally re-submitting.
	handleNext = () => {
		if( (new Date()).getTime() - this.state.lastFeedbackDismissal.getTime() < MINIMUM_TIME_BETWEEN_SUBMIT_EVENTS) return; 
		
		this.props.onNext();
	}

	handleHint = () => {
		this.handleValidate();
	} 

		
	handleTimeExpired = () => {
		this.props.onChange({ time_limit_expired: true });
	}


	// Tick is a way of regularly updating things on the page.
	// Needed to update the timer even for the 'don't submit too fast' feature.
	_on_tick = () => {
		const page = this.props.level.pages[this.props.selected_page_index];
		
		if(page.time_limit !== null || typeof page.time_minimum === 'number') {
			this.setState( () => { return {}; } );
		}
	}

	/**
	 * Function for catching and resolving when user input enter is detected 
	 * 
	 */
	handleEnter = () => {
		const page = this.props.level.pages[this.props.level.pages.length-1];

		if(this.props.show_feedback) {
			// Hide feedback.
			this.props.onHideFeedback();
			this.setState({ lastFeedbackDismissal: new Date() });
		} else {
			
			// Handle keypresses for advancing tutorial window.
			if(	page.type === 'IfPageFormulaSchema' || page.type === 'IfPagePredictFormulaSchema')  {
				// Normally, enter will submit the form.  However, if a validate option is 
				// present, and the answer is wrong, we should instead validate.
				//
				if( page.code === 'tutorial' 
					&& page.correct_required === false
					&& page.correct !== true ) {
					// Validate w/o progressing
					this.handleValidate();
				} else {
					// Submit the form
					this.handleNext();
				}
			}

			// Handle keypress for advancing when viewing just a plain text page.
			if(	page.type === 'IfPageTextSchema') {
				this.handleNext();
			}
		}
	}

	/**
	 * Respond to a request to hide the modal feedback
	 */
	handleViewFeedback = () => {
		this.setState({ lastFeedbackDismissal: new Date() });
		this.props.onHideFeedback();
	}



	static getDerivedStateFromProps = (props: PropsType, state: StateType): StateType => {
		// Render the current page, or if we are reviewing last submission, n-1.
		// Use previous submitted index to figure out which to shown feedback on.
		let pageI = props.show_feedback
				? props.show_feedback_on
				: props.selected_page_index; // used to keep track of the page #

		// If the i page has changed, then fire a scroll back to top.
		if( state.lastPageI !== pageI) {
			//window.scrollTo(1,1);
			return { ...state, lastPageI: pageI, lastPageI_displayed_at_time: new Date() };
		} else {
			return state;
		}
	}

	// Render 
	render = (): ReactElement => {
		console.assert(this.props.selected_page_index < this.props.level.pages.length, 
			'Page '+this.props.selected_page_index+' is not valid in IfLevelPlay');

		const level = this.props.level;
		const pageI = this.props.selected_page_index; // used to keep track of the page #
		let page = this.props.level.pages[this.props.selected_page_index];

		// Render the current page, or if we are reviewing last submission, n-1.
		// Use previous submitted index to figure out which to shown feedback on.
		// Once show_next_feedback is cleared, then we will revert to current page.
		if(this.props.show_feedback) {
			page = this.props.level.pages[this.props.show_feedback_on];
		}
		
		const validate_button = page_validate_button(page, this.props.isLoading, this.props.onValidate);
		const next_button = page_submit_button(page, this.props.isLoading, this.state.lastPageI_displayed_at_time, this.handleNext );
		const hint_button = page_hint_button(page, this.props.isLoading, this.handleHint)

		const page_lead = render_page_lead( page, this.props.selected_page_index);
		const timer = render_timer( page, this.props.selected_page_index, this.handleTimeExpired )
		const chart = render_chart( page );
		const exercise_panel = render_exercise_panel( 
					page, validate_button, this.props.isLoading, 
					this.handleChange, this.handleEnter, this.handleNext,
					this.handleValidate );
		
		const feedback_modal = this.props.show_feedback ? <LevelPlayFeedbackModal page={page} onHideModal={ this.handleViewFeedback } /> : <></>;


		// Discourage copying stuff on the page.
		function onCopyHandler(e) {
			e.preventDefault();
			e.stopPropagation();
		}

		return (
			<div onCopy={onCopyHandler} draggable={false} onDragStart={onCopyHandler}>
				<div key={'iflevelplay'+this.props.selected_page_index} id='iflevelplay' style={{position: 'relative', opacity: this.props.show_feedback ? 0.5 : 1 }}>
					<CSSTransition 
							timeout={20}
							classNames='levelplay-transition'
							in={true}
							>
						<form key={'formkey' + this.state.lastPageI} name='c' onSubmit={this.handleNext}>
							{ page_lead }
							{ chart }
							{ exercise_panel }
							{ timer }
							<Card style={{ marginTop: '1rem' }}>
								<Card.Body style={{ margin: 0, padding: 0 }}>
									<Table style={{ margin: 0 }} >
										<tbody>
										<tr>
											<td style={titleTdStyle}>  
												{ level.show_progress ? <span>Progress</span> : null }
											</td>
											<td style={leftTdStyle}>
												{ level.show_progress ? level_play_score(this.props.level.pages) : null }
											</td>
											<td style={rightTdStyle}>
												{ hint_button }
												{ validate_button }
												{ next_button }
											</td>
										</tr>
										</tbody>
									</Table>
								</Card.Body>
							</Card>
							<div style={{ textAlign: 'center', paddingTop: 20 }}>
								<Button 
									style={{ color: 'gray' }}
									variant='link' disabled={this.props.isLoading}
									href={'/ifgame/' } 
									>Exit</Button>
							</div>
						</form>
					</CSSTransition>
				</div>
				{ feedback_modal }
			</div>
		);
	}
}
