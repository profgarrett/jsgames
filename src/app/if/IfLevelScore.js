// @flow
import React from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';

import { HtmlDiv, IncorrectGlyphicon, CorrectGlyphicon, CompletedGlyphicon } from './../components/Misc';
import { fill_template } from './../../shared/template.js';

import ExcelTable from './ExcelTable';
import Choice from './Choice';
import Parsons from './Parsons';
import Text from './Text';
import HistorySlider from './HistorySlider';
import NumberAnswer from './NumberAnswer';

import type { LevelType, PageType } from './IfTypes';
import type { Node } from 'react';



type ScorePropsType = {
	level: LevelType,
	page: PageType,
	i: number
};
type ScoreStateType = {
	page: PageType
};


class IfLevelScorePage extends React.Component<ScorePropsType, ScoreStateType> {
	constructor(props: any) {
		super(props);
		this.state = {
			page: this.props.page // state records which history event (if any) we are viewing 
		};
		(this: any).setHistory = this.setHistory.bind(this);
	}
	
	// Update this.state to show different versions of the current page.
	setHistory(history_i: string) {
		const history = this.props.page.history[history_i];
		const json = this.props.page.toJson();
		json.client_f = history.client_f;

		// History items have created, which we don't want in a page.
		delete json['created'];

		const page = this.props.level.get_new_page(json);

		this.setState({ page });
	}

	render(): Node {
		const i = this.props.i;
		let page_final = this.props.page;
		let page_at = this.state.page;
		const desc = fill_template(page_final.description, page_final.template_values);
		const inst = fill_template(page_final.instruction, page_final.template_values);
		

		let lead = <HtmlDiv className='lead' html={ desc } />;


		// Figure out which control to use for the page.
		let problem, solution;


		if(page_at.type === 'IfPageFormulaSchema' || page_at.type === 'IfPageHarsonsSchema') {
			// Show solution?
			if(page_final.solution_f && page_final.solution_f.length > 0) {
				solution = (
					<div>Solution: <code>{ page_final.solution_f}</code></div>
				);
			}
					
			// Show problem.
			//defaultExpanded={!page_final.correct}
			problem = (
				<Card >
					<Card.Body>
						<Card.Title><div>{ page_final.client_f} </div></Card.Title>
						<HtmlDiv className='lead' html={ inst } />
						<HistorySlider page={page_at} handleChange={this.setHistory} />
						<ExcelTable page={page_at} readonly={true} editable={false} />
						<div style={{ textAlign:  'right', fontSize: 8, color: 'gray' }}>{ page_final.type }</div>
					</Card.Body>
				</Card>
			);


		} else if(page_at.type === 'IfPageNumberAnswerSchema') {
			problem = (<div>
					<NumberAnswer page={page_at} editable={false} />
				</div>);


		} else if(page_at.type === 'IfPageTextSchema') {
			problem = (<div>
					<Text page={page_at} editable={false} />
				</div>);


		} else if(page_at.type === 'IfPageParsonsSchema') {
			problem = (<div>
					<Parsons page={page_at} editable={false} show_solution={page_final.correct === false} />
				</div>);


		} else if(page_at.type === 'IfPageChoiceSchema') {
			// Show range of choice only if the user was wrong.  If no right answer,
			// then correct will be null.
			problem = (<div>
					<Choice page={page_at} editable={false} show_solution={page_final.correct === false} />
				</div>);


		} else {
			throw new Error('Invalid type in IfLevelScore '+page_at.type);
		}

/*
//key={i} 
				*/
		return (<Card variant={ page_final.correct===null ? 'info' : (page_final.correct ? 'success' : 'danger' ) }>
				<Card.Body>
					<Card.Title >
						Page {i+1}
					</Card.Title>
					{ lead }
					{ problem }
					{ solution }
				</Card.Body>
			</Card>);
	}
}


type LevelPropsType = {
	level: LevelType
};

export default class IfLevelScore extends React.Component<LevelPropsType, StateType> {

	render(): Node {
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
				<Card>
					<Card.Body>
					<div style={{ textAlign: 'center' }}>
						<h3>{ title_completed}{quiz_completed}</h3>
						{ results }
					</div>
					</Card.Body>
				</Card>
				{ level.pages.map( (p,i) => <IfLevelScorePage level={level} page={p} i={i} key={i} /> ) }
			</div>
		);
	}
}


// Build the score list at the bottom of the page.
const build_score = (pages: Array<PageType>): any => pages.map( (p: PageType, i: number): any => {
	let g = null;
	let title = '';
	let html = '';
	const desc = fill_template(p.description, p.template_values);

	if(p.code === 'tutorial') {

		title = 'Completed';
		html = desc + 
			(p.toString().length < 1 ? '' : '<br/><div class="card ">'+ p.toString()+'</div>');

		g = <CompletedGlyphicon color={ p.correct ? 'black' : 'gray' } />;
	} else if (p.code === 'test') {

		// Graded page
		if(p.correct) {
			title = 'Correct answer';
			html = desc + '<br/><div class="card ">'+p.toString()+'</div>'; // style={background} 
			g = <CorrectGlyphicon />;
		} else {
			title = 'Incorrect answer';
			html = desc + '<br/><div class="card">'+p.toString()+'</div>';
			g = <IncorrectGlyphicon/>;
		}
	} else {
		console.log(p);
		throw new Error('what?');
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

