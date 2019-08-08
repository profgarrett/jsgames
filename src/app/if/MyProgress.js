// @flow
import React from 'react';

import { IfLevelSchema } from './../../shared/IfLevel';

import type { Node } from 'react';
import { InputGroup, ButtonToolbar, DropdownButton, Dropdown, Table, Tooltip, OverlayTrigger, Button } from 'react-bootstrap';
import { IfLevels } from './../../shared/IfGame';
import { getUserFromBrowser } from './../components/Authentication';

//import type { IfLevelType } from './../../app/if/IfTypes';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faMinus } from '@fortawesome/free-solid-svg-icons';
import { PrettyDate } from './../components/Misc';

/*
	List of tutorials that should be shown as a row for the table
	Only used if it's not defined by the section.
*/
const DEFAULT_TUTORIAL_LEVEL_LIST = [
	'tutorial', 'math1', 'math2', 'math3',
	'functions1', 'functions2', 
	'if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8',
	'math4'];



const GREEN_GRADE = 85;
const PASSING_GRADE = 74;



// Make a pretty glyph for success / failure.
const glyph = score => {
	if( score === null || typeof score === 'undefined') return '';

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



// Grades is loaded from the grades api.
// Contains 
// [
//		{ username: 'bob', tutorial: 100, math1: 23 }   <== 23 is 23%.  Undone tutorials are undefined.
//	]
//
// Sections are loaded from http://localhost:8080/api/ifgame/sections/
// [
//		{ idsection, code, year, term, opens, closes, levels, role }
// ]
//
// section.Levels are important, as they set the order and number of items to be completed.
// "code1,code2,code3"
// Used to mandate surveys and other useful items.
type PropsType = {
	sections: Array<any>,
	grades: Array<any>,
	uncompleted_levels: Array<IfLevelSchema>,
	onClickNewCode: Function,
	onClickContinueLevel: Function
};

type StateType = {
	section: Object
};

export default class MyProgress extends React.Component<PropsType, StateType> {

	constructor(props: any) {
		super(props);
		this.state = { 
			section: this.props.sections.length > 0 ? this.props.sections[0] : null
		};

		(this: any).handleSectionChange = this.handleSectionChange.bind(this);
	}


	/**
		Return a table showing all of the tutorials.
	*/
	_render_table(levels: Array<Object>): Node {
		let counter = 0;
		const user = getUserFromBrowser();

		// Style
		const td_c = { textAlign: 'center', verticalAlign: 'middle', width: '6%' };
		const td_l = { textAlign: 'left', verticalAlign: 'middle'};
		const td_disabled = { ...td_c, color: 'lightgray'};

		// Return tds.
		const trs = [];
		let tds = [];


		// Add header row.
		const header_tr = (<tr key={'MyProgressRowTR'+counter++} >
				<th key={'MyProgressRowTD'+counter++} style={td_c}>Lesson</th>
				<th key={'MyProgressRowTD'+counter++} style={td_c}>Review</th>
				<th key={'MyProgressRowTD'+counter++} style={td_l}>Topic</th>
				<th key={'MyProgressRowTD'+counter++} style={td_l}>Description</th>
			</tr>);

		// Add individual rows for each tutorial.
		for(let i=0; i<levels.length; i++) {
			tds = [];

			// Build TDS
			tds.push(<td key={'MyProgressRowTD'+counter++} style={td_c}>{ glyph( levels[i].tutorial_highest_grade ) }</td>);

			if(levels[i].review_available) {
				tds.push(<td key={'MyProgressRowTD'+counter++} style={td_c}>{ glyph( levels[i].review_highest_grade ) }</td>);
			} else {
				tds.push(<td key={'MyProgressRowTD'+counter++} style={td_disabled}>NA</td>);
			}

			tds.push(<td key={'MyProgressRowTD'+counter++} style={td_l}><Link to={'/ifgame/levels/'+levels[i].code+'/'}>{ levels[i].title }</Link></td>);

			if(this.state.section !== null && this.state.section.role === 'faculty') {
				tds.push(<td key={'MyProgressRowTD'+counter++} style={td_l}>{ levels[i].description }
						&nbsp;(<Link to={'/ifgame/leveldebug/'+levels[i].code}>preview</Link>)
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
	_render_next_lesson(levels: Array<Object>): Node {

		// Look through list of levels until we find the next that should be completed.
		for(let i=0; i<levels.length; i++) {

			// If we are incomplete, suggest finishing.
			if(levels[i].tutorial_incompleted_levels.length > 0) {

				return (<span>You are currently working on&nbsp;
							<Link to={'/ifgame/level/'+levels[i].tutorial_incompleted_levels[0]._id+'/play'}>
								{levels[i].title}</Link>&nbsp;
								(started <PrettyDate date={levels[i].tutorial_incompleted_levels[0].created} />)
						</span>);
			}

			// If we score low, suggest continuing.
			if(levels[i].tutorial_highest_grade !== null && 
					levels[i].tutorial_highest_grade < PASSING_GRADE) {
				return (<span>Your <b>{levels[i].code}</b> lesson did not earn {PASSING_GRADE}%. 
						You should redo it to get a higher grade before continuing.
						<Button href='#' variant='primary' size='sm' style={{ marginLeft: 5, marginTop: -3 }}
							onClick={ e=> this.props.onClickNewCode(levels[i].code, e) } >Redo level</Button>
						</span>);
			}
		}

		// We don't have a level to redo or continue.  See if there is a new one.
		// If we hit null, then we haven't done this tutorial yet.
		for(let i=0; i<levels.length; i++) {

			if(levels[i].tutorial_highest_grade === null ){
				return (<span>Begin the {levels[i].title} activity.
						<Button href='#' variant='primary' size='sm' style={{ marginLeft: 5, marginTop: -3 }}
							onClick={ e=> this.props.onClickNewCode(levels[i].code, e) } >Start!</Button>
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
	get_list(): Array<string> {

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
	get_levels(): Object {
		const uncompleted_levels = this.props.uncompleted_levels;
		const grades = this.props.grades.length > 0 ? this.props.grades[0] : {};

		const list = this.get_list();

		// Go through each tutorial and build an object 
		const levels = list.map( code => {
			let l = {
				code: code,
				title: '',
				description: '',
				review_available: false,

				tutorial_highest_grade: null,
				tutorial_incompleted_levels: [],

				review_highest_grade: null,
				review_incompleted_levels: [],
			};

			// Build out information on the level.
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

	handleSectionChange(value: string) {
		const sections = this.props.sections.filter( s => s.code === value);

		if(sections.length === 0) throw new Error('Invalid value section');

		this.setState({ section: sections[0]});
	}



	render(): Node {
		const grades = this.props.grades.length>0 ? this.props.grades[0] : {};

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
		let picker = null;
		if(this.props.sections.length > 0 && this.state.section.role === 'faculty') {
			let p = '?idsection=' + this.state.section.idsection;	
			let course_links = (
				<InputGroup style={{ marginLeft: 3, marginTop: 3}}>
					View this section&apos;s&nbsp;
					<Link key='link1' to={'/ifgame/recent'+p}>recent activity</Link>,&nbsp;
					<Link key='link2' to={'/ifgame/grades'+p}>grades</Link>, and &nbsp;
					<Link key='link3' to={'/ifgame/questions'+p}>questions</Link>
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

		// only show table *if* they've completed any mandatory surveys.
		const table =  !waiver_completed
				? null 
				: this._render_table(levels);

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
