import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Button, Table } from 'react-bootstrap';
import { HtmlDiv, SuccessGlyphicon, FailureGlyphicon, ProgressGlyphicon } from './../components/Misc'
import ExcelTable from './ExcelTable';
import Parsons from './Parsons';


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
	handleChange(new_value) {
		this.props.onChange(new_value);
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

		// Use formulas with i to generate unique keys upon completion.
		let results = this.props.level.get_score_as_array(
				i => <SuccessGlyphicon key={'iflevelplayrenderscore'+i} />, 
				i => <FailureGlyphicon key={'iflevelplayrenderscore'+i} />,
				i=> <ProgressGlyphicon key={'iflevelplayrenderscore'+i} /> ); 


		let problem;
		if(page.type === 'IfPageFormulaSchema') {
			problem = <ExcelTable page={page} editable={true} handleChange={this.handleChange} />;
		} else if(page.type === 'IfPageParsonsSchema') {
			problem = <Parsons page={page} editable={true} handleChange={this.handleChange} />;
		} else {
			throw new Error('Invalid type in IfLevelPlay '+page.type);
		}

		return (
			<div>
				<form name='c' onSubmit={this.handleSubmit}>
					{ lead }
					{ problem }
					<Panel >
						<Table style={{ margin: 0}} >
							<tbody>
							<tr>
								<td style={titleTdStyle}>  
									<span>Results</span>
								</td>
								<td style={leftTdStyle}>
									{ results.map( (r,i) => r(i) ) }
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
