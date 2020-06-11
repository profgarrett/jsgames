// @flow
import React from 'react';
import type { Node } from 'react';
import { Button, Table, Card, Popover, Overlay, OverlayTrigger, Modal } from 'react-bootstrap';
import { HtmlSpan, HtmlDiv, 
		HandPointRightGlyphicon, IncorrectGlyphicon, CorrectGlyphicon, 
		CompletedGlyphicon, ProgressGlyphicon} from './../components/Misc';
import Timer from './../components/Timer';
import { CSSTransitionGroup } from 'react-transition-group';

import ExcelTable from './ExcelTable';
import Text from './Text';
import Choice from './Choice';
import Parsons from './Parsons';
import Harsons from './Harsons';
import NumberAnswer from './NumberAnswer';
import Slider from './Slider';
import ShortTextAnswer from './ShortTextAnswer';

import { CacheBuster } from './../components/CacheBuster';

import { buildChart } from './charts/Charts.js';
import { ChartDef } from './../../shared/ChartDef';

import { fill_template } from './../../shared/template.js';
import { IfLevelSchema } from './../../shared/IfLevelSchema.js';
import { IfPageBaseSchema } from './../../shared/IfPageSchemas';

// Delay put in to help avoid people double-clicking (which sometimes comes in as
// two single clicks on iPad).
const MINIMUM_TIME_BETWEEN_SUBMIT_EVENTS = 350;


// Build the score list at the bottom of the page.
const build_score = (pages: Array<IfPageBaseSchema>): any => pages.map( (p: IfPageBaseSchema, i: number): any => {
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
				title = "Sorry, but that's not correct";
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
							<Popover.Content>
							<HtmlDiv html={html} />
							</Popover.Content>
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
	level: IfLevelSchema,
	selected_page_index: number,
	onChange: (Object, ?Function) => void,
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
	lastPageI: number,
	// When when the page first showed? Used for minimum time requird before allowing
	// moving to a new page.
	lastPageI_displayed_at_time: Object
};

export default class IfLevelPlay extends React.Component<PropsType, StateType> {

	constructor(props: any) {
		super(props);
		(this: any).handleChange = this.handleChange.bind(this);
		(this: any).handleNext = this.handleNext.bind(this);
		(this: any).handleValidate = this.handleValidate.bind(this);
		(this: any).handleHint = this.handleHint.bind(this);
		(this: any)._on_keypress = this._on_keypress.bind(this);
		(this: any)._on_click = this._on_click.bind(this);
		(this: any)._on_tick = this._on_tick.bind(this);
		
		(this: any).state = {
			lastFeedbackDismissal: new Date(),
			lastPageI: 0,
			lastPageI_displayed_at_time: new Date(),
			handle: setInterval( this._on_tick, 500),
		};
		
		document.addEventListener('keydown', this._on_keypress);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this._on_keypress, false);
		window.clearTimeout(this.state.handle);
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

	handleHint() {
		// Increment the numbers of hints, which generates a history entry.
		const page = this.props.level.pages[this.props.selected_page_index];
		const hints_parsed = page.hints_parsed + 1;
		const hints_viewsolution = page.hints_viewsolution + 1;

		this.props.onChange({ hints_parsed, hints_viewsolution }, () => {
			// Push to server for feedback.
			this.handleValidate();
		});
	} 

	// Tick is a way of regularly updating things on the page.
	// Needed to update the timer even for the 'don't submit too fast' feature.
	_on_tick() {
		this.setState( (s, p) => { return {} } );
	}

	// If we are showing feedback, and enter/escape is hit, then dismiss feedback window.
	_on_keypress(event: any): any {

		const page = this.props.level.pages[this.props.level.pages.length-1];
		
		// See if this is a repeating key event, which is automatically fired if the user keeps hitting the key.
		// If so, exit out.
		if(event.repeat) {
			event.preventDefault();
			return;
		}

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
		if(typeof event !== 'undefined') event.stopPropagation();
		this.setState({ lastFeedbackDismissal: new Date() });
		this.props.onViewFeedback();
	}



	// Render a single page.
	_render_page_lead(page: IfPageBaseSchema, pageId: number): Node {
		if(page.code === 'test') {
			// Do a custom animation to draw eye to the instruction
			// Ugly hack to get stylesheet and insert keyframes.

			if(page.description === '') return null;

			try {
				const stylesheet = document.styleSheets[0];
				const keyframes = `@keyframes quizIn${pageId} {
					0% { color: #d9edf7; background-color: #d9edf7; } 
					100% { color: black; background-color: white; }
					}`;
				// $FlowFixMe
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
			let desc = ''+fill_template(page.description, page.template_values);
			let descriptions = desc.split('<br/><br/>');

			descriptions = descriptions.map( (d: string, i: number): Node =>
					<HtmlDiv className='lead' style={{ marginBottom: '1rem' }} key={i} html={ d } /> );

			return <div>{ descriptions}</div>;
		}
	}


	// Create button to validate any formula, parsons, or choice answers.
	// This only shows if there are the proper conditions.
	_render_page_validate_button(page: IfPageBaseSchema): Node {
		const that = this;

		// Don't show 'validate' button if correct isn't required.
		if(page.correct_required) return null;

		// Don't have validate button for all types of pages.
		if(page.type === 'IfPageTextSchema') return null;

		// Hide validate for pages that don't show feedback.
		if(!page.show_feedback_on) return null;


		//  Button style. If required, primary. Else secondary.
		let button_style = 'primary';
		let button_text = 'Check answer';

		if(page.code === 'tutorial') {
			if(page.client_has_answered() && !page.correct) {
				// Require a correct answer.
				button_style = 'warning';
			} else if(page.client_has_answered() && page.correct) {
				button_style = 'success'; 
			} else {
				// No answer, or unknown if correct (e.g., on a quiz question)
				button_style = 'primary';
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
		if(!this.props.show_feedback) return null;

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
	_render_page_feedback_inline(page: IfPageBaseSchema, button: Node, orientation: string): Node {
		return null;

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
	}

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
	_render_page_feedback_popup(page: IfPageBaseSchema): Node {
		const feedback = typeof page.client_feedback === 'undefined' || page.client_feedback === null 
				? [] 
				: page.client_feedback;
		
		const title = 'Problem Feedback';
		let body = [];
		let typedPage = null;

		if( !this.props.show_feedback ) return null;

		if(page.completed) {
			if(page.correct) {
				// Complete & right
				body.push(<div>Great job! Go onto the next problem.</div>);
			} else {
				// Complete but wrong
				body.push(<div>Sorry, but that is not the correct answer.</div>);

				if(	page.type === 'IfPageFormulaSchema' || 
					page.type === 'IfPageHarsonsSchema') {
					// Formula page.
					typedPage = page.toIfPageFormulaSchema();

					body.push(<div>The right answer was <code>{ fill_template(typedPage.solution_f, typedPage.template_values)}</code></div>);
				}

			}

		} else if(!page.completed){
			if(page.correct) {
				// Correct, but not submitted.
				body.push(<div>Your answer is correct! Go ahead and click the next page button to submit it.</div>);

			} else {
				// Wrong, but not submitted.
				if(	page.type === 'IfPageFormulaSchema' || 
					page.type === 'IfPageHarsonsSchema') {

					// Formula page
					typedPage = page.toIfPageFormulaSchema();
					
					// Item feedback
					if( feedback.length > 0) {
						// Add feedback to the page.
						body.push( <ul>
							{ feedback.map( (f: string, i: number): Node => <li key={i}>{f}</li>) }
						</ul>);
					}

					// Show correct solution
					if(typedPage.solution_f !== null && typedPage.solution_f.length > 0) {

						// Should we show the solution to the user?
						if(feedback.length > 0) {
							// No, still feedback.
							body.push(<div>Try to resolve the problems above. Once you do that, and if you're still stuck, you can come back here for the solution</div>);

						} else if ( typedPage.correct ) {
							body.push(<div>Correct answer!</div>);
						
						} else if( typedPage.get_time_in_seconds() < 60 ) {
							// No, haven't  tried for at least 2 minutes.
							//console.log(typedPage.get_time_in_seconds());
							body.push(<div>You have only spent {typedPage.get_time_in_seconds()} seconds
								trying to solve the problem on your own. Once you try for a minute you 
								can come back here for the solution.</div>);
						
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

		// Return full-screen feedback.
		return (<Modal show={this.props.show_feedback} onHide={this._on_click}>
					<Modal.Header closeButton>
						<Modal.Title>{ title }</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{ body.map( (d,i) => <div key={'pagefeedbackmodal'+i}>{d}</div>) }
					</Modal.Body>
					<Modal.Footer>
						<Button variant='link' size='sm' >Press <kbd>enter</kbd> or </Button>
						<Button variant='primary' size='sm' onClick={this._on_click}>click</Button>
					</Modal.Footer>
				</Modal>);
	}


	/*
		Create lower 'next page' & exit buttons.
		The next button respects the time_minimum setting, being disabled until the timer runs from page load
	*/
	_render_page_submit_button(page: IfPageBaseSchema): Node {
		// Use a different color for the submission button if we are test v. tutorial.
		let button_style = 'primary';
		let button_text = 'Next page';
		let button_disabled = this.props.isLoading;
		let time_page_displayed_in_ms = new Date().getTime() - this.state.lastPageI_displayed_at_time.getTime();

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
		if(!button_disabled) {
			if( page.time_minimum !== null && page.time_minimum > 0) {
				if(page.time_minimum*1000 > time_page_displayed_in_ms) {
					button_disabled = true;
					button_text += " ("+ Math.ceil( (page.time_minimum*1000 - time_page_displayed_in_ms)/1000) + ")";
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
				>{button_text}</Button>;
	}


	// Create lower 'hint ' button.
	_render_page_hint_button(page: IfPageBaseSchema): Node {
		// Use a different color.
		let button_disabled = this.props.isLoading;
		
		// Hint for formula.
		if(page.type === 'IfPageFormulaSchema' || page.type ==='IfPageHarsonsSchema') {
			// No hints for test pages.
			if (page.code !== 'tutorial') return null;
			
			return <Button id='_render_page_hint_button' 
				style={{ marginRight: '5px' }}
				onClick={this.handleHint}
				variant='warning'
				disabled={button_disabled}
				>Get a hint</Button>;
		}

		// No hint for other types of pages.
		return null;
	}



	// Return a timer (if needed)
	_render_timer(page: IfPageBaseSchema): Node {
		
		if(page.time_limit === null) return null;
		
		return <Timer for_object={this.props.selected_page_index} time_limit={page.time_limit} onTimeout={ () => {
			this.props.onChange({ time_limit_expired: true }, 
				() => {
					this.props.onNext();
				})
			}} />;
	}

	// Build out the chart
	_render_chart(page: IfPageBaseSchema ): Node {
		if(page.chart_def !== null && typeof page.chart_def !== 'undefined') {
			return <div style={{height:'300px'}}>{buildChart(page.chart_def)}</div>;
		} else {
			return null;
		}
	}



	_render_exercise_panel(page: IfPageBaseSchema, validate_button: Node ): Node {
		let problem = null;
		const instruc = fill_template(page.instruction, page.template_values);

		// Build correct page.
		if(page.type === 'IfPageFormulaSchema') {
			problem = <ExcelTable page={page.toIfPageFormulaSchema()} 
						readonly={ this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageParsonsSchema') {
			problem = <Parsons page={page.toIfPageParsonsSchema()} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageChoiceSchema') {
			problem = <Choice page={page.toIfPageChoiceSchema()} 
						readonly={ this.props.isLoading }
						editable={ true } 
						showSolution={false} 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageHarsonsSchema') {
			problem = <Harsons page={page.toIfPageHarsonsSchema()} 
						readonly={ this.props.isLoading }
						editable={ true } 
						showSolution={ false } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageTextSchema') {
			problem = <Text page={page.toIfPageTextSchema()} 
						readonly={ this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} 
						handleSubmit={ () => this.handleNext() } />;

		} else if(page.type === 'IfPageNumberAnswerSchema') {
			problem = <NumberAnswer page={page.toIfPageNumberAnswerSchema()} 
						readonly={ this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} 
						handleSubmit={ () => this.handleNext() } />;

		} else if(page.type === 'IfPageShortTextAnswerSchema') {
			problem = <ShortTextAnswer page={page.toIfPageShortTextAnswerSchema()} 
						readonly={ this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} 
						handleSubmit={ () => this.handleNext() } />;


		} else if(page.type === 'IfPageSliderSchema') {
			problem = <Slider page={page.toIfPageSliderSchema()} 
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


	static getDerivedStateFromProps(props: PropsType, state: StateType): StateType {
		// Render the current page, or if we are reviewing last submission, n-1.
		// Use previous submitted index to figure out which to shown feedback on.
		let pageI = props.show_feedback
				? props.show_feedback_on
				: props.selected_page_index; // used to keep track of the page #

		// If the i page has changed, then fire a scroll back to top.
		if( state.lastPageI !== pageI) {
			window.scrollTo(1,1);
			return { ...state, lastPageI: pageI, lastPageI_displayed_at_time: new Date() };
		} else {
			return state;
		}
	}

	// Render 
	render(): Node {
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
		
		const validate_button = this._render_page_validate_button(page);
		const next_button = this._render_page_submit_button(page);
		const hint_button = this._render_page_hint_button(page);

		// Setup inline options for pop-up.
		let button = next_button;
		let orientation = 'left';

		if (page.code ==='tutorial' && !page.correct_required) {
			button = validate_button;
			orientation = 'right';
		}

		return (
			<div>
				<div key={'iflevelplay'+this.props.selected_page_index} id='iflevelplay' style={{position: 'relative', opacity: this.props.show_feedback ? 0.5 : 1 }}>
				<CacheBuster />
					<CSSTransitionGroup 
							transitionName="levelplay-transition"
							transitionAppear={true}
							transitionAppearTimeout={1000}
							transitionEnterTimeout={1000}
							transitionLeaveTimeout={1}>
						<form key={'formkey' + this.state.lastPageI} name='c' onSubmit={this.handleNext}>
							{ this._render_page_lead(page, pageI) }
							{ this._render_chart(page) }
							{ this._render_exercise_panel(page, validate_button) }
							{ this._render_timer(page) }
							<Card style={{ marginTop: '1rem' }}>
								<Card.Body style={{ margin: 0, padding: 0 }}>
									<Table style={{ margin: 0 }} >
										<tbody>
										<tr>
											<td style={titleTdStyle}>  
												{ level.show_progress ? <span>Progress</span> : null }
											</td>
											<td style={leftTdStyle}>
												{ level.show_progress ? build_score(this.props.level.pages) : null }
											</td>
											<td style={rightTdStyle}>
												{ hint_button }
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
					</CSSTransitionGroup>
				</div>
				{ this._render_fullpage_invisible_div() }
				{ this._render_page_feedback_popup(page) }
				{ this._render_page_feedback_inline(page, button, orientation) }
			</div>
		);
	}
}
