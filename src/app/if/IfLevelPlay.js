// @flow
import React from 'react';
import type { Node } from 'react';
import { Glyphicon, Panel, Button, Table, Popover, OverlayTrigger, Modal } from 'react-bootstrap';
import { HtmlSpan, HtmlDiv, incorrect_glyphicon, correct_glyphicon, completed_glyphicon, progress_glyphicon} from './../components/Misc';

import ExcelTable from './ExcelTable';
import Text from './Text';
import Choice from './Choice';
import Parsons from './Parsons';

import type { LevelType, PageType } from './IfTypes';



// Build the score list at the bottom of the page.
const build_score = (pages: Array<PageType>): any => pages.map( (p: PageType, i: number): any => {
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





type PropsType = {
	level: LevelType,
	selected_page_index: number,
	onChange: (Object) => void,
	onSubmit: (void) => void
};
type StateType = {
	show_next_feedback: boolean,
	show_feedback_on: number
	/*
	last_feedback_shown: ?string,
	last_submitted_page_index: ?number
	*/
};



export default class IfLevelPlay extends React.Component<PropsType, StateType> {

	constructor(props: any) {
		super(props);
		(this: any).state = {
			show_next_feedback: false,
			show_feedback_on: -1
		};
		(this: any).handleChange = this.handleChange.bind(this);
		(this: any).handleSubmit = this.handleSubmit.bind(this);
		(this: any)._feedback_listen_for_enter = this._feedback_listen_for_enter.bind(this);
	}

	handleChange(new_value: Object) {
		this.props.onChange(new_value);
	} 

	/*
	static getDerivedStateFromProps( nextProps: PropsType, prevState: StateType): ?Object {
		const page = nextProps.level.pages[nextProps.selected_page_index];

		// If the page shown has changed from the last time we submitted, 
		//		or the feedback given has changed, then re-show it.
		// Index won't change if we have fixed something, and then resubmitted
		//		it (like a tutorial).
		debugger;
		if(	prevState.last_submitted_page_index !== nextProps.selected_page_index &&
			prevState.last_feedback_shown !== page.feedback ) {
			// See if there is any feedback to be shown.  If so, flag.
			if( page.feedback && page.feedback.length > 0 )
				return { 'show_feedback': true };
		}

		// No changes to state.
		return null;
	}
	*/

	handleSubmit(e: SyntheticEvent<HTMLButtonElement>) {
		const page = this.props.level.pages[this.props.selected_page_index];

		e.preventDefault();
		this.props.onSubmit();

		// Don't set state if we were looking at something that doesn't require a review.
		if(page.type !== 'IfPageTextSchema' && page.type !== 'IfPageChoiceSchema') {
			this.setState({ 
				show_next_feedback: true,
				show_feedback_on: this.props.selected_page_index
			});
		}
	}

	// Render a single page.
	_render_page_lead(page: PageType): Node {
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
			return <HtmlDiv className='lead' html={ page.description } />;
		}
	}

	// Render problem
	_render_page_problem(page: PageType): Node {
		if(page.type === 'IfPageFormulaSchema') {
			return <ExcelTable page={page} editable={true} handleChange={this.handleChange} />;
		} else if(page.type === 'IfPageParsonsSchema') {
			return <Parsons page={page} editable={true} handleChange={this.handleChange} />;
		} else if(page.type === 'IfPageChoiceSchema') {
			return <Choice page={page} editable={true} showSolution={false} handleChange={this.handleChange} />;
		} else if(page.type === 'IfPageTextSchema') {
			return <Text page={page} editable={true} handleChange={this.handleChange} />;
		} else {
			throw new Error('Invalid type in IfLevelPlay '+page.type);
		}
	}

	// If needed, render a pop-up giving feedback on the given submission.
	// Should generally be passed the previous page, but it's up to the calling to determine.
	_render_page_feedback(page: PageType): Node {
		const that = this;

		if(!this.state.show_next_feedback) return null;

		// If no feedback, then don't create element
		if(page.feedback === null || page.feedback.length < 1 ) return null;

		const f_li = page.feedback.map( (f: string, i: number): Node => <li key={i}>{f}</li>);

		document.addEventListener('keypress', this._feedback_listen_for_enter);

		// Feedback!  Return element.
		return (
			<div className='static-modal' 
				onClick={ (): any => {
					that.setState({'show_next_feedback': false});
					document.removeEventListener('keypress', that._feedback_listen_for_enter);
				}} >
				<Modal.Dialog>
				<Modal.Header>
				<Modal.Title>Feedback</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ul>
						{ f_li }
					</ul>
				</Modal.Body>
				<Modal.Footer>
					Click anywhere or press <kbd>enter</kbd> to continue
				</Modal.Footer>
				</Modal.Dialog>
			</div>
		);
	}


	// Function used as an event listender.  It will be added or removed from the
	// page as feedback is displayed/hidden.
	_feedback_listen_for_enter(event: any): any {
		if(event.key === 'Enter' || event.key === 'Escape' || event.key === ' ') {
			this.setState({ 'show_next_feedback': false });
			document.removeEventListener( 'keypress', this._feedback_listen_for_enter);
		}
		event.preventDefault(); // cancel any keypress.
	}

	// Render 
	render(): Node {
		console.assert(this.props.selected_page_index < this.props.level.pages.length, 
			'Page '+this.props.selected_page_index+' is not valid in IfLevelPlay');

		let page = this.props.level.pages[this.props.selected_page_index];

		// Render the current page, or if we are reviewing last submission, n-1.
		// Use previous submitted index to figure out which to shown feedback on.
		// Once show_next_feedback is cleared, then we will revert to current page.
		if(this.state.show_next_feedback) {
			page = this.props.level.pages[this.state.show_feedback_on];
		}
		
		// Use a different color for the submission button if we are test v. tutorial.
		const button_style = page.correct_required ? 'success': 'primary'; 
		
		// Build results 
		const lead = this._render_page_lead(page);
		const results = build_score(this.props.level.pages);
		const problem = this._render_page_problem(page);
		const review = this._render_page_feedback(page);

		return (
			<div>
				<form name='c' onSubmit={this.handleSubmit}>
					{ lead }
					<div className='lead'>
						<Glyphicon style={{ top: 3, paddingRight: 5, fontSize: 21 }} glyph='hand-right'/>
						<HtmlSpan className='lead' html={ page.instruction } />
					</div>
					{ problem }
					{ review }
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
									<Button bsStyle='link' href={'/ifgame/'+this.props.level.code } >Exit</Button>
									<Button type='submit' bsStyle={button_style}>Contine to next page</Button>
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
