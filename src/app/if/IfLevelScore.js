// @flow
import React from 'react';
import { Panel, Popover, OverlayTrigger, Well } from 'react-bootstrap';

import { HtmlDiv, incorrect_glyphicon, correct_glyphicon, completed_glyphicon } from './../components/Misc';

import ExcelTable from './ExcelTable';
import Choice from './Choice';
import Parsons from './Parsons';
import Text from './Text';
import HistorySlider from './HistorySlider';

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

		let lead = <HtmlDiv className='lead' html={ page_final.description} />;


		// Figure out which control to use for the page.
		let problem, solution;

		if(page_at.type === 'IfPageFormulaSchema' || page_at.type === 'IfPageHarsonsSchema') {
			// Show solution?
			if(page_final.solution_f && page_final.solution_f.length > 0) {
				solution = (
					<Panel.Footer>Solution: <code>{ page_final.solution_f}</code></Panel.Footer>
				);
			}
					
			// Show problem.
			problem = (
				<Panel defaultExpanded={!page_final.correct}>
						<Panel.Heading>
							<Panel.Title toggle><div>{ page_final.client_f} </div></Panel.Title>
						</Panel.Heading>
						<Panel.Collapse >
							<Panel.Body>
								<HistorySlider page={page_at} handleChange={this.setHistory} />
								<ExcelTable page={page_at} readonly={true} editable={false} />
							</Panel.Body>
						</Panel.Collapse>
					</Panel>
			);

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

		return (
			<Panel key={i} bsStyle={ page_final.correct===null ? 'info' : (page_final.correct ? 'success' : 'danger' ) } >
				<Panel.Heading >
					Page {i+1}
				</Panel.Heading>
				<Panel.Body>
					{ lead }
					{ problem }
				</Panel.Body>
				{ solution }
			</Panel>
		);
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
				<Well>
					<div style={{ textAlign: 'center' }}>
						<h3>{ title_completed}{quiz_completed}</h3>
						{ results }
					</div>
				</Well>
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


	if(p.code === 'tutorial') {

		title = 'Completed';
		html = p.description + 
			(p.toString().length < 1 ? '' : '<br/><div class="well well-sm">'+ p.toString()+'</div>');

		if(p.correct) {
			g = completed_glyphicon('black');
		} else {
			g = completed_glyphicon('gray');
		}
	} else if (p.code === 'test') {

		// Graded page
		if(p.correct) {
			title = 'Correct answer';
			html = p.description + '<br/><div class="well well-sm">'+p.toString()+'</div>'; // style={background} 
			g = correct_glyphicon();
		} else {
			title = 'Incorrect answer';
			html = p.description + '<br/><div class="well well-sm">'+p.toString()+'</div>';
			g = incorrect_glyphicon();
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

