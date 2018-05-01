//      
import React from 'react';
import { Panel, Popover, OverlayTrigger, Well } from 'react-bootstrap';

//import { IfPageSchema } from './../../shared/IfGame';
import { HtmlDiv, incorrect_glyphicon, correct_glyphicon, completed_glyphicon } from './../components/Misc';
import { PrettyDate } from './../components/Misc';

import ExcelTable from './ExcelTable';
import Choice from './Choice';
import Parsons from './Parsons';
import Text from './Text';

                                                     
                                  


                        
                         
  

class Person extends React.Component                  {

	render()       {
		const person = this.props.levels[0].username;

		const levels = this.props.levels.map( 
				(l           , i        )       => 
					<PersonLevel level={l} key={i} />);

		return (<div>
				User: { person }
				Levels: { levels }
				Date: <PrettyDate date={this.props.levels[0].updated} />
			</div>
		);
	}
}

                             
                 
  
class PersonLevel extends React.Component                       {
	render()       {

		// Figure out which control to use for the page.
		let problem;
		const page_at = this.props.level.pages[this.props.level.pages.length-1];
		const lead = <HtmlDiv className='lead' html={ page_at.description} />;
		const noop = () => {};

		if(page_at.type === 'IfPageFormulaSchema') {
			// Show solution?
					
			// Show problem.
			problem = (
				<Panel defaultExpanded={true}>
						<Panel.Heading>
							<Panel.Title toggle><div>{ page_at.client_f} </div></Panel.Title>
						</Panel.Heading>
						<Panel.Collapse >
							<Panel.Body>
								<ExcelTable page={page_at} handleChange={ noop } readonly={true} editable={false} />
							</Panel.Body>
						</Panel.Collapse>
					</Panel>
			);

		} else if(page_at.type === 'IfPageTextSchema') {
			problem = (<Text page={page_at} editable={false} handleChange={ noop } />);

		} else if(page_at.type === 'IfPageParsonsSchema') {
			problem = <Parsons page={page_at} editable={false} handleChange={ noop } show_solution={false} />;

		} else if(page_at.type === 'IfPageChoiceSchema') {
			problem = <Choice page={page_at} editable={false} handleChange={ noop } show_solution={true} />;

		} else {
			throw new Error('Invalid type in Monitor '+page_at.type);
		}


		return (
			<Panel>
				<Panel.Heading >
					Page {this.props.level.pages.length+1}
				</Panel.Heading>
				<Panel.Body>
					{ lead }
					{ problem }
				</Panel.Body>
			</Panel>
		);
	}
}



                  
                         
  

export default class Monitor extends React.Component            {
	constructor(props     ) {
		super(props);
		//(this: any).setHistory = this.setHistory.bind(this);
	}

	render()       {
		if(this.props.levels.length < 1) 
			return <div/>;
		
		// Sort levels into an object of people.
		const people = this.props.levels.reduce( 
			(accum        , l           )         => {
				if(typeof accum[l.username] === 'undefined') {
					accum[l.username] = [];
				}
				accum[l.username].push(l);
				return accum;
			}, {});

		const p = [];
		for(let key in people) {
			if(people.hasOwnProperty(key)) {
				p.push( <Person key={key} levels={people[key]} /> );
			}
		}

		return (<div>
			{p}
			</div>
		);
	}
}




const build_score = (pages                 )      => pages.map( (p          , i        )      => {
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

