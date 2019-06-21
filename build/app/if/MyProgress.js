//      
import React from 'react';
                                            
                                  
import { Card, Table, Tooltip, OverlayTrigger, Button } from 'react-bootstrap';
import { IfLevels } from './../../shared/IfGame';
import { HtmlSpan } from './../components/Misc';
//import type { IfLevelType } from './../../app/if/IfTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faMinus } from '@fortawesome/free-solid-svg-icons';

/* 
	List of tutorials and reviews to use for the Progress.
	Keeps out ones that we don't want to use
*/
const TUTORIALS = IfLevels.filter( l => [
	'tutorial', 
	'math1', 'math2', 'math3',
	'functions1', 'functions2', 
	'if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8',
	'math4'].includes(l.code)
	);

const REVIEWS = IfLevels.filter( l=> [
	'math1', 'math2', 'math3',
	'functions1', 'functions2', 
	'math4'].includes(l.code)
	);

// Data should be loaded from the grades api.
// Contains 
// [
//		{ username: 'bob', tutorial: 100, math1: 23 }   <== 23 is 23%.  Undone tutorials are undefined.
//	]
                  
                    
                          
                          
                               
  


// Return the average of the given items.
const avg_of = function(obj        , arr            )         {
	let totals = arr.map( a => typeof obj[a] === 'undefined' ? 0 : obj[a] );
	let sum = totals.reduce( (sum, i) => sum + i, 0);
	return Math.round(sum / arr.length);
};

const GREEN_GRADE = 85;
const PASSING_GRADE = 74;


export default class MyProgress extends React.Component            {


	/**
		Return a single person's grades w/o the full table.
	*/
	_render_my_grades(tutorial_grades        , review_grades        , iflevels               )       {

		// Create a list of distinct columns.
		// Do not include review levels.
		const tutorials = iflevels.map( l => l.code ).filter( s => s.search('review') === -1 );

		// Style
		const td_style = { textAlign: 'center', verticalAlign: 'middle', width: '6%' };
		const th_style = { textAlign: 'center', verticalAlign: 'middle'};

		// Return tds.
		const tds_tutorials = [];
		const tds_review = [];


		//console.log( [tutorial_grades, review_grades]);
		
		// See if we have at least one grade.  If so, show table.
		let at_least_one_grade = false;
		for(let key in tutorial_grades) {
			//max_tutorial_grades[key] = tutorial_grades[key];
			if(key !=='username') at_least_one_grade = true;
		}
		// If the user hasn't completed anything, return an empty div.
		if(!at_least_one_grade) return <div/>;

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


		tutorials.map( code => { 
			tds_tutorials.push( 
				<td key={'ifgrades_render_my_grades_tutorial' + code} style={td_style}>
					{ glyph(tutorial_grades[code]) }
				</td>
			);
			tds_review.push(
				<td key={'ifgrades_render_my_grades_review' + code} style={td_style}>
					{ glyph(review_grades[code+'review']) }
				</td>
			);
		});

		// Summary
		const all_grades = {
			...tutorial_grades,
			...review_grades
		};

		tds_tutorials.push(
				<td rowSpan={2} key='ifgrades_render_my_grades_all' style={td_style}>
					{ avg_of(all_grades, tutorials) + '%' }
				</td>
			);


		return (<Table bordered style={{ fontSize: '80%' }}>
					<thead className='thead-dark'>
						<tr>
							<th style={th_style}></th>
							{ tutorials.map(t=> <th key={t} style={th_style}>{t.substr(0,1).toUpperCase() + t.substr(1)}</th>)}
							<th style={th_style}>Completion</th>
						</tr>
					</thead>
					<tbody>
						<tr><td style={th_style}>Lessons</td>{tds_tutorials}</tr>
						<tr><td style={th_style}>Reviews</td>{tds_review}</tr>
					</tbody>
				</Table>);
		
	}



	/**
		Give the next clickable lesson
	*/
	_render_next_lesson(grades        , levels               )       {
		let onClickNewCode = '',
			onClickNextLevel = null,
			topMessage = '',
			bottomMessage = '',
			i = 0;
		const lesson_levels = TUTORIALS; // IfLevels.filter( l => l.code.search('review') === -1);

		if(typeof grades.tutorial === 'undefined') { 
			// totally new to site.

			// See if the user has a partially-completed tutorial.
			if( levels.filter( l => l.code === 'tutorial' ).length > 0 ) {
				// Yes!  Give link to continue.

				onClickNextLevel = levels.filter( l => l.code === 'tutorial' )[0];
				topMessage = 'You are working on the <b>' + levels[i].code + '</b> lesson.';
				bottomMessage = 'Click here to continue';

			} else {
				// Nope.  Need a new one.
				onClickNewCode = 'tutorial';
				topMessage = 'This website will introduce you to Excel formulas.';
				bottomMessage = 'Start tutorial';
			}

		} else { 
			// has some grades.

			// See if we scored too low on the last completed item.  If so, 
			// suggest redoing it.
			for(i = 0; i<lesson_levels.length; i++) {
				if( typeof grades[lesson_levels[i].code] !== 'undefined' 
					&& grades[lesson_levels[i].code] < PASSING_GRADE
					){
					// Bad! We didn't do well.

					// See if there is an open tutorial matching the code.
					if( levels.filter( 
							l => !l.completed && l.code === lesson_levels[i].code
							).length > 0 ) {

						// There is an open tutorial matching this ID
						onClickNextLevel = levels.filter(
							l => !l.completed && l.code === lesson_levels[i].code
							)[0];
						topMessage = 'You are redoing the <b>' + lesson_levels[i].code + '</b> lesson.';
						bottomMessage = 'Click here to continue';

					} else {
						// There is not an open tutorial.
						onClickNewCode = lesson_levels[i].code;
						topMessage = 'Your <b>'+onClickNewCode+'</b> tutorial did not earn '+PASSING_GRADE+'%. ' +
								'You need to correctly answer '+PASSING_GRADE+'% of the quiz questions before continuing to the next tutorial.';
						bottomMessage = 'Click to restart';
					}
					break;
				}
			}

			// If we haven't found a new code or continuing ID yet,
			// Figure out which to start.
			if(onClickNewCode === '' && onClickNextLevel === null) {
				// Since we don't have a too low score, find the next item.

				// Find next code item.
				for(i = 0; i<lesson_levels.length; i++) {
					if(typeof grades[lesson_levels[i].code] === 'undefined' ){
						// This tutorial hasn't been completed.
						// See if we have an in-progress item.

						// See if there is an open tutorial matching it. 
						if( levels.filter( 
								l => !l.completed && l.code === lesson_levels[i].code
								).length > 0 ) {
							// There is an open tutorial!
							onClickNextLevel = levels.filter(
								l => !l.completed && l.code === lesson_levels[i].code
								)[0];
							topMessage = 'You are currently working on <b>' + lesson_levels[i].code + '</b>.';
							bottomMessage = 'Click here to continue';
						} else {
							// There is not an open tutorial.
							onClickNewCode = lesson_levels[i].code;
							topMessage = 'Good job completing <b>' + lesson_levels[i-1].label + '</b>.';
							bottomMessage = 'Start the next <b>' + lesson_levels[i].label + '</b> lesson.';
						}
						break;
					}
				}

			}
		}

	
		if( onClickNewCode === '' && onClickNextLevel === null) {
			// We have completed everything.
			const completed = 'Great job!  You have completed all of the lessons. ' + 
					'You can use the links on the bottom-right menu to restart ' +
					'any of the lessons.';

			return (<div>{ completed }</div>);

		} else {
			// We have more to do.

			return (<span>
				<HtmlSpan html={topMessage} />
				<span><Button href='#' variant='primary' size='sm' style={{ marginLeft: 5, marginTop: -3 }}
					onClick={ e=> onClickNewCode !== ''
							? this.props.onClickNewCode(onClickNewCode, e) 
							: this.props.onClickContinueLevel(onClickNextLevel, e) } >
					<HtmlSpan html={bottomMessage} />
				</Button></span>
				</span>);
		}

		//return [ '', 'Great job!  You\'ve completed all of the tutorials.'];
	}



	/**
		Give the next clickable review for a lesson.
	*/
	_render_next_review(level_grades        , review_grades        , levels               )       {
		let onClickNewCode = '',
			onClickNextLevel = null,
			buttonMessage = '';

		// Return any uncompleted review levels.
		const uncompleted_review_levels = levels.filter( l => l.code.search('review') !== -1 && !l.completed);

		//debugger;
		if(uncompleted_review_levels.length>0) {
			// We have at least one uncompled review.
			// Continue working on existing review level.
			onClickNextLevel = uncompleted_review_levels[0];
			buttonMessage = 'Continue working on the <b>' + onClickNextLevel.code.replace('review','') + '</b> review.';

		} else {
			// Find what completed levels have uncompleted reviews.
			for(let key in level_grades) {
				if(onClickNewCode == '' && key !== 'username' && level_grades.hasOwnProperty(key)) {
					// If we haven't completed the review for a completed level.
					if(typeof review_grades[key+'review'] === 'undefined') {
						// Does it exist?
						if( REVIEWS.filter( code => code === key+'review').length > 0 ) {
							onClickNewCode = key+'review';
							buttonMessage = 'Start a review for '+key;
						}
					}
				}
			}
		}

	
		if( onClickNewCode === '' && onClickNextLevel === null) {
			// No review needed.
			return <div/>;

		} else {
			// We a review to complete.

			return (
					<Button href='#' variant='outline-primary' size='sm' style={{ marginLeft: 5, marginTop: -3 }}
					onClick={ e=> onClickNewCode !== ''
							? this.props.onClickNewCode(onClickNewCode, e) 
							: this.props.onClickContinueLevel(onClickNextLevel, e) } >
					<HtmlSpan html={buttonMessage} />
				</Button> );
		}

		//return [ '', 'Great job!  You\'ve completed all of the tutorials.'];
	}



	render()       {
		// Data not yet loaded.
		if(this.props.grades.length < 1 ) 
			return <div/>;

		const filtered_levels = this.props.levels; //.filter( l => l.code.search('review') === -1);
		const grades = this.props.grades[0];
		const filtered_levels_list = TUTORIALS; //.filter( l => l.code.search('review') === -1);

		
		// Split grade into 2 sections, original & reviews.
		const review_grades = {};
		const tutorial_grades = {};

		for(var key in grades) {
			if( grades.hasOwnProperty(key)) {
				if(key.search('review') === -1) {
					tutorial_grades[key] = grades[key];
				} else {
					review_grades[key] = grades[key];
				}
			}
		}

		// Only a single grades entry should be returned.
		// [{ username: 'x', tutorial: 20, ... }
		if(this.props.grades.length > 1) 
			throw new Error('Invalid length of data passed to IfNextTutorial');

		// Test data
		// Blank: { username: 'x' }
		// All. IfLevels.reduce( (obj, l) => { obj[l.code] = 90; return obj; }, {} )
		// Redo . { 'tutorial': 90, 'math1': 100, 'math2': 50 };

		// If the user hasn't done anything, then have a friendlier title.
		const title = typeof this.props.grades[0].tutorial === 'undefined' ? 'Welcome to the Formula Trainer website!' : 'Formula Trainer';

		return (
			<Card style={{ backgroundColor: '#f5f5f5' }}>
				<Card.Body>
					<Card.Title>{title}</Card.Title>
					<Card.Text>
						{ this._render_next_lesson(tutorial_grades, filtered_levels) }
					</Card.Text>
						{ this._render_my_grades(tutorial_grades, review_grades, filtered_levels_list) }
						{ this._render_next_review(tutorial_grades, review_grades, filtered_levels) }
				</Card.Body>
			</Card>);
	}

}
