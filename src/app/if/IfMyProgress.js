// @flow
import React from 'react';
import type { LevelType  } from './IfTypes';
import type { Node } from 'react';
import { Well, Table, Glyphicon, Tooltip, OverlayTrigger, Button } from 'react-bootstrap';
import { IfLevels, IfLevelSchema } from './../../shared/IfGame';
import { HtmlSpan } from './../components/Misc';
import type { IfLevelType } from './../../app/if/IfTypes';

// Data should be loaded from the grades api.
// Contains 
// [
//		{ username: 'bob', tutorial: 100, math1: 23 }   <== 23 is 23%.  Undone tutorials are undefined.
//	]
type PropsType = {
	grades: Array<any>,
	levels: Array<LevelType>,
	onClickNewCode: Function,
	onClickContinueLevel: Function
};


// Return the average of the given items.
const avg_of = function(obj: Object, arr: Array<any>): number {
	let totals = arr.map( a => typeof obj[a] === 'undefined' ? 0 : obj[a] );
	let sum = totals.reduce( (sum, i) => sum + i, 0);
	return Math.round(sum / arr.length);
};

const GREEN_GRADE = 85;
const PASSING_GRADE = 60;

export default class IfMyProgress extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
	}

	/**
		Return a single person's grades w/o the full table.
	*/
	_render_my_grades(grades: Object): Node {

		// Create a list of distinct columns.
		const tutorials = IfLevels.map( l => l.code );
		const td_style = { textAlign: 'center', width: '6%' };
		const th_style = { textAlign: 'center', verticalAlign: 'middle'};

		const tds = [];
		let key = '';
		let at_least_one_grade = false;


		// Create an object with all levels, and all grades (if any)
		const max_grades = tutorials.reduce( (o, t) => { o[t] = null; return o; }, {});
		for( key in grades) {
			max_grades[key] = grades[key];
			if(key !=='username') at_least_one_grade = true;
		}

		// If the user hasn't completed anything, return an empty div.
		if(!at_least_one_grade) return <div/>;

		const glyph = score => {
			if( score === null) return '';

			if( score >= GREEN_GRADE ) return (<span>
				<OverlayTrigger placement='top' overlay={<Tooltip id='render_my_grades_tooltip'>{ score+'% of quiz questions' }</Tooltip>}>
					<Glyphicon glyph='glyphicon glyphicon-thumbs-up' style={{ color: 'green'}} />
				</OverlayTrigger>
				</span>);
			
			if( score >= PASSING_GRADE ) return (<span>
				<OverlayTrigger placement='top' overlay={<Tooltip id='render_my_grades_tooltip'>{ score+'% of quiz questions' }</Tooltip>}>
					<Glyphicon glyph='glyphicon glyphicon-thumbs-up' style={{ color: 'black'}} />
				</OverlayTrigger>
				</span>);

			return (<span>
				<OverlayTrigger placement='top' overlay={<Tooltip  id='render_my_grades_tooltip'>{ score+'% of quiz questions' }</Tooltip>}>
					<Glyphicon glyph='glyphicon glyphicon-minus-sign' style={{color: 'orange'}} />
				</OverlayTrigger>
				</span>);
			
		};


		for(key in max_grades) {
			if(key !== 'username') {
				tds.push(
					<td key={'ifgrades_render_my_grades_' + key} style={td_style}>
						{ glyph(max_grades[key]) }
					</td>
				);
			}
		}

		tds.push(
				<td key='ifgrades_render_my_grades_if_all' style={td_style}>
					{ avg_of(max_grades, ['if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8']) + '%' }
				</td>
			);

		tds.push(
				<td key='ifgrades_render_my_grades_all' style={td_style}>
					{ avg_of(max_grades, tutorials) + '%' }
				</td>
			);


		return (<Table bordered condensed className='well'>
					<thead>
						<tr>
							{ tutorials.map(t=> <th key={t} style={th_style}>{t.substr(0,1).toUpperCase() + t.substr(1)}</th>)}
							<th style={th_style}>If 1-8</th>
							<th style={th_style}>Overall</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							{tds}
						</tr>
					</tbody>
				</Table>);
	}



	/**
		Return a single person's grades w/o the full table.
	*/
	_render_next(grades: Object, levels: Array<IfLevelType>): Node {
		let onClickNewCode = '',
			onClickNextLevel = null,
			topMessage = '',
			bottomMessage = '',
			i = 0;

		if(typeof grades.tutorial === 'undefined') { 
			// totally new to site.

			// See if the user has a partially-completed tutorial.
			if( levels.filter( l => l.code === 'tutorial' ).length > 0 ) {
				// Yes!  Give link to continue.

				onClickNextLevel = levels.filter( l => l.code === 'tutorial' )[0];
				topMessage = 'You are working on the <b>' + IfLevels[i].code + '</b> lesson.';
				bottomMessage = 'Click here to continue';

			} else {
				// Nope.  Need a new one.
				onClickNewCode = 'tutorial';
				topMessage = 'This website will introduce you to Excel formulas.';
				bottomMessage = 'You should get started by completing the tutorial.';
			}

		} else { 
			// has some grades.

			// See if we scored too low on the last completed item.  If so, 
			// suggest redoing it.
			for(i = 0; i<IfLevels.length; i++) {
				if( typeof grades[IfLevels[i].code] !== 'undefined' 
					&& grades[IfLevels[i].code] < PASSING_GRADE
					){
					// Bad! We didn't do well.

					// See if there is an open tutorial matching the code.
					if( levels.filter( 
							l => !l.completed && l.code === IfLevels[i].code
							).length > 0 ) {

						// There is an open tutorial matching this ID
						onClickNextLevel = levels.filter(
							l => !l.completed && l.code === IfLevels[i].code
							)[0];
						topMessage = 'You are redoing the <b>' + IfLevels[i].code + '</b> lesson.';
						bottomMessage = 'Click here to continue';

					} else {
						// There is not an open tutorial.
						onClickNewCode = IfLevels[i].code;
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
				for(i = 0; i<IfLevels.length; i++) {
					if(typeof grades[IfLevels[i].code] === 'undefined' ){
						// This tutorial hasn't been completed.
						// See if we have an in-progress item.

						// See if there is an open tutorial matching it. 
						if( levels.filter( 
								l => !l.completed && l.code === IfLevels[i].code
								).length > 0 ) {
							// There is an open tutorial!
							onClickNextLevel = levels.filter(
								l => !l.completed && l.code === IfLevels[i].code
								)[0];
							topMessage = 'You are currently working on <b>' + IfLevels[i].code + '</b>.';
							bottomMessage = 'Click here to continue';
						} else {
							// There is not an open tutorial.
							onClickNewCode = IfLevels[i].code;
							topMessage = 'Good job completing <b>' + IfLevels[i-1].label + '</b>.';
							bottomMessage = 'Start the next <b>' + IfLevels[i].label + '</b> lesson.';
						}
						break;
					}
				}

			}
		}

	
		if( onClickNewCode === '' && onClickNextLevel === null) {
			// We have completed everything.
			const completed = 'Great job!  You have completed all of the lessons. ' + 
					'You can use the buttons on the bottom-right corner to redo ' +
					'selected lessons.';

			return (<div>{ completed }</div>);

		} else {
			// We have more to do.

			return (<div>
				<HtmlSpan html={topMessage} />
				<Button bsStyle='link' 
					onClick={ e=> onClickNewCode !== ''
							? this.props.onClickNewCode(onClickNewCode, e) 
							: this.props.onClickContinueLevel(onClickNextLevel, e) } >
					<HtmlSpan html={bottomMessage} />
				</Button>
				</div>);
		}

		//return [ '', 'Great job!  You\'ve completed all of the tutorials.'];
	}



	render(): Node {
		// Data not yet loaded.
		if(this.props.grades.length < 1 ) 
			return <div/>;

		// Only a single grades entry should be returned.
		// [{ username: 'x', tutorial: 20, ... }
		if(this.props.grades.length > 1) 
			throw new Error('Invalid length of data passed to IfNextTutorial');

		// Test data
		// Blank: { username: 'x' }
		// All. IfLevels.reduce( (obj, l) => { obj[l.code] = 90; return obj; }, {} )
		// Redo . { 'tutorial': 90, 'math1': 100, 'math2': 50 };

		// If the user hasn't done anything, then have a friendlier title.
		const title = typeof this.props.grades[0].tutorial === 'undefined' ? 'Welcome to the Formula Trainer!' : 'Formula Trainer';

		return (<Well>
				<h3>{title}</h3>
				{ this._render_next(this.props.grades[0], this.props.levels) }
				<br/>
				{ this._render_my_grades(this.props.grades[0]) }
			</Well>);
	}

}