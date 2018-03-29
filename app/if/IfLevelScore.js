import React from 'react';
import PropTypes from 'prop-types';
//import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';
//import Tooltip from 'rc-slider';

import { IfPageSchema } from './../../shared/IfGame';
import { Panel, Well } from 'react-bootstrap';
import { HtmlDiv, SuccessGlyphicon, FailureGlyphicon } from './../components/Misc';
import ExcelTable from './ExcelTable';
import Parsons from './Parsons';


// Allows moving forward/backwards through history of a single page.
class HistorySlider extends React.Component {

	render() {
		const page = this.props.page;
		const style = { marginBottom:5, margin: 5};

		if(page.history.length === 0) throw new Error('HistorySlider needs history.length > 0');

		const first = page.history[0].created.getTime();
		const last = page.history[page.history.length-1].created.getTime();
		let i = 0;

		// Convert history to an obj keyed by index.
		const marks = page.history.reduce( (marks,obj) => {
			marks[i] = ''; // obj.created.toLocaleTimeString();
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
HistorySlider.propTypes = {
	page: PropTypes.object.isRequired,
	handleChange: PropTypes.func
}; 



class IfLevelScorePage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: this.props.page // state records which history event (if any) we are viewing 
		};
		this.setHistory = this.setHistory.bind(this);
	}
	
	// Update this.state to show different versions of the current page.
	setHistory(history_i) {
		const history = this.props.page.history[history_i];
		const json = { ...this.props.page.toJson(), ...history };

		// History items have created, which we don't want in a page.
		delete json['created'];

		const page = this.props.level.get_new_page(json);

		this.setState({ page });
	}

	render() {
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
								<ExcelTable page={page_at} editable={false} />;
							</Panel.Body>
						</Panel.Collapse>
					</Panel>
			);

		} else if(page_at.type === 'IfPageParsonsSchema') {
			// Show solution only if the user was wrong.
			problem = (
				<div>
					<Parsons page={page_at} editable={false} show_solution={!page_final.correct} />
					<HistorySlider page={page_at} handleChange={this.setHistory} />
				</div>
			);

		} else {
			throw new Error('Invalid type in IfLevelScore '+page_at.type);
		}

		return (
			<Panel key={i} bsStyle={ page_final.correct ? 'success' : 'danger' } >
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
IfLevelScorePage.propTypes = {
	level: PropTypes.object.isRequired,
	page: PropTypes.object.isRequired,
	i: PropTypes.number.isRequired
};



export default class IfLevelScore extends React.Component {

	render() {
		const level = this.props.level;
		
		if(!level) return <div></div>;

		// Use formulas with i to generate unique keys upon completion.
		const results = level.get_score_as_array(
				i => <SuccessGlyphicon key={'iflevelscorerenderscore'+i} />, 
				i => <FailureGlyphicon key={'iflevelscorerenderscore'+i} />);

		return (
			<div>
				<Well>
					<div style={{ textAlign: 'center' }}>
						<h3>You earned { level.get_score_correct() } of { level.get_score_attempted() }</h3>
						{ results.map( (result, i) => result(i) ) }
					</div>
				</Well>
				{ level.pages.map( (p,i) => <IfLevelScorePage level={level} page={p} i={i} key={i} /> ) }
			</div>
		);
	}
}
IfLevelScore.propTypes = {
	level: PropTypes.object.isRequired
};
