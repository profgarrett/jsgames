// @flow
import React from 'react';
import { HtmlDiv } from './../components/Misc';
import { fill_template } from './../../shared/template.js';

import ExcelTable from './ExcelTable';
import Choice from './Choice';
import Parsons from './Parsons';
import Text from './Text';
import Slider from './Slider';
import ShortTextAnswer from './ShortTextAnswer';

import { IfLevelSchema } from './../../shared/IfLevelSchema';
import { IfPageBaseSchema, IfPageFormulaSchema, IfPageHarsonsSchema, IfPageChoiceSchema } from './../../shared/IfPageSchemas';
import type { Node } from 'react';
import { Container, Card, Row, Col, Breadcrumb, Button  } from 'react-bootstrap';


import { buildChart } from './charts/Charts.js';


type ScorePropsType = {
	page: IfPageBaseSchema,
	i: number
};

class IfLevelDebugPage extends React.Component<ScorePropsType> {
	
	// Build out the chart
	_render_chart(page: IfPageBaseSchema ): Node {

		if(page.chart_def !== null && typeof page.chart_def !== 'undefined') {
			return <div style={{height:'400px'}}>{buildChart(page.chart_def)}</div>;
		} else {
			return null;
		}
	}


	// Build out the chart
	_render_template_id(page: IfPageBaseSchema ): Node {

		if(page.template_id !== null ) {
			return <div style={{ paddingBottom: '10px'}}>template_id: <b>{ page.template_id }</b></div>;
		} else {
			return null;
		}
	}

	render(): Node {
		const page = this.props.page;

		const t = (s) => fill_template(s, page.template_values);

		const desc = t(page.description);
		const inst = t(page.instruction);

		// Figure out which control to use for the page.
		let problem, solution;

		if(page.type === 'IfPageFormulaSchema' || page.type === 'IfPageHarsonsSchema') {
			// Show solution?

			let page2 = page.toIfPageFormulaSchema();

			if(page2.solution_f && page2.solution_f.length > 0) {
				solution = (
					<div>
						Solution: <code>{ t(page2.solution_f) }</code>, Correct <code>{page.correct ? 'True' : 'False'}</code>, 
						KCs: <code>{ page2.kcs.reduce( (kc,accum) => accum+ ' '+ kc, '' )}</code>

					</div>
				);
			}
			
			problem = (
				<Card >
					<Card.Body>
						<ExcelTable page={page2} readonly={true} editable={false}  handleChange={ () => {} }  />
						<div style={{ textAlign:  'right', fontSize: 8, color: 'gray' }}>{ page.type }</div>
					</Card.Body>
				</Card>
			);

		} else if(page.type === 'IfPageTextSchema') {
			problem = (<div>
					<Text page={page.toIfPageTextSchema()} editable={false} handleSubmit={()=>{}} handleChange={ () => {} }/>
				</div>);

		} else if(page.type === 'IfPageParsonsSchema') {
			problem = (<div>
					<Parsons page={page.toIfPageParsonsSchema()} editable={false} show_solution={true} handleChange={ () => {} } />
				</div>);


		} else if(page.type === 'IfPageSliderSchema') {
			problem = (<div>
					<Slider page={page.toIfPageSliderSchema()} readonly={false} editable={false} show_solution={true} handleChange={ () => {} } handleSubmit={ () => {} } />
				</div>);

		} else if(page.type === 'IfPageShortTextAnswerSchema') {
			problem = (<div><ShortTextAnswer page={page.toIfPageShortTextAnswerSchema()} readonly={true} editable={false} show_solution={false} handleChange={()=> {}} handleSubmit={()=> {} }/></div>);


		} else if(page.type === 'IfPageChoiceSchema') {
			// Show range of choice only if the user was wrong.  If no right answer,
			// then correct will be null.
			
			problem = (<div>
					<Choice page={page.toIfPageChoiceSchema()} showSolution={true} editable={false} show_solution={true}  handleChange={ () => {} }  />
				</div>);

		} else {
			throw new Error('Invalid type in IfLevelScore '+page.type);
		}

		return (<Card variant='success'>
				<Card.Body style={{ fontSize: 12}} >
					{ this._render_template_id(page) }
					<HtmlDiv className='lead' html={ desc } />
					<HtmlDiv className='lead' html={ inst } />
					{ this._render_chart(page) }
					{ problem }
					{ solution }
				</Card.Body>
			</Card>);
	}
}


type LevelPropsType = {
	level: IfLevelSchema
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



