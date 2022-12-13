import React, { ReactElement } from 'react';

import { Popover, OverlayTrigger, Modal } from 'react-bootstrap';
import {  HtmlDiv, 
		IncorrectGlyphicon, CorrectGlyphicon, 
		CompletedGlyphicon, ProgressGlyphicon} from '../components/Misc';


import { IfLevelSchema } from '../../shared/IfLevelSchema';
import { IfPageBaseSchema } from '../../shared/IfPageSchemas';
import { fill_template } from '../../shared/template';




function glyph( p: IfPageBaseSchema, i: number ): ReactElement {
	let g: ReactElement;
	let title = '';
	let html = '';
	const desc = fill_template(p.description, p.template_values);

	// Build the glyph to use for display.
	if(!p.completed) {
		// In progress
		title = 'In progress';
		html = ''+desc;
		g = <ProgressGlyphicon />;

	} else {
		// Finished
		
		if(p.code === 'tutorial') {

			title = 'Completed';
			html = desc + 
				(p.toString().length < 1 ? '' : '<br/><div class="well well-sm">'+ p.toString()+'</div>');

			g = <CompletedGlyphicon color={ p.correct ? 'black' : 'gray' } />;
			
		} else if (p.code === 'test') {

			// Graded page
			if(p.correct) {
				title = 'Correct answer';
				html = desc + '<br/><div class="well well-sm">'+p.toString()+'</div>'; // style={background} 
				g = <CorrectGlyphicon />;
			} else {
				title = 'Sorry, but that\'s not correct';
				html = desc + '<br/><div class="well well-sm">'+p.toString()+'</div>';
				g = <IncorrectGlyphicon />;
			}
		} else {
			throw new Error('Error building score');
		}

	}

	return (<OverlayTrigger 
					key={'iflevelplayrenderscore'+i}
					/*trigger='hover'*/
					placement='top' 
					overlay={
						<Popover id={'iflevelplayrenderscore_id_'+i}>
							<Popover.Header as='h3'>{title}</Popover.Header>
							<Popover.Body>
							<HtmlDiv html={html} />
							</Popover.Body>
						</Popover>}>
					<span>{g}</span>
			</OverlayTrigger>);
};


// Build the score list at the bottom of the page.
export default function level_play_score(pages: Array<IfPageBaseSchema>): ReactElement {
	let glyphs = pages.map( (p: IfPageBaseSchema, i: number): ReactElement => glyph(p, i) );
	return <div>{ glyphs }</div>;
};

