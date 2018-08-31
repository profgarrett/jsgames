//      
import React from 'react';
                                  
import { Glyphicon, Panel, Button, Table, Popover, Overlay, OverlayTrigger, Modal } from 'react-bootstrap';
import { HtmlSpan, HtmlDiv, incorrect_glyphicon, correct_glyphicon, completed_glyphicon, progress_glyphicon} from './../components/Misc';

import ExcelTable from './ExcelTable';
import Text from './Text';
import Choice from './Choice';
import Parsons from './Parsons';
import Harsons from './Harsons';

                                                     


// Build the score list at the bottom of the page.
const build_score = (pages                 )      => pages.map( (p          , i        )      => {
	let g = null;
	let title = '';
	let html = '';

	// Build the glyph to use for display.
	if(!p.completed) {
		// In progress
		title = 'In progress';
		html = p.description;
		g = progress_glyphicon();

	} else {
		// Finished
		
		if(p.code === 'tutorial') {

			title = 'Completed';
			html = p.description + 
				(p.toString().length < 1 ? '' : '<br/><div class="well well-sm">'+ p.toString()+'</div>');

			if(p.correct) {
				g = completed_glyphicon('black');
			} else {
				g = completed_glyphicon('gray');
			}
		} else if (p.code === 'test') {

			// Graded page
			if(p.correct) {
				title = 'Correct answer';
				html = p.description + '<br/><div class="well well-sm">'+p.toString()+'</div>'; // style={background} 
				g = correct_glyphicon();
			} else {
				title = 'Incorrect answer';
				html = p.description + '<br/><div class="well well-sm">'+p.toString()+'</div>';
				g = incorrect_glyphicon();
			}
		} else {
			throw new Error('Error building score');
		}

	}


	const pop = (
		<Popover title={title} id={'iflevelplayrenderscore_id_'+i}>
			<HtmlDiv html={html} />
		</Popover>
	);

	return (
		<span key={'iflevelplayrenderscore'+i}>
			<OverlayTrigger trigger={['hover','focus']} placement='top' overlay={pop}>
				{g}
			</OverlayTrigger>
		</span>
	);
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





                  
                  
                             
                            
                        
                            
                                
                        
                          
                   
  
                  
                                                                             
                                                   
                               
  


export default class IfLevelPlay extends React.Component                       {

	constructor(props     ) {
		super(props);
		(this     ).handleChange = this.handleChange.bind(this);
		(this     ).handleNext = this.handleNext.bind(this);
		(this     ).handleValidate = this.handleValidate.bind(this);
		(this     )._on_keypress = this._on_keypress.bind(this);
		(this     )._on_click = this._on_click.bind(this);

		(this     ).state = {
			lastFeedbackDismissal: new Date()
		};

		document.addEventListener('keypress', this._on_keypress);

	}

	handleChange(new_value        ) {
		this.props.onChange(new_value);
	} 


	handleValidate(e                                    ) {
		if(e) e.preventDefault();

		// Do not allow submissions within 1/2s of previous ones.
		// Keeps users who double-click from accidentally re-submitting.
		if( (new Date()).getTime() - this.state.lastFeedbackDismissal.getTime() < 500)
			return; 
		this.props.onValidate();
	}


	handleNext(e                                    ) {
		if(e) e.preventDefault();

		// Do not allow submissions within 1/2s of previous ones.
		// Keeps users who double-click from accidentally re-submitting.
		if( (new Date()).getTime() - this.state.lastFeedbackDismissal.getTime() < 500)
			return; 
		
		this.props.onNext();
	}



	// If we are showing feedback, and enter/escape is hit, then dismiss feedback window.
	_on_keypress(event     )      {
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
	_on_click(event     )      {
		event.stopPropagation();
		this.setState({ lastFeedbackDismissal: new Date() });
		this.props.onViewFeedback();
	}



	// Render a single page.
	_render_page_lead(page          , pageId        )       {
		if(page.code === 'test') {
			// Do a custom animation to draw eye to the instruction
			// Ugly hack to get stylesheet and insert keyframes.
			const stylesheet = document.styleSheets[0];
			const keyframes = `@keyframes quizIn${pageId} {
				0% { color: white } 
				100% { color: black }
				}`;
			stylesheet.insertRule(keyframes, stylesheet.cssRules.length);

			const t = `quizIn${pageId} 2s ease`;
			const style = {
				MozAnimation: t,
				WebkitAnimation: t,
				OAnimation: t,
				animation: t
			};

			return (
				<Panel bsStyle='primary'>
					<Panel.Heading>
						<Panel.Title componentClass='h3'>Quiz Question</Panel.Title>
					</Panel.Heading>
					<Panel.Body collapsible={false} style={ style }>
						<HtmlDiv html={ page.description } />
					</Panel.Body>
				</Panel>
				);
		} else {
			// Make a little prettier by replacing linebreaks with div.lead.
			// Looks better spacing-wise, as we have instructions below the lead in 
			// a div.lead.
			let descriptions = page.description.split('<br/><br/>');

			descriptions = descriptions.map( (d        , i        )       =>
					<HtmlDiv className='lead' key={i} html={ d } /> );

			return <div>{ descriptions}</div>;
		}
	}


	// Create button to validate any formula, parsons, or choice answers.
	// This only shows if there are the proper conditions.
	_render_page_validate_button(page          )       {
		const that = this;

		// Don't show 'validate' button if correct isn't required.
		if(page.correct_required) return;

		// Don't have validate button for all types of pages.
		if(page.type === 'IfPageTextSchema') return;

		// Hide validate for pages that don't show feedback.
		if(!page.show_feedback_on) return;


		//  Button style. If required, primary. Else secondary.
		let button_style = 'default';
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
					bsStyle={button_style}
					disabled={this.props.isLoading}
					onClick={ () => that.props.onValidate() }
					>{ button_text }</Button>;
	}


	// Backdrop that allow us to click anywhere to dismiss pop-up or inline pop-up.
	_render_fullpage_invisible_div()       {
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
	_render_page_feedback_inline(page          , button      , orientation        )       {
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
					target={ ()      => document.getElementById(button.props.id) }
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
	_render_page_feedback_popup(page          )       {

		// Don't render anything if there's no feedback.
		if( !( page.client_feedback && page.client_feedback.length && page.client_feedback.length > 0) )
			return;

		if( !this.props.show_feedback ) return;

		// Build specific feedback LIs.
		const f_li = page.client_feedback.map( (f        , i        )       => <li key={i}>{f}</li>);

		// Return full-screen feedback.
		return <div className='static-modal' 
					style={{ textAlign: 'left', zIndex: 100000 }} 
					onClick={ this._on_click } >
					<Modal.Dialog style={{marginTop: 150}}>
						<Modal.Header>
							<Modal.Title>Incorrect answer</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<ul>
								{ f_li }
							</ul>
						</Modal.Body>
						<Modal.Footer>
							Click anywhere or press <kbd>enter</kbd>
						</Modal.Footer>
					</Modal.Dialog>
				</div>;
	}


	// Create lower 'next page' & exit buttons.
	_render_page_submit_button(page          )       {
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
				button_style = 'default';
			}
		} 

		// If a test, make sure that they've submitted something.
		if (page.code ==='test' && !page.client_has_answered()) {
			button_disabled = true;
			button_style = 'primary';
		}

		return <Button id='_render_page_submit_button' 
				type='submit' 
				bsStyle={button_style}
				disabled={button_disabled}
				>{button_text}</Button>;
	}



	_render_exercise_panel(page          , validate_button       )       {
		let problem = null;

		// Build correct page.
		if(page.type === 'IfPageFormulaSchema') {
			problem = <ExcelTable page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageParsonsSchema') {
			problem = <Parsons page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageChoiceSchema') {
			problem = <Choice page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						showSolution={false} 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageHarsonsSchema') {
			problem = <Harsons page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						showSolution={ false } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageTextSchema') {
			problem = <Text page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} 
						handleSubmit={ () => this.handleNext() } />;
		} else {
			throw new Error('Invalid type in IfLevelPlay '+page.type);
		}

		let title = 'Optional Exercise';
		let style = 'panel panel-default';


		// If we're just looking at text, don't use the embedded panel.
		if(page.type === 'IfPageTextSchema') {
			return (
				<div className='lead' >
					<Glyphicon style={{ top: 3, paddingRight: 5, fontSize: 21 }} glyph='hand-right'/>
					<HtmlSpan html={ page.instruction } />
				</div>
			);
		}


		// Don't use embedded panels for required problems.
		if(page.code === 'tutorial' && page.correct_required) {
			return (
				<div>
				<div className='lead' >
					<Glyphicon style={{ top: 3, paddingRight: 5, fontSize: 21 }} glyph='hand-right'/>
					<HtmlSpan html={ page.instruction } />
				</div>
				{ problem }
				</div>
			);		
		}

		if(page.code === 'test') {
			return (
				<div>
				<div className='lead' >
					<Glyphicon style={{ top: 3, paddingRight: 5, fontSize: 21 }} glyph='hand-right'/>
					<HtmlSpan html={ page.instruction } />
				</div>
				{ problem }
				</div>
			);
		}

		// Build panel and return for tutorials that don't require the correct answer.
		return (
			<div className={style} style={{ }}>
				<div className='panel-heading'>{title}</div>
				<div className='panel-body'>
					<HtmlDiv className='' 
						style={{ paddingBottom: 10}} 
						html={ page.instruction } />
					{ problem }
					{ validate_button }
				</div>
			</div>
		);
	}


	// Render 
	render()       {
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
						<Panel >
							<Table style={{ margin: 0}} >
								<tbody>
								<tr>
									<td style={titleTdStyle}>  
										<span>Progress</span>
									</td>
									<td style={leftTdStyle}>
										{ build_score(this.props.level.pages) }
									</td>
									<td style={rightTdStyle}>
										<Button 
											bsStyle='link' disabled={this.props.isLoading}
											href={'/ifgame/'+this.props.level.code } 
											>Exit</Button>
										{ next_button }
									</td>
								</tr>
								</tbody>
							</Table>
						</Panel>
					</form>
				</div>
				{ this._render_fullpage_invisible_div() }
				{ this._render_page_feedback_popup(page) }
				{ this._render_page_feedback_inline(page, button, orientation) }
			</div>
		);
	}
}
