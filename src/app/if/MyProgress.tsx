import React, { ReactElement } from 'react';
import { IfLevels, IfLevelSchema, DEFAULT_TUTORIAL_LEVEL_LIST, GREEN_GRADE, PASSING_GRADE } from '../../shared/IfLevelSchema';
import { InputGroup, ButtonToolbar, DropdownButton, Dropdown, Table, Tooltip, OverlayTrigger, Button } from 'react-bootstrap';
import { getUserFromBrowser } from '../components/Authentication';

//import type { IfLevelType } from './../../app/if/IfTypes';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faMinus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { PrettyDate } from '../components/Misc';
import CSS from 'csstype';


// Make a pretty glyph for success / failure.
const glyph = (score: number|null, is_survey: boolean): JSX.Element|null => {
	if( score === null || typeof score === 'undefined') return null;

	// Survey, we don't care if they hit a certain score level or not.
	if(is_survey) {
		return <FontAwesomeIcon icon={faCheck} style={{ color: 'green'}} />;
	}

	if( score >= GREEN_GRADE ) return (<span>
		<OverlayTrigger 
				placement='top' 
				overlay={
					<Tooltip id='render_my_grades_tooltip'>
						{ score+'%' }
					</Tooltip>
				}
				>
			<FontAwesomeIcon icon={faThumbsUp} style={{ color: 'green'}} />
		</OverlayTrigger>
		</span>);
	
	if( score >= PASSING_GRADE ) return (<span>

		<OverlayTrigger placement='top' overlay={<Tooltip id='render_my_grades_tooltip'>{ score+'%' }</Tooltip>}>
			<FontAwesomeIcon icon={faThumbsUp} style={{ color: 'black'}}/>					
		</OverlayTrigger>
		</span>);


	return (<span>
		<OverlayTrigger placement='top' overlay={<Tooltip  id='render_my_grades_tooltip'>{ score+'%' }</Tooltip>}>
			<FontAwesomeIcon icon={faMinus} style={{color: 'orange'}}  />

		</OverlayTrigger>
		</span>);
	
};



interface iGrade {
	[key: string]: any
}

interface iSection {
	idsection: number;
	code: string;
	year: number;
	term: string;
	title: string;
	levels: string;
	opens: string;
	closes: string;
	role: string;
}

// Grades is loaded from the grades api.
// Contains 
// [
//		{ username: 'bob', tutorial: 100, math1: 23 }   <== 23 is 23%.  Undone tutorials are undefined.
//	]
//
// Sections are loaded from http://localhost:8080/api/sections/sections/
// [
//		{ idsection, code, year, term, opens, closes, levels, role }
// ]
//
// section.Levels are important, as they set the order and number of items to be completed.
// "code1,code2,code3"
// Used to mandate surveys and other useful items.
type PropsType = {
	sections: iSection[];
	grades: iGrade[];
	uncompleted_levels: IfLevelSchema[];
	onClickNewCode: (s: string) => void;
	onClickContinueLevel: (level: IfLevelSchema) => void;
};

type StateType = {
	section: iSection;
};

interface iGetLevelsReturn {
	code: string;
	title: string;
	description: string;
	review_available: boolean;
	tutorial_highest_grade: null | number;
	tutorial_incompleted_levels: IfLevelSchema[];
	review_highest_grade: null | number;
	review_incompleted_levels: IfLevelSchema[];
}


export default class MyProgress extends React.Component<PropsType, StateType> {

	constructor(props: any) {
		super(props);
		const s = window.localStorage.getItem('ExcelFunMyProgressSection')
		const sticky_section =  s == null ? false : JSON.parse( s );
		const a_of_matching = sticky_section ? props.sections.filter( s => s.idsection === sticky_section.idsection) : [];

		if(sticky_section !== null) {
			// Look to see if we've got a matching item.
			if(a_of_matching.length === 1) {
				// Set to that section.
				this.state = { section: a_of_matching[0] };
			} else {
				// Has a default, but isn't present in the list. Default to top
				this.state = { 
					section: props.sections.length > 0 ? props.sections[0] : null
				};		
			}
		} else {
			// No matching item. Use default on top.
			this.state = { 
				section: props.sections.length > 0 ? props.sections[0] : null
			};
		}

	}


	/**
		Return a table showing all of the tutorials.
	*/
	_render_table = (levels: iGetLevelsReturn[]): ReactElement => {
		let counter = 0;

		// Style
		const td_c: CSS.Properties = { textAlign: 'center', verticalAlign: 'middle', width: '6%' };
		const td_l: CSS.Properties = { textAlign: 'left', verticalAlign: 'middle'};
		const td_disabled = { ...td_c, color: 'lightgray'};

		// Return tds.
		const trs: ReactElement[] = [];
		let tds: ReactElement[] = [];


		// Add header row.
		const header_tr = (<tr key={'MyProgressRowTR'+counter++} >
				<th key={'MyProgressRowTD'+counter++} style={td_c}>Lesson</th>
				<th key={'MyProgressRowTD'+counter++} style={td_c}>Review</th>
				<th key={'MyProgressRowTD'+counter++} style={td_l}>Topic</th>
				<th key={'MyProgressRowTD'+counter++} style={td_l}>Description</th>
			</tr>);

		let is_survey = false; 
		

		// Add individual rows for each tutorial.
		for(let i=0; i<levels.length; i++) {
			const level = levels[i];
			tds = [];

			// If this is a survey, always show a green thumb. We don't want to show information on failed
			// survey setup questions.
			is_survey = level.code.substr(0, 6) === 'survey';

			// Build TDS
			tds.push(<td key={'MyProgressRowTD'+counter++} style={td_c}>{ 
					glyph( level.tutorial_highest_grade, is_survey ) 
				}</td>);

			if(level.review_available) {
				tds.push(<td key={'MyProgressRowTD'+counter++} style={td_c}>{ 
						glyph( level.review_highest_grade, is_survey )
					}</td>);
			} else {
				tds.push(<td key={'MyProgressRowTD'+counter++} style={td_disabled}>NA</td>);
			}

			tds.push(<td key={'MyProgressRowTD'+counter++} style={td_l}><Link to={'/ifgame/levels/'+level.code+'/'}>{ level.title }</Link></td>);

			if(this.state.section !== null && this.state.section.role === 'faculty') {
				tds.push(<td key={'MyProgressRowTD'+counter++} style={td_l}>{ levels[i].description }
						&nbsp;(<Link to={'/ifgame/leveldebug/'+level.code}>preview</Link>)
					</td>);
			} else {
				tds.push(<td key={'MyProgressRowTD'+counter++} style={td_l}>{ levels[i].description }</td>);
			}

			trs.push(<tr key={'MyProgressRow'+counter++}>{tds}</tr>);
		}

		// Push total row.
		/*
		trs.push( <tr>
				<td>Total</td>
				<td rowSpan={5}>{ grades.reduce( (sum, g) => g + sum, 0) / grades.length }</td>
			</tr>);
		*/


		return (<Table bordered style={{ fontSize: '80%', marginTop: 15 }}>
					<thead className='thead-dark'>{ header_tr }</thead>
					<tbody>
						{ trs }
					</tbody>
				</Table>);
	}



	/**
		Give the next clickable lesson
	*/
	_render_next_lesson = (levels: iGetLevelsReturn[]): React.ReactElement => {
		let is_survey = false;

		// Look through list of levels until we find the next that should be completed.
		for(let i=0; i<levels.length; i++) {
			const level = levels[i];
			is_survey = level.code.substr(0, 6) === 'survey';

			// If we are incomplete, suggest finishing.
			if(level.tutorial_incompleted_levels.length > 0) {

				return (<span>You are currently working on&nbsp;
							<Link to={'/ifgame/level/'+level.tutorial_incompleted_levels[0]._id+'/play'}>
								{level.title}</Link>&nbsp;
								(started <PrettyDate date={level.tutorial_incompleted_levels[0].created} />)
						</span>);
			}

			// If we score low, suggest continuing.
			// Note: Don't show for the any surveys or waivers.
			if(!is_survey) {
				if(  level.tutorial_highest_grade != null && level.tutorial_highest_grade < PASSING_GRADE) {
					return (<span>Your <b>{level.code}</b> lesson did not earn {PASSING_GRADE}%. 
						You should redo it to get a higher grade before continuing.
						<Button href='#' variant='primary' size='sm' style={{ marginLeft: 5, marginTop: -3 }}
							onClick={ e=> this.props.onClickNewCode(levels[i].code) } >Redo level</Button>
						</span>);
				}
			}
		}

		// We don't have a level to redo or continue.  See if there is a new one.
		// If we hit null, then we haven't done this tutorial yet.
		for(let i=0; i<levels.length; i++) {

			if(levels[i].tutorial_highest_grade === null ){
				return (<span>Begin the {levels[i].title} activity.
						<Button href='#' variant='primary' size='sm' style={{ marginLeft: 5, marginTop: -3 }}
							onClick={ e=> this.props.onClickNewCode(levels[i].code) } >Start!</Button>
						</span>);
			}
		}

		// If we haven't yet gotten an action, we must be done.
		return (<div>Good job completing all of the available tutorials!</div>);
		
	}



	/**
		Get a list of tutorials to complete.

		Pulls info from sections.  If any have a ?, then uses the given 
		default.
	*/
	get_list = (): string[] => {
		
		const list = this.props.sections.length === 0 || this.state.section.levels === null || this.state.section.levels === ''
			? DEFAULT_TUTORIAL_LEVEL_LIST 
			: this.state.section.levels.split(',');

		for(let i=0; i<list.length; i++) {
			if(list[i] === '?') {
				DEFAULT_TUTORIAL_LEVEL_LIST.map( l => list.push(l) );
			}
		}

		return list.filter( code => code !== '?');
	}

	/**
		Used to build out a datastructure useful for this display.

			{ 
				highest_tutorial_grade: null/98,
				highest_tutorial_grade: null/98,
				user_levels: [],
			}
	*/

	get_levels = (): iGetLevelsReturn[] => {
		const uncompleted_levels = this.props.uncompleted_levels;
		const grades = this.props.grades.length > 0 ? this.props.grades[0] : {};

		const list = this.get_list();

		// Go through each tutorial and build an object 
		const levels = list.map( code => {
			const l: iGetLevelsReturn = {
				code: code,
				title: '',
				description: '',
				review_available: false,

				tutorial_highest_grade: null,
				tutorial_incompleted_levels: new Array<IfLevelSchema>(),

				review_highest_grade: null,
				review_incompleted_levels:  new Array<IfLevelSchema>(),
			};

			// Build out information on the level.
			//console.log( l);
			//console.log( IfLevels );

			l.title = IfLevels.filter( l => l.code === code)[0].title;
			l.description = IfLevels.filter( l => l.code === code)[0].description;

			if(IfLevels.filter( l=> l.code === code+'review').length > 0) {
				l.review_available = true;
			}

			if(typeof grades[code] !== 'undefined') {
				l.tutorial_highest_grade = grades[code];
			}

			if(typeof grades[code+'review'] !== 'undefined') {
				l.review_highest_grade = grades[code+'review'];
			}

			l.tutorial_incompleted_levels = uncompleted_levels.filter( l => l.code === code );
			l.review_incompleted_levels = uncompleted_levels.filter( l => l.code === code+'review' );

			return l;
		});

		return levels;
	}

	handleSectionChange =  (eventKey: string | null, e: React.SyntheticEvent<unknown>): void => {
		const value = eventKey == null ? '' : eventKey;
		const sections = this.props.sections.filter( s => s.code === value);

		if(sections.length === 0) throw new Error('Invalid value section');

		// Save the current selected to localstorage. Useful for loading the page
		// to the last chosen item.
		window.localStorage.setItem('ExcelFunMyProgressSection', JSON.stringify(sections[0]));

		this.setState({ section: sections[0]});
	}



	render = (): ReactElement => {
		const grades = this.props.grades.length>0 ? this.props.grades[0] : {};
		const user = getUserFromBrowser();

		// Only a single grades entry should be returned.
		// [{ username: 'x', tutorial: 20, ... }
		if(this.props.grades.length > 1) throw new Error('Invalid length of data passed to IfNextTutorial');

		const levels = this.get_levels();
		
		const waiver_completed = typeof grades[ levels[0].code ] !== 'undefined';

		// If the user hasn't done anything, then have a friendlier title.
		const title = typeof grades.tutorial === 'undefined' 
				? 'Welcome to the Formula Trainer website!' 
				: 'Formula Trainer';

		const section = this.props.sections.length == 0 
				? null 
				: <p style={{ fontSize: 8, textAlign: 'right' }}><i>Course: {this.state.section.title}</i></p>;

		// If member of a section, as well as an admin for this course,
		let picker;

		if(this.props.sections.length > 0 && this.state.section.role === 'faculty') {
			const p = '?idsection=' + this.state.section.idsection;	

			// If super-admin, then show extra analysis link for questions data.
			const questions_link = user.isAdmin ? <Link key='link6' to={'/ifgame/questions'+p}>Question analysis</Link> : null;

			const course_links = (
				<InputGroup style={{ marginLeft: 3, marginTop: 3}}>
					View this section&apos;s&nbsp;
					<Link key='link2' to={'/ifgame/progress'+p}>progress</Link>,&nbsp;
					<Link key='link3' to={'/ifgame/recent'+p}>recent activity</Link>,&nbsp;
					<Link key='link4' to={'/ifgame/grades'+p}>grades</Link>&nbsp;and&nbsp;
					<Link key='link5' to={'/ifgame/kcs'+p}>learning</Link>.&nbsp;
					{ questions_link }		
				</InputGroup>
				);


			picker = (<ButtonToolbar>
					<DropdownButton 
						onSelect={this.handleSectionChange}
						variant='primary' 
						size='sm'
						title= {this.state.section.title} 
						key='select_code' id='select_code'>
							{ this.props.sections.map( (section,i) => 
								<Dropdown.Item
									key={'select_code_dropdownitem'+i} 
									eventKey={section.code}>{section.title}
								</Dropdown.Item> 
							)}
					</DropdownButton>
					{ course_links }
				</ButtonToolbar>);
		}

		const surveycharts_amt = (this.state.section !== null && this.state.section.levels === 'surveycharts_amt');

		// only show table *if* they've completed any mandatory surveys.
		const table =  waiver_completed && !surveycharts_amt
				? this._render_table(levels)
				: null;

		// Return card.
		return (
			<div className='card' style={{ backgroundColor: '#f5f5f5', marginBottom: 40 }}>
				<div className='card-body'>
					<div className='h5'>{title}</div>
					<div className='card-text'>
						{ picker }
						{ this._render_next_lesson(levels) }
						<span style={{ marginBottom: 10}} /> 
						{ table }
						{ section }
					</div>
				</div>
			</div>);
	}

}
