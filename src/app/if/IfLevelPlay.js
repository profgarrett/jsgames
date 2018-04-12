// @flow
import React from 'react';
import type { Node } from 'react';
//import PropTypes from 'prop-types';
import { Panel, Button, Table } from 'react-bootstrap';
import { HtmlDiv, IncorrectGlyphicon, CorrectGlyphicon, ProgressGlyphicon } from './../components/Misc';
import ExcelTable from './ExcelTable';
import Text from './Text';
import Choice from './Choice';
import Parsons from './Parsons';

import type { LevelType, ChoicePageType } from './IfTypes';


type PropsType = {
	level: LevelType,
	selected_page_index: number,
	onChange: (string) => void,
	onSubmit: (void) => void
};
type StateType = {};

export default class IfLevelPlay extends React.Component<PropsType, StateType> {

	constructor(props: any) {
		super(props);
		(this: any).handleChange = this.handleChange.bind(this);
		(this: any).handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(new_value: string) {
		this.props.onChange(new_value);
	} 

	handleSubmit(e: SyntheticEvent<HTMLButtonElement>) {
		e.preventDefault();
		this.props.onSubmit();
	}

	render(): Node {
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
				(i: number): any => <CorrectGlyphicon key={'iflevelplayrenderscore'+i} />, 
				(i: number): any => <IncorrectGlyphicon key={'iflevelplayrenderscore'+i} />,
				(i: number): any => <CorrectGlyphicon key={'iflevelplayrenderscore'+i} />,
				(i: number): any => <ProgressGlyphicon key={'iflevelplayrenderscore'+i} /> ); 

		// Make sure that last item is always a progress glyph.
		results.pop();
		results.push( (i: number): any => <ProgressGlyphicon key={'iflevelplayrenderscore'+i} />);


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
					{ problem }
					<Panel >
						<Table style={{ margin: 0}} >
							<tbody>
							<tr>
								<td style={titleTdStyle}>  
									<span>Results</span>
								</td>
								<td style={leftTdStyle}>
									{ results.map( (r: any,i: number): any => r(i) ) }
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
