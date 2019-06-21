// @flow
import React from 'react';
import type { Node } from 'react';
import { Card, Button, Table, Popover, Overlay, OverlayTrigger, Modal } from 'react-bootstrap';
import { HtmlSpan, HtmlDiv, 
		HandPointRightGlyphicon, IncorrectGlyphicon, CorrectGlyphicon, 
		CompletedGlyphicon, ProgressGlyphicon} from './../components/Misc';

import ExcelTable from './ExcelTable';
import Text from './Text';
import Choice from './Choice';
import Parsons from './Parsons';
import Harsons from './Harsons';
import NumberAnswer from './NumberAnswer';


import { fill_template } from './../../shared/template.js';

import type { LevelType, PageType } from './IfTypes';

// Delay put in to help avoid people double-clicking (which sometimes comes in as
// two single clicks on iPad).
const MINIMUM_TIME_BETWEEN_SUBMIT_EVENTS = 350;


// Build the score list at the bottom of the page.
const build_score = (pages: Array<PageType>): any => pages.map( (p: PageType, i: number): any => {
	let g = null;
	let title = '';
	let html = '';
	const desc = fill_template(p.description, p.template_values);

	// Build the glyph to use for display.
	if(!p.completed) {
		// In progress
		title = 'In progress';
		html = desc;
		g = <ProgressGlyphicon />;

	} else {
		// Finished
		
		if(p.code === 'tutorial') {

			title = 'Completed';
			html = desc + 
				(p.toString().length < 1 ? '' : '<br/><div class="well well-sm">'+ p.toString()+'</div>');

			g = <CompletedGlyphicon color={ p.correct ? 'black' : 'gray' } />;
		} else if (p.code === 'test') {

			// Graded page
			if(p.correct) {
				title = 'Correct answer';
				html = desc + '<br/><div class="well well-sm">'+p.toString()+'</div>'; // style={background} 
				g = <CorrectGlyphicon />;
			} else {
				title = 'Incorrect answer';
				html = desc + '<br/><div class="well well-sm">'+p.toString()+'</div>';
				g = <IncorrectGlyphicon />;
			}
		} else {
			throw new Error('Error building score');
		}

	}

	return (<OverlayTrigger 
					key={'iflevelplayrenderscore'+i}
					trigger='hover'
					placement='top' 
					overlay={
						<Popover title={title} id={'iflevelplayrenderscore_id_'+i}>
							<HtmlDiv html={html} />
						</Popover>}>
					<span>{g}</span>
			</OverlayTrigger>);
});


const leftTdStyle = {
	verticalAlign: 'middle',
	borderWidth: 0
};
const rightTdStyle = {
	...leftTdStyle,
	textAlign: 'right'
};
const titleTdStyle = {  /* use a title td to center vertically */
	...leftTdStyle,
	width: 1,  /* set to 1 to minimize width, based on word */
	paddingRight: 0,
	paddingLeft: 15
};





type PropsType = {
	level: LevelType,
	selected_page_index: number,
	onChange: (Object) => void,
	onNext: (void) => void,
	onValidate: (void) => void,
	onViewFeedback: (void) => void,
	show_feedback: boolean,
	show_feedback_on: number,
	isLoading: boolean
};
type StateType = {
	// When feedback is given, force a delay before allowing a submission event.
	// Used to ignore 2nd half of double-click events.
	lastFeedbackDismissal: Object,
	// Last displayed index.  Used to trigger a page scroll event when we start 
	// showing a new page.
	lastPageI: number
};

/*
	  <>
		<Button variant="primary" onClick={this.handleShow}>
		  Launch demo modal
		</Button>
		*/
class ModalFeedback extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.handleShow = this.handleShow.bind(this);
		this.handleClose = this.handleClose.bind(this);

		this.state = {
		show: false,
		};
	}

	handleClose() {
		this.setState({ show: false });
	}

	handleShow() {
		this.setState({ show: true });
	}

	render() {
	return (

		<Modal show={this.state.show} onHide={this.handleClose}>
			<Modal.Header closeButton>
			<Modal.Title>{ }</Modal.Title>
		</Modal.Header>
		<Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
		<Modal.Footer>
		<Button variant="secondary" onClick={this.handleClose}>
		Close
		</Button>
		<Button variant="primary" onClick={this.handleClose}>
		Save Changes
		</Button>
		</Modal.Footer>
		</Modal>

	);
	}
	}


export default class IfLevelPlay extends React.Component<PropsType, StateType> {

	constructor(props: any) {
		super(props);
		(this: any).handleChange = this.handleChange.bind(this);
		(this: any).handleNext = this.handleNext.bind(this);
		(this: any).handleValidate = this.handleValidate.bind(this);
		(this: any)._on_keypress = this._on_keypress.bind(this);
		(this: any)._on_click = this._on_click.bind(this);

		(this: any).state = {
			lastFeedbackDismissal: new Date(),
			lastPageI: 0
		};

		document.addEventListener('keypress', this._on_keypress);

	}

	handleChange(new_value: Object) {
		this.props.onChange(new_value);
	} 


	handleValidate(e: ?SyntheticEvent<HTMLButtonElement>) {
		if(e) e.preventDefault();


		// Do not allow submissions within 1/2s of previous ones.
		// Keeps users who double-click from accidentally re-submitting.
		if( (new Date()).getTime() - this.state.lastFeedbackDismissal.getTime() < MINIMUM_TIME_BETWEEN_SUBMIT_EVENTS)
			return; 
		this.props.onValidate();
	}


	handleNext(e: ?SyntheticEvent<HTMLButtonElement>) {
		if(e) e.preventDefault();

		// Do not allow submissions within 1/2s of previous ones.
		// Keeps users who double-click from accidentally re-submitting.
		if( (new Date()).getTime() - this.state.lastFeedbackDismissal.getTime() < MINIMUM_TIME_BETWEEN_SUBMIT_EVENTS)
			return; 
		
		this.props.onNext();
	}



	// If we are showing feedback, and enter/escape is hit, then dismiss feedback window.
	_on_keypress(event: any): any {
		const page = this.props.level.pages[this.props.level.pages.length-1];

		if(this.props.show_feedback) {
			if(event.key === 'Enter' || event.key === 'Escape' || event.key === ' ') {
				event.preventDefault(); // cancel any keypress.
				this.props.onViewFeedback();
				this.setState({ lastFeedbackDismissal: new Date() });
			}
		} else {
			// Handle keypresses for advancing tutorial window.
			// Normally, enter will submit the form.  However, if a validate option is 
			// present, and the answer is wrong, we should instead validate.
			if(event.key === 'Enter'
					&& page.code === 'tutorial' 
					&& page.correct_required === false
					&& page.correct !== true 
					&& page.type === 'IfPageFormulaSchema') {
				event.preventDefault(); // cancel any keypress.
				this.handleValidate(event);
			}

			// Handle keypress for advancing when viewing just a plain text page.
			if(event.key === 'Enter' 
					&& page.type === 'IfPageTextSchema') {
				event.preventDefault();
				this.handleNext();
			}
		}
	}

	// Universal click handler to dismiss feedback.
	_on_click(event: any): any {
		event.stopPropagation();
		this.setState({ lastFeedbackDismissal: new Date() });
		this.props.onViewFeedback();
	}



	// Render a single page.
	_render_page_lead(page: PageType, pageId: number): Node {
		if(page.code === 'test') {
			// Do a custom animation to draw eye to the instruction
			// Ugly hack to get stylesheet and insert keyframes.

			try {
				const stylesheet = document.styleSheets[0];
				const keyframes = `@keyframes quizIn${pageId} {
					0% { color: #d9edf7; background-color: #d9edf7; } 
					100% { color: black; background-color: white; }
					}`;
				stylesheet.insertRule(keyframes, stylesheet.cssRules.length);
			} catch(e) {
				// Ignore any errors generated here.
				// TODO: Some issue with Safari occasionally throws an error here. 
				//       Says that stylesheet.cssRules is null.
				console.error(e);
			}
			
			const t = `quizIn${pageId} 4s ease`;
			const style = {
				MozAnimation: t,
				WebkitAnimation: t,
				OAnimation: t,
				animation: t
			};
			const desc = fill_template(page.description, page.template_values);

			return (
				<Card variant='primary'>
					<Card.Body>
						<Card.Title >Quiz Question</Card.Title>
						<div style={ style }>
							<HtmlDiv html={ desc } />
						</div>
					</Card.Body>
				</Card>
				);

		} else {
			// Make a little prettier by replacing linebreaks with div.lead.
			// Looks better spacing-wise, as we have instructions below the lead in 
			// a div.lead.
			let desc = fill_template(page.description, page.template_values);
			let descriptions = desc.split('<br/><br/>');

			descriptions = descriptions.map( (d: string, i: number): Node =>
					<HtmlDiv className='lead' style={{ marginBottom: '1rem' }} key={i} html={ d } /> );

			return <div>{ descriptions}</div>;
		}
	}


	// Create button to validate any formula, parsons, or choice answers.
	// This only shows if there are the proper conditions.
	_render_page_validate_button(page: PageType): Node {
		const that = this;

		// Don't show 'validate' button if correct isn't required.
		if(page.correct_required) return;

		// Don't have validate button for all types of pages.
		if(page.type === 'IfPageTextSchema') return;

		// Hide validate for pages that don't show feedback.
		if(!page.show_feedback_on) return;


		//  Button style. If required, primary. Else secondary.
		let button_style = 'primary';
		let button_text = 'Check answer';

		if(page.code === 'tutorial') {
			if(page.correct_required) {
				if(page.client_has_answered() && !page.correct) {
					// Require a correct answer.
					button_style = 'warning';
				} else if(page.client_has_answered() && page.correct) {
					button_style = 'success'; 
				} else {
					// No answer, or unknown if correct (e.g., on a quiz question)
					button_style = 'primary';
				}
			}
		} else if (page.code ==='test') {
			button_style = 'primary';
			if(page.client_has_answered()) {
				button_text = 'Submit answer';
			}
		}

		// Text to say if we're going to try again or continue.
		//const next = page.correct_required && !page.correct ? 'try again' : 'continue';

		return <Button id='iflevelplayvalidate' 
					variant={button_style}
					disabled={this.props.isLoading}
					onClick={ () => that.props.onValidate() }
					>{ button_text }</Button>;
	}


	// Backdrop that allow us to click anywhere to dismiss pop-up or inline pop-up.
	_render_fullpage_invisible_div(): Node {
		if(!this.props.show_feedback) return;

		return <div style={{
					position: 'fixed',
					top: 0, left: 0, right: 0, bottom: 0,
					zIndex: 100000,
					cursor: 'pointer' // see https://github.com/facebook/react/issues/1169
					}}
					onClick={ this._on_click }
					></div>;
	}


	// Create the pop-up or pop-over elements
	_render_page_feedback_inline(page: PageType, button: Node, orientation: string): Node {
		if(!(orientation == 'left' || orientation == 'right')) alert('invalid orientation ' + orientation);

		// Don't show feedback.
		if(!this.props.show_feedback) return;

		// No feedback to show.
		if(typeof page.client_feedback === 'undefined' || 
				page.client_feedback === null ) return;

		// If feedback, then don't create inline but defer to pop-up.
		if(page.client_feedback.length > 0) return;

		//Return overlay
		return (
			<div>
				<Overlay
					show={true}
					target={ (): any => document.getElementById(button.props.id) }
					placement={ orientation }
					container={document.body}
					containerPadding={0}
					>
					<Popover 
						id='_render_page_feedback_inline'
						onClick={ this._on_click }
						>
						{ page.correct ? 
							<div style={{color: 'rgb(60, 118, 61)'}}>Correct!</div> : 
							<div style={{color: 'rgb(169, 68, 66)'}}>Incorrect answer</div>
						}
						Click or press <kbd>enter</kbd>
					</Popover>
				</Overlay>
			</div>
		);
	}

	// We have one or more specific items of feedback to tell the user.
	// Return a full-screen pop-up IF props.show_feedback
	_render_page_feedback_popup(page: PageType): Node {

		// Don't render anything if there's no feedback.
		if( !( page.client_feedback && page.client_feedback.length && page.client_feedback.length > 0) )
			return;

		if( !this.props.show_feedback ) return;

		// Build specific feedback LIs.
		const f_li = page.client_feedback.map( (f: string, i: number): Node => <li key={i}>{f}</li>);

//style={{ textAlign: 'left', zIndex: 100000 }} 
//					onClick={ this._on_click }

		// Return full-screen feedback.
		return (<Modal show={this.props.show_feedback} onHide={this._on_click}>
					<Modal.Header closeButton>
						<Modal.Title>Incorrect answer</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<ul>
							{ f_li }
						</ul>
					</Modal.Body>
					<Modal.Footer>
						<Button variant='link' size='sm' >Press <kbd>enter</kbd> or </Button>
						<Button variant='primary' size='sm' onClick={this._on_click}>click</Button>
					</Modal.Footer>
				</Modal>);
	}


	// Create lower 'next page' & exit buttons.
	_render_page_submit_button(page: PageType): Node {
		// Use a different color for the submission button if we are test v. tutorial.
		let button_style = 'primary';
		let button_text = 'Next page';
		let button_disabled = this.props.isLoading;

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

		// If a test, make sure that they've submitted something.
		if (page.code ==='test' && !page.client_has_answered()) {
			button_disabled = true;
			button_style = 'primary';
		}

		return <Button id='_render_page_submit_button' 
				type='submit' 
				variant={button_style}
				disabled={button_disabled}
				>{button_text}</Button>;
	}



	_render_exercise_panel(page: PageType, validate_button: Node ): Node {
		let problem = null;
		const instruc = fill_template(page.instruction, page.template_values);

		// Build correct page.
		if(page.type === 'IfPageFormulaSchema') {
			problem = <ExcelTable page={page} 
						readonly={ this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageParsonsSchema') {
			problem = <Parsons page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageChoiceSchema') {
			problem = <Choice page={page} 
						readonly={ this.props.isLoading }
						editable={ true } 
						showSolution={false} 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageHarsonsSchema') {
			problem = <Harsons page={page} 
						readonly={ this.props.isLoading }
						editable={ true } 
						showSolution={ false } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageTextSchema') {
			problem = <Text page={page} 
						readonly={ this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} 
						handleSubmit={ () => this.handleNext() } />;

		} else if(page.type === 'IfPageNumberAnswerSchema') {
			problem = <NumberAnswer page={page} 
						readonly={ this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} 
						handleSubmit={ () => this.handleNext() } />;

		} else {
			throw new Error('Invalid type in IfLevelPlay '+page.type);
		}

		// If we're just looking at text, don't use the embedded panel.
		if(page.type === 'IfPageTextSchema') {
			return (
				<div className='lead' >
					<HandPointRightGlyphicon />
					<HtmlSpan html={ instruc } />
				</div>
			);
		}


		// Don't use embedded panels for required problems.
		if(page.code === 'tutorial' && page.correct_required) {
			return (
				<div>
				<div className='lead' >
					<HandPointRightGlyphicon />
					<HtmlSpan html={ instruc } />
				</div>
				{ problem }
				</div>
			);		
		}

		if(page.code === 'test') {
			return (
				<div>
				<div className='lead' >
					<HandPointRightGlyphicon />
					<HtmlSpan html={ instruc } />
				</div>
				{ problem }
				</div>
			);
		}

		// Build panel and return for tutorials that don't require the correct answer.
		// Note: Position =Inherit is needed for blockly.  If that's not there, then it
		// 	can't find the coordinates to move the div over.
		return (
			<Card className='card card-default' style={{ position: 'inherit', marginTop: '1rem' }}>
				<Card.Header>Optional Exercise</Card.Header>
				<Card.Body>
					<HtmlDiv className='' 
						style={{ paddingBottom: 10}} 
						html={ instruc } />
					{ problem }
					{ validate_button }
				</Card.Body>
			</Card>
		);
	}


	// Render 
	render(): Node {
		console.assert(this.props.selected_page_index < this.props.level.pages.length, 
			'Page '+this.props.selected_page_index+' is not valid in IfLevelPlay');

		let page = this.props.level.pages[this.props.selected_page_index];
		let pageI = this.props.selected_page_index; // used to keep track of the page #

		// Render the current page, or if we are reviewing last submission, n-1.
		// Use previous submitted index to figure out which to shown feedback on.
		// Once show_next_feedback is cleared, then we will revert to current page.
		if(this.props.show_feedback) {
			page = this.props.level.pages[this.props.show_feedback_on];
			pageI = this.props.show_feedback_on;
		}

		// If the i page has changed, then fire a scroll back to top.
		if( this.state.lastPageI !== pageI) {
			window.scrollTo(1,1);
			this.setState({ lastPageI: pageI });
		}
		
		const validate_button = this._render_page_validate_button(page);
		const next_button = this._render_page_submit_button(page);

		// Setup inline options for pop-up.
		let button = next_button;
		let orientation = 'left';

		if (page.code ==='tutorial' && !page.correct_required) {
			button = validate_button;
			orientation = 'right';
		}

		return (
			<div>
				<div id='iflevelplay' style={{position: 'relative', opacity: this.props.show_feedback ? 0.5 : 1 }}>
					<form name='c' onSubmit={this.handleNext}>
						{ this._render_page_lead(page, pageI) }
						{ this._render_exercise_panel(page, validate_button) }
						<Card style={{ marginTop: '1rem' }}>
							<Card.Body style={{ margin: 0, padding: 0 }}>
								<Table style={{ margin: 0 }} >
									<tbody>
									<tr>
										<td style={titleTdStyle}>  
											<span>Progress</span>
										</td>
										<td style={leftTdStyle}>
											{ build_score(this.props.level.pages) }
										</td>
										<td style={rightTdStyle}>
											
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
				</div>
				{ this._render_fullpage_invisible_div() }
				{ this._render_page_feedback_popup(page) }
				{ this._render_page_feedback_inline(page, button, orientation) }
			</div>
		);
	}
}
