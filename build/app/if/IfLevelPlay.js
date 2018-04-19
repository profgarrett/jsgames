//      
import React from 'react';
                                  
//import PropTypes from 'prop-types';
import { Well, Panel, Button, Table, Popover, OverlayTrigger } from 'react-bootstrap';
import { HtmlSpan, HtmlDiv, incorrect_glyphicon, correct_glyphicon, completed_glyphicon, progress_glyphicon} from './../components/Misc';
import ExcelTable from './ExcelTable';
import Text from './Text';
import Choice from './Choice';
import Parsons from './Parsons';

                                                     


                  
                  
                             
                            
                         
  
                    


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



export default class IfLevelPlay extends React.Component                       {

	constructor(props     ) {
		super(props);
		(this     ).handleChange = this.handleChange.bind(this);
		(this     ).handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(new_value        ) {
		this.props.onChange(new_value);
	} 

	handleSubmit(e                                   ) {
		e.preventDefault();
		this.props.onSubmit();
	}

	render()       {
		console.assert(this.props.selected_page_index < this.props.level.pages.length, 
			'Page '+this.props.selected_page_index+' is not valid in IfLevelPlay');

		let page = this.props.level.pages[this.props.selected_page_index];

		// Use a different color for the submission button if we are test v. tutorial.
		const button_style = page.correct_required ? 'success': 'primary'; 

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

		// If we're in the middle of a quiz, add that header.
		// Use dangerouslySetInnerHtml so that the description can use html characters.
		let lead = null;

		if(!page.correct_required) {
			lead = (
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
			lead = <HtmlDiv className='lead' html={ page.description } />;
		}


		// Build results 
		let results = build_score(this.props.level.pages);

		let problem;
		if(page.type === 'IfPageFormulaSchema') {
			problem = <ExcelTable page={page} editable={true} handleChange={this.handleChange} />;
		} else if(page.type === 'IfPageParsonsSchema') {
			problem = <Parsons page={page} editable={true} handleChange={this.handleChange} />;
		} else if(page.type === 'IfPageChoiceSchema') {
			problem = <Choice page={page} editable={true} showSolution={false} handleChange={this.handleChange} />;
		} else if(page.type === 'IfPageTextSchema') {
			problem = <Text page={page} editable={true} handleChange={this.handleChange} />;
		} else {
			throw new Error('Invalid type in IfLevelPlay '+page.type);
		}

		return (
			<div>
				<form name='c' onSubmit={this.handleSubmit}>
					{ lead }
					<Well>
						<HtmlSpan html={ page.instruction } />
					</Well>
					{ problem }
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
