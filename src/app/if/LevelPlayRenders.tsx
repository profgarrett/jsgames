import React, { ReactElement } from 'react';

import {  Card  } from 'react-bootstrap';
import {  IStringIndexJsonObject, HtmlDiv, htmlDiv,
		HandPointRightGlyphicon, HtmlSpan } from '../components/Misc';


import ExcelTable from './IfPlayComponents/ExcelTable';
import Text from './IfPlayComponents/Text';
import Choice from './IfPlayComponents/Choice';
import NumberAnswer from './IfPlayComponents/NumberAnswer';
import Slider from './IfPlayComponents/Slider';
import ShortTextAnswer from './IfPlayComponents/ShortTextAnswer';
import LongTextAnswer from './IfPlayComponents/LongTextAnswer';
import Timer from './../components/Timer';
import SqlQuery from './IfPlayComponents/SqlQuery';

import { buildChart } from './charts/Charts';

import { fill_template } from '../../shared/template';
import { IfPageBaseSchema } from '../../shared/IfPageSchemas';



// Render a single page lead (instructions)
export function render_page_lead(page: IfPageBaseSchema, pageId: number): ReactElement {
	if(page.code === 'test') {
		// Do a custom animation to draw eye to the instruction
		// Ugly hack to get stylesheet and insert keyframes.

		if(page.description === '') return <></>;

		try {
			const stylesheet = document.styleSheets[0];
			const keyframes = `@keyframes quizIn${pageId} {
				0% { color: #d9edf7; background-color: #d9edf7; } 
				100% { color: #212529; background-color: white; }
				}`;
			stylesheet.insertRule(keyframes, stylesheet.cssRules.length);
		} catch(e) {
			// Ignore any errors generated here.
			// TODO: Some issue with Safari occasionally throws an error here. 
			//       Says that stylesheet.cssRules is null.
			console.error(e);
		}
		
		const t = `quizIn${pageId} 4s ease`;
		const style = {
			MozAnimation: t,
			WebkitAnimation: t,
			OAnimation: t,
			animation: t
		};
		const desc = fill_template(page.description, page.template_values);

		return (
			<Card style={ {marginBottom: '10px'} }>
				<Card.Header>Quiz Question</Card.Header>
				<Card.Body>
					<div style={ style }>
						<HtmlDiv ariaLive='alert' html={ ''+desc } />
					</div>
				</Card.Body>
			</Card>
			);

	} else {
		// Make a little prettier by replacing linebreaks with div.lead.
		// Looks better spacing-wise, as we have instructions below the lead in 
		// a div.lead.
		let desc = ''+fill_template(page.description, page.template_values);
		let sDescriptions: string[] = desc.split('<br/><br/>');

		let elDescriptions = sDescriptions.map( (d: string, i: number): ReactElement =>
				<HtmlDiv ariaLive='alert' className='lead' style={{ marginBottom: '1rem' }} key={i} html={ d } /> );

		return <div>{ elDescriptions }</div>;
	}
};


// Return a timer (if needed)
export  function render_timer(page: IfPageBaseSchema, selected_page_index, onTimeExpired: Function): ReactElement {
	
	if(page.time_limit === null) return <></>;
	return <Timer for_object={selected_page_index} time_limit={page.time_limit} onTimeout={ () => onTimeExpired }/>;
};



// Build out the chart
export function render_chart(page: IfPageBaseSchema ): ReactElement {
	if(page.chart_def !== null && typeof page.chart_def !== 'undefined') {
		return <div style={{height:'300px'}}>{buildChart(page.chart_def)}</div>;
	} else {
		return <></>;
	}
};




export function render_exercise_panel(
			page: IfPageBaseSchema, 
			validate_button: ReactElement, 
			isLoading: boolean, 
			handleChange: ( json: IStringIndexJsonObject ) => void,
			handleEnter: ( ) => void,
			handleSubmit: () => void,
			handleValidate: () => void ): ReactElement {

	let problem: ReactElement;
	const instruc = fill_template(page.instruction, page.template_values);

	// Build correct page.
	if(page.type === 'IfPageFormulaSchema' ) {
		problem = <ExcelTable page={page.toIfPageFormulaSchema()} 
					readonly={ isLoading }
					editable={ true } 
					onChange={handleChange}
					onValidate={handleValidate}
					onEnter={handleEnter} />;

	} else if(page.type === 'IfPageChoiceSchema') {
		problem = <Choice page={page.toIfPageChoiceSchema()} 
					readonly={ isLoading }
					editable={ true } 
					show_solution = { false }
					onChange={handleChange} />;

	} else if(page.type === 'IfPageTextSchema') {
		problem = <Text page={page.toIfPageTextSchema()} 
					editable={ true } 
					readonly = { isLoading }
					onChange={ handleChange } />;

	} else if(page.type === 'IfPageNumberAnswerSchema') {
		problem = <NumberAnswer page={page.toIfPageNumberAnswerSchema()} 
					readonly={ isLoading }
					editable={ true } 
					onChange={handleChange} 
					onSubmit={handleSubmit } />;

	} else if(page.type === 'IfPageShortTextAnswerSchema') {
		problem = <ShortTextAnswer page={page.toIfPageShortTextAnswerSchema()} 
					readonly={ isLoading }
					editable={ true } 
					onChange={handleChange} 
					onSubmit={handleSubmit } />;


	} else if(page.type === 'IfPageLongTextAnswerSchema') {
		problem = <LongTextAnswer page={page.toIfPageLongTextAnswerSchema()} 
					readonly={ isLoading }
					editable={ true } 
					onChange={handleChange} 
					onSubmit={handleSubmit } />;


	} else if(page.type === 'IfPageSliderSchema') {
		problem = <Slider page={page.toIfPageSliderSchema()} 
					readonly={ isLoading }
					editable={ true } 
					onChange={handleChange} />;



	} else if(page.type === 'IfPageSqlSchema') {
		problem = <SqlQuery page={page.toIfPageSqlSchema()} 
					readonly={ isLoading }
					editable={ true } 
					onChange={handleChange} 
					onValidate={handleValidate}
					onSubmit={handleSubmit } />;
					
	} else {
		throw new Error('Invalid type in IfLevelPlay '+page.type);
	}

	// If we're just looking at text, don't use the embedded panel.
	// We do need problem though, as it traps enter keypress.
	if(page.type === 'IfPageTextSchema') {
		return (
			<div className='lead' >
				<HandPointRightGlyphicon />
				<HtmlSpan html={ ''+instruc } />
				{ problem }
			</div>
		);
	}


	// Don't use embedded panels for required problems.
	if(page.code === 'tutorial' /*&& page.correct_required */) {
		return (
			<div>
			<div className='lead' >
				<HandPointRightGlyphicon />
				<HtmlSpan html={ ''+instruc } />
			</div>
			{ problem }
			</div>
		);		
	}

	if(page.code === 'test') {
		return (
			<div>
			<div className='lead' >
				<HandPointRightGlyphicon />
				<HtmlSpan html={ ''+instruc } />
			</div>
			{ problem }
			</div>
		);
	}

	// Build panel and return for tutorials that don't require the correct answer.
	// Note: Position =Inherit is needed for blockly.  If that's not there, then it
	// 	can't find the coordinates to move the div over.
	return (
		<Card style={{ position: 'inherit', marginTop: '1rem' }}>
			<Card.Body>
				<Card.Title>Optional Exercise</Card.Title>
				<Card.Text>
					{ htmlDiv( ''+instruc, '', { paddingBottom: '10'} ) }
					{ problem }
					{ validate_button }
				</Card.Text>
			</Card.Body>
		</Card>
	);
};