import React, { ReactElement, JSX } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons/faThumbsUp';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import CSS from 'csstype';

import { IfLevels, IfLevelSchema, GREEN_GRADE, PASSING_GRADE } from '../../shared/IfLevelSchema';
import { PrettyDate } from '../components/Misc';

/*
	Tutorial progress rendering, lifted out of the old if/MyProgress.tsx when
	/ifgame was folded into the home page.

	What was dropped in the move: the section dropdown, the section.levels
	override, the faculty-only "preview" column, and the faculty/feedback/recent
	buttons. The home page is now identical for every user regardless of class,
	so the caller passes an explicit list of level codes and nothing here reads
	a section. Section-scoped reports live on /admin instead.
*/


// One row from /api/reports/grades: a username plus a percentage per level
// code. A missing key means the level was never attempted.
export interface iGrade {
	[key: string]: number | string | undefined;
}

// grades[code] is typed loosely because the same object also carries the
// username. Only numeric entries are scores; anything else reads as "no grade".
const grade_for = (grades: iGrade, code: string): number | null => {
	const value = grades[code];
	return typeof value === 'number' ? value : null;
};

export interface iLevelProgress {
	code: string;
	title: string;
	description: string;
	review_available: boolean;

	tutorial_highest_grade: null | number;
	tutorial_incompleted_levels: IfLevelSchema[];

	review_highest_grade: null | number;
	review_incompleted_levels: IfLevelSchema[];
}


// Surveys always show a check: we don't want to imply that a "wrong" answer on
// a setup question is a failure.
const is_survey_code = (code: string): boolean => code.substr(0, 6) === 'survey';


/**
	Make a pretty glyph for success / failure.
*/
export const glyph = (score: number|null, is_survey: boolean): JSX.Element|null => {
	if( score === null || typeof score === 'undefined') return null;

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


/**
	Build the per-level view model: highest grades plus any in-progress attempts.

	grades comes from /api/reports/grades as a single object keyed by level code,
	e.g. { username: 'bob', math1: 23 }. An undefined entry means "not attempted".
*/
export const get_levels = (
		codes: string[],
		grades: iGrade,
		uncompleted_levels: IfLevelSchema[] ): iLevelProgress[] => {

	return codes.map( code => {
		const matching = IfLevels.filter( l => l.code === code);
		if(matching.length !== 1) throw new Error('Unable to locate level in IFLevels, "' + code +  '"');

		const l: iLevelProgress = {
			code: code,
			title: matching[0].title,
			description: matching[0].description,
			review_available: IfLevels.filter( x => x.code === code+'review').length > 0,

			tutorial_highest_grade: grade_for(grades, code),
			tutorial_incompleted_levels: uncompleted_levels.filter( x => x.code === code ),

			review_highest_grade: grade_for(grades, code+'review'),
			review_incompleted_levels: uncompleted_levels.filter( x => x.code === code+'review' ),
		};

		return l;
	});
};


type LevelProgressTableProps = {
	title: string;
	levels: iLevelProgress[];
};

/**
	A table of tutorials with lesson/review grade glyphs.
*/
export function LevelProgressTable(props: LevelProgressTableProps): ReactElement {
	let counter = 0;

	const td_c: CSS.Properties = { textAlign: 'center', verticalAlign: 'middle', width: '6%' };
	const td_l: CSS.Properties = { textAlign: 'left', verticalAlign: 'middle'};
	const td_disabled = { ...td_c, color: 'lightgray'};

	const header_tr = (<tr key={'LevelProgressTR'+counter++} >
			<th key={'LevelProgressTH'+counter++} style={td_c}>Lesson</th>
			<th key={'LevelProgressTH'+counter++} style={td_c}>Review</th>
			<th key={'LevelProgressTH'+counter++} style={td_l}>Topic</th>
			<th key={'LevelProgressTH'+counter++} style={td_l}>Description</th>
		</tr>);

	const trs = props.levels.map( level => {
		const is_survey = is_survey_code(level.code);

		const review_td = level.review_available
			? <td key={'LevelProgressTD'+counter++} style={td_c}>{ glyph( level.review_highest_grade, is_survey ) }</td>
			: <td key={'LevelProgressTD'+counter++} style={td_disabled}>NA</td>;

		return (<tr key={'LevelProgressRow'+counter++}>
				<td key={'LevelProgressTD'+counter++} style={td_c}>{ glyph( level.tutorial_highest_grade, is_survey ) }</td>
				{ review_td }
				<td key={'LevelProgressTD'+counter++} style={td_l}>
					<Link to={'/ifgame/levels/'+level.code+'/'}>{ level.title }</Link>
				</td>
				<td key={'LevelProgressTD'+counter++} style={td_l}>{ level.description }</td>
			</tr>);
	});

	return (<div style={{ marginBottom: 30 }}>
			<div className='h5'>{ props.title }</div>
			<Table bordered style={{ fontSize: '80%', marginTop: 15 }}>
				<thead className='thead-dark'>{ header_tr }</thead>
				<tbody>{ trs }</tbody>
			</Table>
		</div>);
}


type NextLessonProps = {
	levels: iLevelProgress[];
	onClickNewCode: (code: string) => void;
};

/**
	A one-line nudge toward whatever the user should do next: finish an attempt
	in progress, redo something below the passing grade, or start the first
	untouched tutorial.
*/
export function NextLesson(props: NextLessonProps): ReactElement {
	const levels = props.levels;

	for(let i=0; i<levels.length; i++) {
		const level = levels[i];

		// In progress -- send them back to it.
		if(level.tutorial_incompleted_levels.length > 0) {
			return (<span>You are currently working on&nbsp;
						<Link to={'/ifgame/level/'+level.tutorial_incompleted_levels[0]._id+'/play'}>
							{level.title}</Link>&nbsp;
							(started <PrettyDate date={level.tutorial_incompleted_levels[0].created} />)
					</span>);
		}

		// Scored low -- suggest a redo. Never for surveys.
		if(!is_survey_code(level.code)
				&& level.tutorial_highest_grade != null
				&& level.tutorial_highest_grade < PASSING_GRADE) {
			return (<span>Your <b>{level.code}</b> lesson did not earn {PASSING_GRADE}%.
				You should redo it to get a higher grade before continuing.
				<Button href='#' variant='primary' size='sm' style={{ marginLeft: 5, marginTop: -3 }}
					onClick={ () => props.onClickNewCode(level.code) } >Redo level</Button>
				</span>);
		}
	}

	// Nothing to resume or redo. Offer the first one never attempted.
	for(let i=0; i<levels.length; i++) {
		if(levels[i].tutorial_highest_grade === null ){
			return (<span>Begin the {levels[i].title} activity.
					<Button href='#' variant='primary' size='sm' style={{ marginLeft: 5, marginTop: -3 }}
						onClick={ () => props.onClickNewCode(levels[i].code) } >Start!</Button>
					</span>);
		}
	}

	return (<div>Good job completing all of the available tutorials!</div>);
}
