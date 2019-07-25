// @flow
import React from 'react';
import { HtmlDiv } from './../components/Misc';
import { fill_template } from './../../shared/template.js';

import ExcelTable from './ExcelTable';
import Choice from './Choice';
import Parsons from './Parsons';
import Text from './Text';

import type { LevelType, PageType } from './IfTypes';
import type { Node } from 'react';


type ScorePropsType = {
	page: PageType,
	i: number
};

class IfLevelDebugPage extends React.Component<ScorePropsType> {
	
	render(): Node {
		const page = this.props.page;

		const t = (s) => fill_template(s, page.template_values);

		const desc = t(page.description);
		const inst = t(page.instruction);

		// Figure out which control to use for the page.
		let problem, solution;

		if(page.type === 'IfPageFormulaSchema' || page.type === 'IfPageHarsonsSchema') {
			// Show solution?
			if(page.solution_f && page.solution_f.length > 0) {
				solution = (
					<div>
						Solution: <code>{ t(page.solution_f) }</code>, Correct <code>{page.correct ? 'True' : 'False'}</code>, 
						KCs: <code>{ page.kcs.reduce( (kc,accum) => accum+ ' '+ kc, '' )}</code>

					</div>
				);
			}
			
			problem = (
				<Card >
					<Card.Body>
						<HtmlDiv className='lead' html={ inst } />
						<ExcelTable page={page} readonly={true} editable={false}  handleChange={ () => {} }  />
						<div style={{ textAlign:  'right', fontSize: 8, color: 'gray' }}>{ page.type }</div>
					</Card.Body>
				</Card>
			);

		} else if(page.type === 'IfPageTextSchema') {
			problem = (<div>
					<Text page={page} editable={false} handleChange={ () => {} }/>
				</div>);

		} else if(page.type === 'IfPageParsonsSchema') {
			problem = (<div>
					<Parsons page={page} editable={false} show_solution={true} handleChange={ () => {} } />
				</div>);

		} else if(page.type === 'IfPageChoiceSchema') {
			// Show range of choice only if the user was wrong.  If no right answer,
			// then correct will be null.
			problem = (<div>
					<Choice page={page} editable={false} show_solution={page.correct === false}  handleChange={ () => {} }  />
				</div>);

		} else {
			throw new Error('Invalid type in IfLevelScore '+page.type);
		}

		return (<Card variant='success'>
				<Card.Body style={{ fontSize: 12}} >
					<HtmlDiv className='lead' html={ desc } />
					{ problem }
					{ solution }
				</Card.Body>
			</Card>);
	}
}


type LevelPropsType = {
	level: LevelType
};

export default class IfLevelDebug extends React.Component<LevelPropsType> {

	render(): Node {
		if(!this.props.level) return <div></div>;

		return (
			<div>
				{ this.props.level.pages.map( (p,i) => <IfLevelDebugPage level={this.props.level} page={p} i={i} key={i} /> ) }
			</div>
		);
	}
}



