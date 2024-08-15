
import React from 'react';
import { Popover, Card, OverlayTrigger } from 'react-bootstrap';

import { HtmlDiv, IncorrectGlyphicon, CorrectGlyphicon, CompletedGlyphicon, IStringIndexJsonObject } from '../components/Misc';
import { fill_template } from '../../shared/template';

import ExcelTable from './IfPlayComponents/ExcelTable';
import Text from './IfPlayComponents/Text';
import Choice from './IfPlayComponents/Choice';
import Parsons from './IfPlayComponents/Parsons';
import NumberAnswer from './IfPlayComponents/NumberAnswer';
import Slider from './IfPlayComponents/Slider';
import ShortTextAnswer from './IfPlayComponents/ShortTextAnswer';
import LongTextAnswer  from './IfPlayComponents/LongTextAnswer';
import SqlQuery from './IfPlayComponents/SqlQuery';
import HistorySlider from './HistorySlider';

import { buildChart } from './charts/Charts';
import { IfLevelSchema } from '../../shared/IfLevelSchema';

import { get_page_schema_as_class, IfPageBaseSchema, IfPageNumberAnswerSchema, IfPageFormulaSchema } from '../../shared/IfPageSchemas';
import type { ReactElement } from 'react';


interface ScorePropsType {
	level: IfLevelSchema,
	page: IfPageBaseSchema,
	i: number
}
interface ScoreStateType {
	page: IfPageBaseSchema;
}


export class LevelScorePage extends React.Component<ScorePropsType, ScoreStateType> {
	constructor(props: any) {
		super(props);
		this.state = {
			page: this.props.page // state records which history event (if any) we are viewing 
		};
	}
	
	// Update this.state to show different versions of the current page.
	setHistory = (history_param: number) => {
		const history = this.props.page.history.filter( (h: any) => h.code =='client_update')[history_param];
		const json = { client_f: '', created: '', ...this.props.page.toJson()};
		// @ts-ignore
		json.client_f = typeof history.client_f === 'undefined' ? '' : history.client_f;

		// History items have created, which we don't want in a page.
		// @ts-ignore
		if(typeof json.created !== 'undefined') delete json.created;

		const page = get_page_schema_as_class(json);

		this.setState({ page });
	}


	// Build out the chart
	_render_chart = (page: IfPageBaseSchema ): ReactElement => {

		if(page.chart_def !== null && typeof page.chart_def !== 'undefined') {
			return <div style={{height:'300px'}}>{buildChart(page.chart_def)}</div>;
		} else {
			return <></>;
		}
	}

	render = (): ReactElement => {
		const i = this.props.i;
		let page_final = this.props.page;
		let page_at = this.state.page;
		const desc = fill_template(page_final.description, page_final.template_values);
		const inst = fill_template(page_final.instruction, page_final.template_values);
		const history = this.props.page.history.filter( (h: any) => h.code =='client_update');
		const noop = () => {};

		let lead = <HtmlDiv className='lead' html={ ""+desc } />;


		// Figure out which control to use for the page.
		let problem, solution;


		if(page_at.type === 'IfPageFormulaSchema' || page_at.type === 'IfPageHarsonsSchema' || page_at.type === 'IfPagePredictFormulaSchema') {
			// Show solution?

			if(page_at.type === 'IfPageFormulaSchema' || page_at.type === 'IfPagePredictFormulaSchema') {
				page_at = page_at.toIfPageFormulaSchema();
				page_final = page_final.toIfPageFormulaSchema();
			} else {
				page_at = page_at.toIfPageHarsonsSchema();
				page_final = page_final.toIfPageHarsonsSchema();
			}

			solution = page_at.solution_f && page_at.solution_f.length > 0 
					? <div>Solution: <code>{ page_at.solution_f}</code></div>
					: null;
			
			// @ts-ignore
			const exceltable = <ExcelTable page={page_at} readonly={true} editable={false} onChange={ noop }/>

			problem = (
				<Card >
					<Card.Body>
						<Card.Title><div>{ page_final.client_f} </div></Card.Title>
						<HtmlDiv className='lead' html={ ''+inst } />
						<HistorySlider history={history} onChange={this.setHistory} />
						{ exceltable }
						<div style={{ textAlign:  'right', fontSize: 8, color: 'gray' }}>{ page_final.type }</div>
					</Card.Body>
				</Card>
			);


		} else if(page_at.type === 'IfPageNumberAnswerSchema') {
			problem = <div><NumberAnswer page={page_at.toIfPageNumberAnswerSchema()} readonly={false} editable={false} onChange={ noop } onSubmit={ noop }/></div>;

		} else if(page_at.type === 'IfPageSliderSchema') {
			problem = <div><Slider page={page_at.toIfPageSliderSchema()} readonly={false} editable={false} onChange={ noop } /></div>;

		} else if(page_at.type === 'IfPageTextSchema') {
			problem = (<div><Text page={page_at.toIfPageTextSchema()} onChange={ noop }  readonly={true} editable={false} /></div>);

		} else if(page_at.type === 'IfPageParsonsSchema') {
			problem = (<div><Parsons page={page_at.toIfPageParsonsSchema()} onChange={noop } readonly={true} editable={false} show_solution={page_final.correct === false} /></div>);

		} else if(page_at.type === 'IfPageLongTextAnswerSchema') {
			problem = (<div><LongTextAnswer page={page_at.toIfPageLongTextAnswerSchema()} readonly={true} editable={false} show_solution={page_final.correct === false} onChange={noop} onSubmit={noop }/></div>);

		} else if(page_at.type === 'IfPageShortTextAnswerSchema') {
			problem = (<div><ShortTextAnswer page={page_at.toIfPageShortTextAnswerSchema()} readonly={true} editable={false} show_solution={page_final.correct === false} onChange={noop} onSubmit={noop }/></div>);

		} else if(page_at.type === 'IfPageChoiceSchema') {
			// Show range of choice only if the user was wrong.  If no right answer,
			// then correct will be null.
			problem = (<div><Choice page={page_at.toIfPageChoiceSchema()}  onChange={noop}  readonly={true} editable={false} show_solution={page_final.correct === false} /></div>);

		} else if(page_at.type === 'IfPageSqlSchema') {
			problem = (<div><SqlQuery page={page_at.toIfPageSqlSchema()} readonly={true} onValidate={() => {}} editable={false} show_solution={page_final.correct === false} onChange={noop} onSubmit={noop }/></div>);

			
		} else {
			throw new Error('Invalid type in IfLevelScore '+page_at.type);
		}



		return (<Card style={{ marginBottom: '30px'}}>
					<Card.Header >
						{ page_final.correct===null ? '' : (page_final.correct ? <CorrectGlyphicon fontSize='1em' /> : <IncorrectGlyphicon fontSize='1em' /> ) } Page {i+1} 
					</Card.Header>
					<Card.Body>
						{ lead }
						{ this._render_chart(page_final) }
						{ problem }
						{ solution }
					</Card.Body>
				</Card>);
	}
}



type LevelPropsType = {
	level: IfLevelSchema
};
export class LevelScore extends React.Component<LevelPropsType> {

	render = (): ReactElement => {
		const level = this.props.level;
		if(!level) return <div></div>;
		const pages = level.pages;

		const tutorial_completed = pages.filter( p => p.code === 'tutorial' && p.correct ).length;
		const tutorial_incomplete = pages.filter( p => p.code === 'tutorial' && !p.correct ).length;
		const test_correct = pages.filter( p => p.code === 'test' && p.correct ).length;
		const test_incorrect = pages.filter( p => p.code === 'test' && !p.correct ).length;

		const title_completed = 'You completed '+ tutorial_completed + 
				(tutorial_incomplete > 0 ? ' of ' + (tutorial_incomplete+tutorial_completed) : '') +
				' tutorial pages';

		const quiz_completed = test_incorrect+test_correct > 0 ? 
				', and earned ' + test_correct +
				' of ' + (test_correct+test_incorrect) + ' on the quiz pages' : '';

		// Use formulas with i to generate unique keys upon completion.
		const results = build_score(level.pages);

		return (
			<div>
				<Card style={{ marginBottom: '30px' }}>
					<Card.Body>
					<div style={{ textAlign: 'center' }}>
						<h3>{ title_completed}{quiz_completed}</h3>
						{ results }
					</div>
					</Card.Body>
				</Card>
				{ level.pages.map( (p,i) => <LevelScorePage level={level} page={p} i={i} key={i} /> ) }
			</div>
		);
	}
}


// Build the score list at the bottom of the page.
const build_score = (pages: Array<IfPageBaseSchema>): any => 
		pages.map( (p: IfPageBaseSchema, i: number): any => {
	let g: ReactElement;
	let title = '';
	let html = '';
	const desc = fill_template(p.description, p.template_values);

	if(p.code === 'tutorial') {
		//title = 'Completed';
		//html = desc + 
		//	(p.toString().length < 1 ? '' : '<br/><div class="card ">'+ p.toString()+'</div>');

		g = <CompletedGlyphicon color={ p.correct ? 'black' : 'gray' } />;
	} else if (p.code === 'test') {

		// Graded page
		if(p.correct) {
			//title = 'Correct answer';
			//html = desc + '<br/><div class="card ">'+p.toString()+'</div>'; // style={background} 
			g = <CorrectGlyphicon />;
		} else {
			//title = 'Incorrect answer';
			//html = desc + '<br/><div class="card">'+p.toString()+'</div>';
			g = <IncorrectGlyphicon/>;
		}
	} else {
		console.log('Problem without code. Most likely an older page')
		console.log(p);
		return null;
	}

	if(typeof g == 'undefined') return <></>;

	return (
		<span key={'iflevelplayrenderscore'+i}>
			{g}
		</span>
	);
});

