import React from 'react';
import PropTypes from 'prop-types';
//import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Panel, Well } from 'react-bootstrap';
import { HtmlDiv, SuccessGlyphicon, FailureGlyphicon } from './../components/Misc';
import ExcelTable from './ExcelTable';



export default class IfLevelScore extends React.Component {
	constructor(props) {
		super(props);
	}

	_render_page(page, i) {
		let lead = <HtmlDiv className='lead' html={ page.description} />;

		let client_f = <div>{ page.client_f} </div>;
		let solution = page.solution_f && page.solution_f.length > 0 ? <Panel.Footer>Solution: <code>{ page.solution_f}</code></Panel.Footer> : null;

		return (
			<Panel key={i} bsStyle={ page.correct ? 'success' : 'danger' } >
				<Panel.Heading >
					Page {i+1}
				</Panel.Heading>
				<Panel.Body>
					{ lead }
					<Panel defaultExpanded={!page.correct}>
						<Panel.Heading>
							<Panel.Title toggle>{ client_f }</Panel.Title>
						</Panel.Heading>
						<Panel.Collapse >
							<Panel.Body>
								<ExcelTable page={page} editable={false} />
							</Panel.Body>
						</Panel.Collapse>
					</Panel>
				</Panel.Body>
				{ solution }
			</Panel>
		);
	}

	_render_score(score) {

		// Use formulas with i to generate unique keys upon completion.
		let results = score.toArray(
				i => <SuccessGlyphicon key={'iflevelscorerenderscore'+i} />, 
				i => <FailureGlyphicon key={'iflevelscorerenderscore'+i} />);

		return (
			<Well>
				<div style={{ textAlign: 'center' }}>
					<h3>You earned { score.correct } of { score.attempted}</h3>
					{ results.map( (result, i) => result(i) ) }
				</div>
			</Well>
		);
	}

	render() {
		let level = this.props.level;

		if(!level) return <div></div>;

		return (
			<div>
				{ this._render_score(level.score) }
				{ level.pages.map( (p,i) => this._render_page(p,i) ) }
			</div>
		);
	}
}
IfLevelScore.propTypes = {
	level: PropTypes.object.isRequired
};
