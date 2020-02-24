// @flow
import React, {useState } from 'react';
import { Table, Popover, Card, OverlayTrigger, Modal, Button } from 'react-bootstrap';
import { HtmlDiv, IncorrectGlyphicon, CorrectGlyphicon, CompletedGlyphicon } from './../components/Misc';
import { fill_template } from './../../shared/template.js';
import { getUserFromBrowser } from './../components/Authentication';

import ExcelTable from './ExcelTable';
import Choice from './Choice';
import Parsons from './Parsons';
import Text from './Text';
import HistorySlider from './HistorySlider';
import NumberAnswer from './NumberAnswer';
import Slider from './Slider';
import ShortTextAnswer from './ShortTextAnswer';

import { buildChart } from './charts/Charts.js';
import { IfLevelSchema } from './../../shared/IfLevelSchema';

import { get_page_schema_as_class, IfPageBaseSchema, IfPageNumberAnswerSchema, IfPageChoiceSchema, IfPageSliderSchema } from './../../shared/IfPageSchemas';
import type { Node } from 'react';


type LevelPropsType = {
	level: IfLevelSchema
};


// Constants
const DISTORTION_MEDIUM = 0.6;
const DISTORTION_SMALL = 0.3;


// Pop-up is used to shown results in a modal window.
function Popup(props) {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<div>
		<Button variant="link" onClick={handleShow}>
		{props.title}
		</Button>

		<Modal size={'xl'} centered show={show} onHide={handleClose}>
		<Modal.Header closeButton>
			<Modal.Title>{props.title}</Modal.Title>
		</Modal.Header>
		<Modal.Body>{ props.content }</Modal.Body>
		<Modal.Footer>
			<Button variant="secondary" onClick={handleClose}>
			Close
			</Button>
		</Modal.Footer>
		</Modal>
		</div>
	);
}

////////////////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////////////////

// find the matching choice
function find_choice(pages: Array<IfPageBaseSchema>, s: string ): IfPageChoiceSchema {
	const matching_pages = pages.filter( p => p.template_id === s);
	if(matching_pages.length !== 1) {
		//console.log(pages)
		throw new Error('Invalid length of '+s+', found ' + matching_pages.length);
	}
	return matching_pages[0].toIfPageChoiceSchema();
}

// Find the matching slider.
function find_slider(pages: Array<IfPageBaseSchema>, s: string ): IfPageSliderSchema {
	const matching_pages = pages.filter( p => p.template_id === s);
	if(matching_pages.length !== 1) {
		//console.log(pages)
		throw new Error('Invalid length of '+s+', found ' + matching_pages.length);
	}
	return matching_pages[0].toIfPageSliderSchema();
}

// Are the two responses the same? Give friendly span.
const sameYN = (d => {
	if( d.one.client === d.two.client) return <span>&nbsp;No, same answers</span>
	return <span>Yes, different answers ({ d.one.client}, { d.two.client })</span>;
});

// Find the ABS (positive) diff between two numbers
const differenceBetween = (d => {
	const max = Math.max(d.one.client, d.two.client);
	const min = Math.min(d.one.client, d.two.client);

	const diff = max-min;
	return Math.abs(diff);
});


// Convert a potentially null string into ''
const nz = (s_or_null: string | null ): string => {
	if(s_or_null === null) return '';
	return s_or_null;
}

// Find the difference between two numbers, using choice.
// Relies on choice to have int as first character.
const differenceBetweenChoice = (d => {
	const max = d.one.client_items.length;
	const one =  parseInt( nz(d.one.client).substr(0,1), 10);
	const two = parseInt( nz(d.one.client).substr(0,1), 10);
	const diff = Math.max(one, two) - Math.min(one, two);
	return Math.round( (diff *100) / max);
});

const isWrong = ( d=> {
	if(typeof d.two !== 'undefined' && d.two !== null) {
		if( !d.one.correct && !d.two.correct) return <span>&nbsp;Incorrect answers</span>;
		if( !d.one.correct ) return <span>&nbsp;Incorrect answer one</span>;
		if( !d.two.correct ) return <span>&nbsp;Incorrect answer two</span>;
	} else {
		if( !d.one.correct) return <span>&nbsp;Incorrect answer</span>;
	}
	return null;
});

// Build out the chart
const _render_chart = (page: IfPageBaseSchema ): Node => {
	if(page.chart_def !== null && typeof page.chart_def !== 'undefined') {
		return <div style={{height:'400px'}}>{buildChart(page.chart_def)}</div>;
	} else {
		return null;
	}
}

// Render a pop-up for either one or two choice pages.
const choicePagePopup = ( (title: string, p1: IfPageChoiceSchema, p2: ?IfPageChoiceSchema) => {
	let content = null;

	if(typeof p2 !== 'undefined' && p2 !== null) {
		content = (<Table style={{ fontSize: '60%' }}><tbody>
			<tr>
				<td>
					<p>{ p1.template_id }</p>
					<p>{ p1.description }</p>
					<p>{ p1.instruction }</p>
					{ _render_chart(p1) }
					<p>Correct: { p1.solution }</p>
					<Choice page={p1} editable={false} handleChange={()=>{}} showSolution={true}/>
				</td>
				<td>
					<p>{ p2.template_id }</p>
					<p>{ p2.description }</p>
					<p>{ p2.instruction }</p>
					{ _render_chart(p2) }
					<p>Correct: { p2.solution }</p>
					<Choice page={p2} editable={false} handleChange={()=>{}} showSolution={true}/>
				</td>
			</tr>
		</tbody></Table>);
		
	} else {
		content = (<div>
			<p>{ p1.template_id }</p>
			<p>{ p1.description }</p>
			<p>{ p1.instruction }</p>
			{ _render_chart(p1) }
			<p>Correct: { p1.solution }</p>
			<Choice page={p1} editable={false} handleChange={()=>{}} showSolution={true} />
		</div>);
	}

	return <Popup title={title} content={content} />;
});


const sliderPagePopup = ( (title: string, p1: IfPageSliderSchema, p2: IfPageSliderSchema) => {
	const content = <Table style={{ fontSize: '60%' }}><tbody>
		<tr>
			<td>
				<p>{ p1.template_id }</p>
				<p>{ p1.description }</p>
				<p>{ p1.instruction }</p>
				{ _render_chart(p1) }
				<p>Answered { p1.client } for { p1.solution }</p>
			</td>
			<td>
				<p>{ p2.template_id }</p>
				<p>{ p2.description }</p>
				<p>{ p2.instruction }</p>
				{ _render_chart(p2) }
				<p>Answered { p2.client } for { p2.solution }</p>
			</td>
		</tr>
		</tbody></Table>;

	return <Popup title={title} content={content} />;
});

const countTrue = ( arr: Array<boolean>): number => {
	const c = arr.reduce( (i, b) => (b ? i+1 : i), 0);
	return c;
}
const countFalse = ( arr: Array<boolean>): number => {
	const c = arr.reduce( (i, b) => (!b ? i+1 : i), 0);
	return c;
}
const averageNumbers = ( arr: Array<number>): number => {
	const sum = arr
			.filter( i => !isNaN(i) )
			.reduce( (sum, i) => sum+i, 0);
	
	return Math.round( sum / arr.length );
}



export class LevelScoreChart extends React.Component<LevelPropsType> {
	constructor(props: any) {
		super(props);
		(this: any)._render_vislit_bar_sliders = this._render_vislit_bar_sliders.bind(this);
		(this: any)._render_vislit_bar_choice = this._render_vislit_bar_choice.bind(this);
		(this: any)._render_vislit_line_choice = this._render_vislit_line_choice.bind(this);
		(this: any)._render_vislit_pie_choice = this._render_vislit_pie_choice.bind(this);
		(this: any)._render_vislit_scatter_choice = this._render_vislit_scatter_choice.bind(this);
		(this: any)._render_vislit_stackedbar_choice = this._render_vislit_stackedbar_choice.bind(this);
		(this: any)._render_vislit_waterfall_absolute_choice = this._render_vislit_waterfall_absolute_choice.bind(this);
		(this: any)._render_vislit_waterfall_relative_choice = this._render_vislit_waterfall_relative_choice.bind(this);
	}


	_render_vislit_bar_sliders( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];

		const slider_pairs = [
			{
				title: 'How similar were your two values?',
				distortion: 0,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_a1_ok'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_a2_ok'),
			},{
				title: 'How similar were your two values (with a small distortion)?',
				distortion: DISTORTION_SMALL,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_b1_ok'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_b2_smalldis')
			},{
				title: 'How similar were your two values (with a small distortion)?',
				distortion: DISTORTION_SMALL,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_c1_smalldis'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_c2_ok'),
			},{
				title: 'How similar were your two values (with a medium distortion)?',
				distortion: DISTORTION_MEDIUM,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_d1_ok'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_d2_meddis'),
			},{
				title: 'How similar were your two values (with a medium distortion)?',
				distortion: DISTORTION_MEDIUM,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_e1_meddis'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_e2_ok'),
			},{
				title: 'How similar were your two values?',
				distortion: 0,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_f1_ok'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_f2_ok'),
			},{
				title: 'How similar were your two values (with a small distortion)?',
				distortion: DISTORTION_SMALL,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_g1_ok'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_g2_smalldis')
			},{
				title: 'How similar were your two values (with a small distortion)?',
				distortion: DISTORTION_SMALL,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_h1_smalldis'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_h2_ok'),
			},{
				title: 'How similar were your two values (with a medium distortion)?',
				distortion: DISTORTION_MEDIUM,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_i1_ok'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_i2_meddis'),
			},{
				title: 'How similar were your two values (with a medium distortion)?',
				distortion: DISTORTION_MEDIUM,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_j1_meddis'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_j2_ok'),
			},{
				title: 'How similar were your two values?',
				distortion: 0,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_k1_ok'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_k2_ok'),
			},{
				title: 'How similar were your two values?',
				distortion: 0,
				one: find_slider(pages, 'vislit_bar_unlabeled_slider_l1_ok'),
				two: find_slider(pages, 'vislit_bar_unlabeled_slider_l2_ok'),
			}
		];
		console.log(slider_pairs);

		const slider_detailed_results = slider_pairs.map( (d,i) => {
			return (<div key={'vislitbar_'+i}>
				<span>Bar Chart Slider: { d.title }</span>
				<span>Difference between { differenceBetween(d) }%</span>
				{ sliderPagePopup('View', d.one, d.two) }
			</div>)
		});

		const slider_summary: Object = slider_pairs.reduce( (accum: Array<any>, pair: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === pair.title) {
					accum[i].results.push(differenceBetween(pair));
					return accum;
				}
			}
			// None found. Add first.
			console.log(pair);
			accum.push({
				title: pair.title, 
				results: [ differenceBetween(pair)] 
			});

			return accum;
		}, []);

		console.log(slider_summary);

	
		const slider_summary_results = slider_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Bar</td>
					<td>{ result.title }</td>
					<td></td>
					<td></td>
					<td>{ averageNumbers(result.results) }%</td>
				</tr>);
		});

		return {
			trs: slider_summary_results,
			divs: slider_detailed_results,
		}

	}



	_render_vislit_bar_choice( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];

		const choice_pairs = [
			{
				title: 'How similar were your two values?',
				distortion: 0,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_a1_ok'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_a2_ok'),
			},{
				title: 'Were were you unaffected by a small distortion?',
				distortion: DISTORTION_SMALL,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_b1_ok'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_b2_smalldis')
			},{
				title: 'Were were you unaffected by a small distortion?',
				distortion: DISTORTION_SMALL,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_c1_smalldis'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_c2_ok'),
			},{
				title: 'Were were you unaffected by a medium distortion?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_d1_ok'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_d2_meddis'),
			},{
				title: 'Were were you unaffected by a medium distortion?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_e1_meddis'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_e2_ok'),
			},{
				title: 'How similar were your two values?',
				distortion: 0,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_f1_ok'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_f2_ok'),
			},{
				title: 'Were were you unaffected by a small distortion?',
				distortion: DISTORTION_SMALL,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_g1_ok'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_g2_smalldis')
			},{
				title: 'Were were you unaffected by a small distortion?',
				distortion: DISTORTION_SMALL,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_h1_smalldis'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_h2_ok'),
			},{
				title: 'Were were you unaffected by a medium distortion?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_i1_ok'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_i2_meddis'),
			},{
				title: 'Were were you unaffected by a medium distortion?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_j1_meddis'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_j2_ok'),
			},{
				title: 'How similar were your two values?',
				distortion: 0,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_k1_ok'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_k2_ok'),
			},{
				title: 'How similar were your two values?',
				distortion: 0,
				one: find_choice(pages, 'vislit_bar_unlabeled_choice_l1_ok'),
				two: find_choice(pages, 'vislit_bar_unlabeled_choice_l2_ok'),
			}
		];


		const choice_detailed_results = choice_pairs.map( (d,i) => {
			return (<div key={'vislitbar_'+i}>
				Bar Chart Choice: { d.title }
				{ sameYN(d) }
				{ isWrong(d) }
				{ choicePagePopup('View', d.one, d.two) }
			</div>)
		});


		const choice_summary: Object = choice_pairs.reduce( (accum: Array<any>, pair: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === pair.title) {
					accum[i].results_tf.push(sameYN(pair));
					accum[i].results_difference.push(differenceBetweenChoice(pair));
					return accum;
				}
			}
			// None found. Add first.
			accum.push({
				title: pair.title, 
				results_tf: [ sameYN(pair) ],
				results_difference: [ differenceBetweenChoice(pair) ],
			});

			return accum;
		}, []);

		const choice_summary_results = choice_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Bar</td>
					<td>{ result.title }</td>
					<td>{ countTrue(result.results_tf) }</td>
					<td>{ countFalse(result.results_tf) }</td>
					<td>{ Math.round( countFalse(result.results_tf) *100 / result.results_tf.length) }%</td>
				</tr>);
		});

		return {
			trs: choice_summary_results,
			divs: choice_detailed_results 
		};
		
	}


	_render_vislit_pie_choice( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];

		const choice_pairs = [
			{
				title: 'Were you unaffected by a side pie slice?',
				distortion: 0,
				one: find_choice(pages, 'vislit_pie2d_select_A'),
				two: find_choice(pages, 'vislit_pie3d_select_A'),
			},{
				title: 'Were you unaffected by a side pie slice?',
				distortion: 0,
				one: find_choice(pages, 'vislit_pie2d_select_B'),
				two: find_choice(pages, 'vislit_pie3d_select_B')
			},{
				title: 'Were you unaffected by a side pie slice?',
				distortion: 0,
				one: find_choice(pages, 'vislit_pie2d_select_D'),
				two: find_choice(pages, 'vislit_pie3d_select_D'),
			},{
				title: 'Were you unaffected by a front pie slice?',
				distortion: 0,
				one: find_choice(pages, 'vislit_pie2d_select_C'),
				two: find_choice(pages, 'vislit_pie3d_select_C'),
			}
		];


		const choice_detailed_results = choice_pairs.map( (d,i) => {
			return (<div key={'vislitbar_'+i}>
				Pie Chart Choice: { d.title }
				{ sameYN(d) }
				{ isWrong(d) }
				{ choicePagePopup('View', d.one, d.two) }
			</div>)
		});


		const choice_summary: Object = choice_pairs.reduce( (accum: Array<any>, pair: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === pair.title) {
					accum[i].results_tf.push(sameYN(pair));
					accum[i].results_difference.push(differenceBetweenChoice(pair));
					return accum;
				}
			}
			// None found. Add first.
			accum.push({
				title: pair.title, 
				results_tf: [ sameYN(pair) ],
				results_difference: [ differenceBetweenChoice(pair) ],
			});

			return accum;
		}, []);

		const choice_summary_results = choice_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Pie</td>
					<td>{ result.title }</td>
					<td>{ countTrue(result.results_tf) }</td>
					<td>{ countFalse(result.results_tf) }</td>
					<td>{ Math.round( countFalse(result.results_tf) *100 / result.results_tf.length) }%</td>
				</tr>);
		});

		return {
			trs: choice_summary_results,
			divs: choice_detailed_results 
		};
		
	}


	_render_vislit_line_choice( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];

		const choice_pairs = [
			{
				title: 'Did you pick the same value?',
				distortion: 0,
				one: find_choice(pages, 'vislit_line_dollar_a1_ok'),
				two: find_choice(pages, 'vislit_line_dollar_a2_ok'),
			},{
				title: 'Were were you unaffected by a small distortion?',
				distortion: DISTORTION_SMALL,
				one: find_choice(pages, 'vislit_line_dollar_b1_smalldis'),
				two: find_choice(pages, 'vislit_line_dollar_b2_ok')
			},{
				title: 'Were were you unaffected by a small distortion?',
				distortion: DISTORTION_SMALL,
				one: find_choice(pages, 'vislit_line_dollar_c1_ok'),
				two: find_choice(pages, 'vislit_line_dollar_c2_smalldis'),
			},{
				title: 'Were were you unaffected by a medium distortion?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_line_dollar_d1_meddis'),
				two: find_choice(pages, 'vislit_line_dollar_d2_ok'),
			},{
				title: 'Were were you unaffected by a medium distortion?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_line_dollar_e1_ok'),
				two: find_choice(pages, 'vislit_line_dollar_e2_meddis'),
			},{
				title: 'Did you pick the same value?',
				distortion: 0,
				one: find_choice(pages, 'vislit_line_dollar_f1_ok'),
				two: find_choice(pages, 'vislit_line_dollar_f2_ok'),
			},{
				title: 'Were were you unaffected by a small distortion?',
				distortion: DISTORTION_SMALL,
				one: find_choice(pages, 'vislit_line_dollar_g1_smalldis'),
				two: find_choice(pages, 'vislit_line_dollar_g2_ok')
			},{
				title: 'Were were you unaffected by a small distortion?',
				distortion: DISTORTION_SMALL,
				one: find_choice(pages, 'vislit_line_dollar_h1_ok'),
				two: find_choice(pages, 'vislit_line_dollar_h2_smalldis'),
			},{
				title: 'Were were you unaffected by a medium distortion?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_line_dollar_i1_meddis'),
				two: find_choice(pages, 'vislit_line_dollar_i2_ok'),
			},{
				title: 'Were were you unaffected by a medium distortion?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_line_dollar_j1_ok'),
				two: find_choice(pages, 'vislit_line_dollar_j2_meddis'),
			},{
				title: 'Did you pick the same value?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_line_dollar_k1_ok'),
				two: find_choice(pages, 'vislit_line_dollar_k2_ok'),
			},{
				title: 'Did you pick the same value?',
				distortion: DISTORTION_MEDIUM,
				one: find_choice(pages, 'vislit_line_dollar_l1_ok'),
				two: find_choice(pages, 'vislit_line_dollar_l2_ok'),
			}
		];


		const choice_detailed_results = choice_pairs.map( (d,i) => {
			return (<div key={'vislitbar_'+i}>
				Line Chart Choice: { d.title }
				{ sameYN(d) }
				{ isWrong(d) }
				{ choicePagePopup('View', d.one, d.two) }
			</div>)
		});


		const choice_summary: Object = choice_pairs.reduce( (accum: Array<any>, pair: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === pair.title) {
					accum[i].results_tf.push(sameYN(pair));
					accum[i].results_difference.push(differenceBetweenChoice(pair));
					return accum;
				}
			}
			// None found. Add first.
			accum.push({
				title: pair.title, 
				results_tf: [ sameYN(pair) ],
				results_difference: [ differenceBetweenChoice(pair) ],
			});

			return accum;
		}, []);

		const choice_summary_results = choice_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Line</td>
					<td>{ result.title }</td>
					<td>{ countTrue(result.results_tf) }</td>
					<td>{ countFalse(result.results_tf) }</td>
					<td>{ Math.round( countFalse(result.results_tf) *100 / result.results_tf.length) }%</td>
				</tr>);
		});

		return {
			trs: choice_summary_results,
			divs: choice_detailed_results 
		};
		
	}




	_render_vislit_combo_choice( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];

		const choice_items = [
			{
				title: 'Did you pick the correct trend?',
				one: find_choice(pages, 'vislit_combo_trend_a'),
			},{
				title: 'Did you pick the correct trend?',
				one: find_choice(pages, 'vislit_combo_trend_b'),
			},{
				title: 'Did you identify the correct cause?',
				one: find_choice(pages, 'vislit_combo_cause_c'),
			},{
				title: 'Did you identify the correct value?',
				one: find_choice(pages, 'vislit_combo_highest_d'),
			}
		];


		const choice_detailed_results = choice_items.map( (d,i) => {
			return (<div key={'vislitcombo_'+i}>
				Combo Chart: { d.title }
				{ isWrong(d) }
				{ choicePagePopup('View', d.one ) }
			</div>)
		});


		const choice_summary: Object = choice_items.reduce( (accum: Array<any>, item: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === item.title) {
					accum[i].results_tf.push(item.one.correct);
					return accum;
				}
			}
			// None found. Add first.
			accum.push({
				title: item.title, 
				results_tf: [ item.one.correct ],
			});

			return accum;
		}, []);

		const choice_summary_results = choice_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Combo</td>
					<td>{ result.title }</td>
					<td>{ countTrue(result.results_tf) }</td>
					<td>{ countFalse(result.results_tf) }</td>
					<td>{ Math.round( countFalse(result.results_tf) *100 / result.results_tf.length) }%</td>
				</tr>);
		});

		return {
			trs: choice_summary_results,
			divs: choice_detailed_results 
		};
	}




	_render_vislit_stackedbar_choice( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];

		const choice_items = [
			{
				title: 'Did you identify the correct data point value?',
				one: find_choice(pages, 'vislit_stackedbar_product_a'),
			},{
				title: 'Did you identify the correct data point value?',
				one: find_choice(pages, 'vislit_stackedbar_product_b'),
			},{
				title: 'Did you identify the correct total value?',
				one: find_choice(pages, 'vislit_stackedbar_year_a'),
			},{
				title: 'Did you identify the correct total value?',
				one: find_choice(pages, 'vislit_stackedbar_year_b'),
			}
		];


		const choice_detailed_results = choice_items.map( (d,i) => {
			return (<div key={'vislitscatter'+i}>
				Stacked Bar Chart: { d.title }
				{ isWrong(d) }
				{ choicePagePopup('View', d.one ) }
			</div>)
		});


		const choice_summary: Object = choice_items.reduce( (accum: Array<any>, item: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === item.title) {
					accum[i].results_tf.push(item.one.correct);
					return accum;
				}
			}
			// None found. Add first.
			accum.push({
				title: item.title, 
				results_tf: [ item.one.correct ],
			});

			return accum;
		}, []);

		const choice_summary_results = choice_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Stacked Bar</td>
					<td>{ result.title }</td>
					<td>{ countTrue(result.results_tf) }</td>
					<td>{ countFalse(result.results_tf) }</td>
					<td>{ Math.round( countFalse(result.results_tf) *100 / result.results_tf.length) }%</td>
				</tr>);
		});

		return {
			trs: choice_summary_results,
			divs: choice_detailed_results 
		};
	}





	_render_vislit_waterfall_absolute_choice( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];
		
		const choice_items = [
			{
				title: 'Did you identify the ending positive value?',
				one: find_choice(pages, 'vislit_Waterfall_absolute_EndingPositiveA'),
			},{
				title: 'Did you identify the ending positive value?',
				one: find_choice(pages, 'vislit_Waterfall_absolute_EndingPositiveB'),
			},{
				title: 'Did you identify the ending negative value?',
				one: find_choice(pages, 'vislit_Waterfall_absolute_EndingNegativeA'),
			},{
				title: 'Did you identify the ending negative value?',
				one: find_choice(pages, 'vislit_Waterfall_absolute_EndingNegativeB'),
			},{
				title: 'Did you identify the negative value?',
				one: find_choice(pages, 'vislit_Waterfall_absolute_IdentifyNegativeA'),
			},{
				title: 'Did you identify the negative value?',
				one: find_choice(pages, 'vislit_Waterfall_absolute_IdentifyNegativeB'),
			},{
				title: 'Did you identify the positive value?',
				one: find_choice(pages, 'vislit_Waterfall_absolute_IdentifyPositiveA'),
			},{
				title: 'Did you identify the positive value?',
				one: find_choice(pages, 'vislit_Waterfall_absolute_IdentifyPositiveB'),
			}
		];


		const choice_detailed_results = choice_items.map( (d,i) => {
			return (<div key={'vislitscatter'+i}>
				Absolute Waterfall Chart: { d.title }
				{ isWrong(d) }
				{ choicePagePopup('View', d.one ) }
			</div>)
		});


		const choice_summary: Object = choice_items.reduce( (accum: Array<any>, item: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === item.title) {
					accum[i].results_tf.push(item.one.correct);
					return accum;
				}
			}
			// None found. Add first.
			accum.push({
				title: item.title, 
				results_tf: [ item.one.correct ],
			});

			return accum;
		}, []);

		const choice_summary_results = choice_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Absolute Waterfall</td>
					<td>{ result.title }</td>
					<td>{ countTrue(result.results_tf) }</td>
					<td>{ countFalse(result.results_tf) }</td>
					<td>{ Math.round( countFalse(result.results_tf) *100 / result.results_tf.length) }%</td>
				</tr>);
		});

		return {
			trs: choice_summary_results,
			divs: choice_detailed_results 
		};
	}

	_render_vislit_waterfall_relative_choice( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];

		const choice_items = [
			{
				title: 'Did you identify the ending value?',
				one: find_choice(pages, 'vislit_Waterfall_relative_EndingA'),
			},{
				title: 'Did you identify the ending value?',
				one: find_choice(pages, 'vislit_Waterfall_relative_EndingB'),
			},{
				title: 'Did you identify the change?',
				one: find_choice(pages, 'vislit_Waterfall_relative_IdentifyChangeA'),
			},{
				title: 'Did you identify the change?',
				one: find_choice(pages, 'vislit_Waterfall_relative_IdentifyChangeB'),
			},{
				title: 'Did you identify the relative nature of the chart?',
				one: find_choice(pages, 'vislit_Waterfall_relative_RelativeOrAbsoluteA'),
			},{
				title: 'Did you identify the relative nature of the chart?',
				one: find_choice(pages, 'vislit_Waterfall_relative_RelativeOrAbsoluteB'),
			}
		];


		const choice_detailed_results = choice_items.map( (d,i) => {
			return (<div key={'vislitscatter'+i}>
				Relative Waterfall Chart: { d.title }
				{ isWrong(d) }
				{ choicePagePopup('View', d.one ) }
			</div>)
		});


		const choice_summary: Object = choice_items.reduce( (accum: Array<any>, item: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === item.title) {
					accum[i].results_tf.push(item.one.correct);
					return accum;
				}
			}
			// None found. Add first.
			accum.push({
				title: item.title, 
				results_tf: [ item.one.correct ],
			});

			return accum;
		}, []);

		const choice_summary_results = choice_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Relative Waterfall</td>
					<td>{ result.title }</td>
					<td>{ countTrue(result.results_tf) }</td>
					<td>{ countFalse(result.results_tf) }</td>
					<td>{ Math.round( countFalse(result.results_tf) *100 / result.results_tf.length) }%</td>
				</tr>);
		});

		return {
			trs: choice_summary_results,
			divs: choice_detailed_results 
		};
	}




	_render_vislit_scatter_choice( pages: Array<IfPageBaseSchema> ): { trs: Array<Node>, divs: Array<Node>} {
		const summary = [];

		const choice_items = [
			{
				title: 'Did you pick the correct trend?',
				one: find_choice(pages, 'vislit_scatter_trend_a'),
			}
		];


		const choice_detailed_results = choice_items.map( (d,i) => {
			return (<div key={'vislitscatter'+i}>
				Scatter Chart: { d.title }
				{ isWrong(d) }
				{ choicePagePopup('View', d.one ) }
			</div>)
		});


		const choice_summary: Object = choice_items.reduce( (accum: Array<any>, item: any) => {
			// Find match
			for(let i=0; i<accum.length; i++) {
				if(accum[i].title === item.title) {
					accum[i].results_tf.push(item.one.correct);
					return accum;
				}
			}
			// None found. Add first.
			accum.push({
				title: item.title, 
				results_tf: [ item.one.correct ],
			});

			return accum;
		}, []);

		const choice_summary_results = choice_summary.map( (result,i) => {
			return (<tr key={'vislitbarsummary'+i}>
					<td>Scatter</td>
					<td>{ result.title }</td>
					<td>{ countTrue(result.results_tf) }</td>
					<td>{ countFalse(result.results_tf) }</td>
					<td>{ Math.round( countFalse(result.results_tf) *100 / result.results_tf.length) }%</td>
				</tr>);
		});

		return {
			trs: choice_summary_results,
			divs: choice_detailed_results 
		};
	}





	render(): Node {
		const level = this.props.level;
		const html_trs = [];
		const html_summary = [];

		if(!level) return <div></div>;

		if(level.code !== 'surveycharts_wu' && level.code !== 'surveycharts_amt')
			throw new Error('Invalid code ' + level.code);

		if(!level.completed) 
			throw new Error('You can not view analysis for uncompleted level');
		
		const pages = level.pages.filter( p => p.template_id !== null);

		const vislit_bar = pages.filter( p => p.template_id.substr(0, 'vislit_bar'.length) === 'vislit_bar')
		const vislit_combo = pages.filter( p => p.template_id.substr(0, 'vislit_combo'.length) === 'vislit_combo')
		const vislit_line = pages.filter( p => p.template_id.substr(0, 'vislit_line'.length) === 'vislit_line')
		const vislit_pie = pages.filter( p => p.template_id.substr(0, 'vislit_pie'.length) === 'vislit_pie')
		const vislit_scatter = pages.filter( p => p.template_id.substr(0, 'vislit_scatter'.length) === 'vislit_scatter')
		const vislit_stackedbar = pages.filter( p => p.template_id.substr(0, 'vislit_stackedbar'.length) === 'vislit_stackedbar')
		const vislit_waterfall = pages.filter( p => p.template_id.substr(0, 'vislit_Waterfall'.length) === 'vislit_Waterfall')

		const results = [
			this._render_vislit_waterfall_absolute_choice(vislit_waterfall),
			this._render_vislit_waterfall_relative_choice(vislit_waterfall),
			this._render_vislit_stackedbar_choice(vislit_stackedbar),
			this._render_vislit_scatter_choice(vislit_scatter),
			this._render_vislit_pie_choice(vislit_pie),
			this._render_vislit_line_choice(vislit_line),
			this._render_vislit_combo_choice(vislit_combo),
			this._render_vislit_bar_choice(vislit_bar),
			this._render_vislit_bar_sliders(vislit_bar),
		];

		/*
		return (<div><h3>Bar Chart - Choice</h3>
				<p><i>Completed { pages.length } pages</i></p>
				
				{ choice_detailed_results }
				{ slider_detailed_results }
			</div>);

		
		return (<div><h3>Bar Charts</h3>
				<p><i>Completed { pages.length } pages</i></p>
				<table style={{ border: 'solid 1px black'}}>
					<tbody style={{ border: 'solid 1px black'}}>
						<tr>
							<th>Code</th>
							<th>Title</th>
							<th>Yes</th>
							<th>No</th>
							<th>Avg. Error</th>
						</tr>
						{ choice_summary_results }
						{ slider_summary_results }
					</tbody>
				</table>
				{ choice_detailed_results }
				{ slider_detailed_results }
			</div>);
		*/

		const user = getUserFromBrowser();

		const details = (user.username === 'garrettn')
			? <div><h3>Detailed Results</h3>
						{ results.map( r => r.divs ) }</div>
			: null;

		return (
			<div>
				<Card>
					<Card.Body>
						<Table>
						<tbody>
							<tr>
								<th>Chart Type</th>
								<th>Task</th>
								<th>Correct Answers</th>
								<th>Incorrect Answers</th>
								<th>Avg. Error</th>
							</tr>
							{ results.map( r => r.trs  ) }
						</tbody>
						</Table>
						{ details }
					</Card.Body>
				</Card>
			</div>
		);
	}
};