//      
import React from 'react';
import ReactDom from 'react-dom';
                                  
import { Glyphicon, Panel, Button, Table, Popover, Overlay, OverlayTrigger, Modal } from 'react-bootstrap';
import { HtmlSpan, HtmlDiv, incorrect_glyphicon, correct_glyphicon, completed_glyphicon, progress_glyphicon} from './../components/Misc';

import ExcelTable from './ExcelTable';
import Text from './Text';
import Choice from './Choice';
import Parsons from './Parsons';

                                                     


// Build the score list at the bottom of the page.
const build_score = (pages                 )      => pages.map( (p          , i        )      => {
	let g = null;
	let title = '';
	let html = '';

	// Build the glyph to use for display.
	if(!p.completed) {
		// In progress
		title = 'In progress';
		html = '';
		g = progress_glyphicon();
	} else {
		// Finished

		if(p.correct_required) {
			// Tutorial page.
			title = 'Completed';
			html = p.description + 
				(p.toString().length > 0 ?
					'<br/><div class="well well-sm">'+ p.toString()+'</div>' :
					'');
			g = completed_glyphicon();
		} else {
			// Graded page
			if(p.correct) {
				title = 'Correct answer';
				html = p.description + '<br/><div style={background} class="well well-sm">'+p.toString()+'</div>';
				g = correct_glyphicon();
			} else {
				title = 'Incorrect answer';
				html = p.description + '<br/><div class="well well-sm">'+p.toString()+'</div>';
				g = incorrect_glyphicon();
			}
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





                  
                  
                             
                            
                          
                                
                        
                          
                   
  



export default class IfLevelPlay extends React.Component            {

	constructor(props     ) {
		super(props);
		(this     ).handleChange = this.handleChange.bind(this);
		(this     ).handleSubmit = this.handleSubmit.bind(this);
		(this     )._feedback_listen_for_enter = this._feedback_listen_for_enter.bind(this);
	}

	handleChange(new_value        ) {
		this.props.onChange(new_value);
	} 

	handleSubmit(e                                    ) {
		if(e) e.preventDefault();
		this.props.onSubmit();
	}

	// Render a single page.
	_render_page_lead(page          )       {
		if(!page.correct_required) {
			return (
				<Panel bsStyle='primary'>
					<Panel.Heading>
						<Panel.Title componentClass='h3'>Quiz Question</Panel.Title>
					</Panel.Heading>
					<Panel.Body collapsible={false}>
						<HtmlDiv html={ page.description } />
					</Panel.Body>
				</Panel>
				);
		} else {
			// Make a little prettier by replacing linebreaks with div.lead.
			// Looks better spacing-wise, as we have instructions below the lead in 
			// a div.lead.
			const descriptions = page.description.split('<br/><br/>');

			return descriptions.map( (d        , i        )       =>
					<HtmlDiv className='lead' key={i} html={ d } /> );
		}
	}


	// Render problem
	_render_page_problem(page          )       {
		if(page.type === 'IfPageFormulaSchema') {
			return <ExcelTable page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageParsonsSchema') {
			return <Parsons page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageChoiceSchema') {
			return <Choice page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						showSolution={false} 
						handleChange={this.handleChange} />;

		} else if(page.type === 'IfPageTextSchema') {
			return <Text page={page} 
						readonly={ !this.props.isLoading }
						editable={ true } 
						handleChange={this.handleChange} 
						handleSubmit={ () => this.handleSubmit() } />;
		} else {
			throw new Error('Invalid type in IfLevelPlay '+page.type);
		}
	}


	// Create buttons for the page.
	// Includes review pop-ups if needed.
	_render_page_buttons(page          )       {
		// Use a different color for the submission button if we are test v. tutorial.
		const that = this;

		//  Button.
		const button_style = page.correct_required ? 'success': 'primary'; 
		const submit = <Button id='iflevelplaysubmit' 
				type='submit' 
				bsStyle={button_style}
				disabled={this.props.isLoading}
				>
				Contine to next page</Button>;

		const exit = <Button 
				bsStyle='link' 
				disabled={this.props.isLoading}
				href={'/ifgame/'+this.props.level.code } 
				>Exit</Button>;


		// If we're not supposed to show feedback, then just return the buttons.
		if(!this.props.show_feedback) 
			return <div>{ exit } { submit}</div>;


		// Start listening for user input (enter key).
		document.addEventListener('keypress', this._feedback_listen_for_enter);

		// If this is a tutorial and they go it wrong, set continue text to try again.
		const next = page.code === 'tutorial' && !page.correct ? 'try again' : 'continue';

		// If no feedback, then don't create large element.
		if(typeof page.client_feedback === 'undefined' || 
				page.client_feedback === null ||
				page.client_feedback.length < 1 ) {

			// No feedback.
			const pop = (
				<Popover 
						id='renderpagefeedbackpopup'
						target={submit}
						>
						{ page.correct ? 
							<div style={{color: 'rgb(60, 118, 61)'}}>Correct!</div> : 
							<div style={{color: 'rgb(169, 68, 66)'}}>Incorrect answer</div>
						}
						Click or press <kbd>enter</kbd> to {next}.
					</Popover>
				);

			const div = (
				<div style={{
					position: 'fixed',
					top: 0, left: 0, right: 0, bottom: 0,
					zIndex: 100000,
					}}
					onClick={ (e     )      => {
						e.stopPropagation();
						that.props.onViewFeedback();
						document.removeEventListener('keypress', that._feedback_listen_for_enter);
					}}
					></div>
			);

			return (
				<div>
					{ exit }
					<Overlay 
						placement='left'
						target={()      => document.getElementById('iflevelplaysubmit') }
						overlay={pop}
						show={true}
						container={this}
						>
						{ pop }
					</Overlay>,
					{ submit }
					{ div }
				</div>
			);

		} else {
			// We have one or more specific items of feedback to tell the user.

			// Build specific feedback LIs.
			const f_li = page.client_feedback.map( (f        , i        )       => <li key={i}>{f}</li>);

			// Return full-screen feedback.
			return (
				<div>
					<div className='static-modal' style={{ textAlign: 'left'}} 
						onClick={ (e     )      => {
							e.stopPropagation();
							that.props.onViewFeedback();
							document.removeEventListener('keypress', that._feedback_listen_for_enter);
						}} >
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
								Click anywhere or press <kbd>enter</kbd> to {next}
							</Modal.Footer>
						</Modal.Dialog>
					</div>
					{ exit } 
					{ submit }
				</div>
			);
		}

	}


	// Function used as an event listender.  It will be added or removed from the
	// page as feedback is displayed/hidden.
	_feedback_listen_for_enter(event     )      {
		if(event.key === 'Enter' || event.key === 'Escape' || event.key === ' ') {
			this.props.onViewFeedback();
			document.removeEventListener( 'keypress', this._feedback_listen_for_enter);
		}
		event.preventDefault(); // cancel any keypress.
	}


	// Render 
	render()       {
		console.assert(this.props.selected_page_index < this.props.level.pages.length, 
			'Page '+this.props.selected_page_index+' is not valid in IfLevelPlay');

		let page = this.props.level.pages[this.props.selected_page_index];

		// Render the current page, or if we are reviewing last submission, n-1.
		// Use previous submitted index to figure out which to shown feedback on.
		// Once show_next_feedback is cleared, then we will revert to current page.
		if(this.props.show_feedback) {
			page = this.props.level.pages[this.props.show_feedback_on];
		}
		
		// Build results 
		const lead = this._render_page_lead(page);
		const results = build_score(this.props.level.pages);
		const problem = this._render_page_problem(page);
		const buttons = this._render_page_buttons(page);

		return (
			<div style={{position: 'relative' }}>
				<form name='c' onSubmit={this.handleSubmit}>
					<div style={{ opacity: this.props.show_feedback ? 0.5 : 1 }}>
						{ lead }
						<div className='lead'>
							<Glyphicon style={{ top: 3, paddingRight: 5, fontSize: 21 }} glyph='hand-right'/>
							<HtmlSpan className='lead' html={ page.instruction } />
						</div>
						{ problem }
					</div>
					<Panel >
						<Table style={{ margin: 0}} >
							<tbody>
							<tr>
								<td style={titleTdStyle}>  
									<span>Progress</span>
								</td>
								<td style={leftTdStyle}>
									{ results }
								</td>
								<td style={rightTdStyle}>
									{ buttons }
								</td>
							</tr>
							</tbody>
						</Table>
					</Panel>
				</form>

			</div>
		);
	}
}
