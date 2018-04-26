// @flow
import React from 'react';
import { Panel, Popover, OverlayTrigger, Well } from 'react-bootstrap';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';

//import { IfPageSchema } from './../../shared/IfGame';
import { HtmlDiv, incorrect_glyphicon, correct_glyphicon, completed_glyphicon } from './../components/Misc';

import ExcelTable from './ExcelTable';
import Choice from './Choice';
import Parsons from './Parsons';
import Text from './Text';

import type { LevelType, PageType } from './IfTypes';
import type { Node } from 'react';



type HistoryPropsType = {
	page: PageType,
	handleChange: (string) => void
};
type StateType = {};

// Allows moving forward/backwards through history of a single page.
class HistorySlider extends React.Component<HistoryPropsType, StateType> {

	render(): Node {
		const page = this.props.page;
		const style = { marginBottom:5, margin: 5};

		if(page.history.length === 0) throw new Error('HistorySlider needs history.length > 0');

		const first = page.history[0].created.getTime();
		const last = page.history[page.history.length-1].created.getTime();

		// Convert history to an obj keyed by index.
		let i = 0;
		const marks = page.history.reduce( (marks: Object /*, history_item: Object*/): any => {
			marks[i] = ''; // history_item.created.toLocaleTimeString();
			i++;
			return marks;
		}, {});

		return (
			<div style={style}>
				<Slider min={0} max={i-1} marks={marks} onChange={this.props.handleChange} defaultValue={last-first} />
			</div>

		);
	}
}



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
		const json = { ...this.props.page.toJson(), ...history };

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

		if(page_at.type === 'IfPageFormulaSchema') {
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

		const title_completed = 'You completed ' + 
				(level.pages.length - level.get_score_attempted())
				+ ' tutorial pages';
		const quiz_completed = level.get_score_attempted() > 0 ? 
				', and earned ' + level.get_score_correct() + 
				' of ' + level.get_score_attempted() + ' on the quiz pages' : '';

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


const build_score = (pages: Array<PageType>): any => pages.map( (p: PageType, i: number): any => {
	let g = null;
	let title = '';
	let html = '';

	// Build the glyph to use for display.
	if(!p.completed) {
		throw new Error('Can not view score for uncompleted');
	}

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

