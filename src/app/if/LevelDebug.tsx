import React, { ReactElement } from 'react';
import { HtmlDiv } from '../components/Misc';
import { fill_template } from '../../shared/template';

import ExcelTable from './IfPlayComponents/ExcelTable';
import Text from './IfPlayComponents/Text';
import Choice from './IfPlayComponents/Choice';
import Parsons from './IfPlayComponents/Parsons';
import Harsons from './IfPlayComponents/Harsons';
import NumberAnswer from './IfPlayComponents/NumberAnswer';
import Slider from './IfPlayComponents/Slider';
import ShortTextAnswer from './IfPlayComponents/ShortTextAnswer';
import SqlQuery from './IfPlayComponents/SqlQuery';


import { IfLevelSchema } from '../../shared/IfLevelSchema';
import { IfPageBaseSchema, IfPageFormulaSchema, IfPageHarsonsSchema, IfPageChoiceSchema } from '../../shared/IfPageSchemas';

import { Container, Card, Row, Col, Breadcrumb, Button  } from 'react-bootstrap';

import { buildChart } from './charts/Charts';


type ScorePropsType = {
	page: IfPageBaseSchema,
	i: number
};

class LevelDebugPage extends React.Component<ScorePropsType> {
	
	// Build out the chart
	_render_chart = (page: IfPageBaseSchema ): ReactElement => {

		if(page.chart_def !== null && typeof page.chart_def !== 'undefined') {
			return <div style={{height:'400px'}}>{buildChart(page.chart_def)}</div>;
		} else {
			return <></>;
		}
	}


	// Build out the chart
	_render_tags = (page: IfPageBaseSchema ): ReactElement => {

		const tags: ReactElement[] = [];

		if(page.template_id !== null ) {
			tags.push(<li key='debug_tag_1'>template_id: <b>{ page.template_id }</b></li>)
		}
		if(typeof page.solution !== 'undefined' && page.solution !== null) {
			tags.push(<li key='debug_tag_2'>solution: <b>{ page.solution }</b></li>)
		}
		if(page.time_limit !== null ) {
			tags.push(<li key='debug_tag_3'>time_limit: <b>{ page.time_limit } seconds</b></li>)
		}

		if(tags.length === 0) return <></>;

		return <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>{ tags}</ul>;
	}


	render = (): ReactElement => {
		const page = this.props.page;
		const noop = (): void => { return };

		const t = (s: string) => fill_template(s, page.template_values);

		const desc = t(page.description);
		const inst = t(page.instruction);

		// Figure out which control to use for the page.
		let problem, solution;

		if(page.type === 'IfPageFormulaSchema' 
				|| page.type === 'IfPageHarsonsSchema' 
				|| page.type === 'IfPagePredictFormulaSchema') {
			// Show solution?

			let page2 = page.toIfPageFormulaSchema();

			if(page2.solution_f && page2.solution_f.length > 0) {
				solution = (
					<div>
						Solution: <code>{ t(page2.solution_f) }</code>, Correct <code>{page.correct ? 'True' : 'False'}</code>, 
						KCs: <code>{ page2.kcs.reduce( (kc: any,accum: any) => accum+ ' '+ kc, '' )}</code>

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
					<Text page={page.toIfPageTextSchema()} editable={false} handleSubmit={(noop)} handleChange={ () => {} }/>
				</div>);

		} else if(page.type === 'IfPageParsonsSchema') {
			problem = (<div>
					<Parsons page={page.toIfPageParsonsSchema()} editable={false} handleChange={ () => {} } />
				</div>);


		} else if(page.type === 'IfPageSliderSchema') {
			problem = (<div>
					<Slider page={page.toIfPageSliderSchema()} readonly={false} editable={false}  handleChange={ () => {} } handleSubmit={ () => {} } />
				</div>);

		} else if(page.type === 'IfPageShortTextAnswerSchema') {
			problem = (<div><ShortTextAnswer page={page.toIfPageShortTextAnswerSchema()} readonly={true} editable={false} handleChange={()=> {}} handleSubmit={()=> {} }/></div>);

		} else if(page.type === 'IfPageNumberAnswerSchema') {
			problem = (<div><ShortTextAnswer page={page.toIfPageNumberAnswerSchema()} readonly={true} editable={false} handleChange={()=> {}} handleSubmit={()=> {} }/></div>);

		} else if(page.type === 'IfPageSqlSchema') {
			problem = (<div><SqlQuery page={page.toIfPageSqlSchema()} readonly={true} editable={true} handleChange={()=> {}} handleSubmit={()=> {} }/></div>);

		} else if(page.type === 'IfPageChoiceSchema') {
			// Show range of choice only if the user was wrong.  If no right answer,
			// then correct will be null.
			
			problem = (<div>
					<Choice page={page.toIfPageChoiceSchema()} showSolution={true} editable={false}  handleChange={ () => {} }  />
				</div>);

		} else {
			console.log( page );
			throw new Error('Invalid type in IfLevelDebug '+page.type);
			
		}

		return (<Card bg='Success'>
				<Card.Body style={{ fontSize: 12}} >
					{ this._render_tags(page) }
					<HtmlDiv className='lead' html={ ''+desc } />
					<HtmlDiv className='lead' html={ ''+inst } />
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

export default class LevelDebug extends React.Component<LevelPropsType> {

	render = (): ReactElement => {
		if(!this.props.level) return <div></div>;

		return (
			<div>
				{ this.props.level.pages.map( (p,i) => <LevelDebugPage page={p} i={i} key={i} /> ) }
			</div>
		);
	}
}



