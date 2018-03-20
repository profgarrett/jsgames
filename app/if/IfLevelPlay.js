import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Button, Table } from 'react-bootstrap';
import { HtmlDiv, SuccessGlyphicon, FailureGlyphicon, ProgressGlyphicon } from './../components/Misc'
import ExcelTable from './ExcelTable';


export default class IfLevelPlay extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}


	// Signal to the container that this page has been finished.
	handleSubmit(e) {
		e.preventDefault();
		this.props.onSubmit();
	}


	// Tell owner that the value of the user's input has changed.
	handleChange(e) {
		this.props.onChange(e.target.value);
	}


	// Ensure a reasonable length for the solution.
	/*
	getValidationState() {
		const page = this.props.level.pages[this.props.selected_page_index];
		const length = page.client_f == null ? '' : page.client_f.length;
		if(length > 100) return 'error';

		// Check to see if (a) we have a solution, and if (b) our solution is correct.
		if(typeof page.solution_test_results.length !== 0) {
			console.log(page.correct);
			console.assert(page.correct !== 'null', 'IfLevelPlay.getValidationState: Null page.correct w solution_test_results');
			if(!page.correct) return 'error';
		}

		return null;
	}
	*/


	// Show the score with nice glyps
	_render_score(score) {
		let s = score;


		// Use formulas with i to generate unique keys upon completion.
		let results = s.toArray(
				i => <SuccessGlyphicon key={'iflevelplayrenderscore'+i} />, 
				i => <FailureGlyphicon key={'iflevelplayrenderscore'+i} />);

		results.push( i=> <ProgressGlyphicon key={'iflevelplayrenderscore'+i} /> ); 

		return results.map( (result, i) => result(i) );
	}


	render() {
		console.assert(this.props.selected_page_index < this.props.level.pages.length, 
			'Page '+this.props.selected_page_index+' is not valid in IfLevelPlay');

		let page = this.props.level.pages[this.props.selected_page_index];

		// Use dangerouslySetInnerHtml so that the description can use html characters.
		let lead = <HtmlDiv className='lead' html={ page.description } />;

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

		return (
			<div>
				<form name='c' onSubmit={this.handleSubmit}>
					{ lead }
					<ExcelTable page={page} editable={true} handleChange={this.handleChange} />
					<Panel >
						<Table style={{ margin: 0}} >
							<tbody>
							<tr>
								<td style={titleTdStyle}>  
									<span>Results</span>
								</td>
								<td style={leftTdStyle}>
									{ this._render_score(this.props.level.score) }
								</td>
								<td style={rightTdStyle}>
									<Button bsStyle='link' href={'/ifgame/'+this.props.level.code } >Exit</Button>
									<Button type='submit' bsStyle='primary'>Contine to next page</Button>
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
IfLevelPlay.propTypes = {
	level: PropTypes.object.isRequired,
	selected_page_index: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired
};
