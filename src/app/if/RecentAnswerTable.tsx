import React, { ReactElement, useState } from 'react';

import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getUserFromBrowser } from '../components/Authentication';
import { IfLevelSchema } from '../../shared/IfLevelSchema';

import { DEMO_MODE } from '../configuration';

import { IfPageBaseSchema } from '../../shared/IfPageSchemas';


type PropsType = {
	levels: Array<IfLevelSchema>
};

interface Question {
	level: string;
	description: string;
	instruction: string;
	order: number;
	answers: Answer[];
}

interface Answer {
	s: string;
	correct: boolean|null;
	completed: boolean;
	username: string;
}

// Build unique keys in user_to_questions_map
//
// Updates passed arguments for questions and answers
function update_questions(levels: Array<IfLevelSchema>, 
	questions: Map<string, Question>) {

    levels.forEach((l: IfLevelSchema) => {
        l.pages.forEach((p: IfPageBaseSchema, i: number) => {
			// Unique code
            const questionKey = l.code + '.'+ i.toString().padStart(3, '0');  
			//`${l.code}.${p.description}.${p.instruction}`;

			// See if this is a new question, if so, save to list of unique qs
			if(typeof questions.get(questionKey) == 'undefined') {
				questions.set(questionKey, {
					level: l.code,
					description: p.description,
					instruction: p.instruction,
					order: i,
					answers: []
				});
			}

			const question = questions.get(questionKey);
			if(typeof question == 'undefined') throw new Error('Invalid questionKey AnswerTable');

			question.answers.push({
				s: p.toString(),
				correct: p.correct,
				completed: p.completed,
				username: l.username
			});
        });
    });
}



export default function RecentAnswerTable(props: PropsType): ReactElement {

	const user = getUserFromBrowser();
	const isAdmin = user.isAdmin;
	if(!isAdmin) { throw new Error('Only admins have access to this screen '); }

	if(props.levels.length < 1) return <div/>;

	// Load levels into the questions 
	const questions = new Map<string, Question>();
	update_questions(props.levels, questions); 
	const sorted_question_keys = Array.from(questions.keys()).sort();

	// Create headers td contents
	let question_elements: Array<ReactElement> = [];
	sorted_question_keys.forEach( (key: string, i: number ) => {
		const question = questions.get(key);
		if(typeof question == 'undefined') throw new Error('Invalid question key');
		
		const answer_elements = question.answers.map( (a: Answer, i: number) => {
			let icon;

			if(typeof a === 'undefined' || a == null ) {
				icon = '';
			} else if(a?.completed && a?.correct) {
				icon =  "👍";
			} else if(a?.completed && !a?.correct) {
				icon = "❌";
			} else {
				icon = "⏳";
			}

			return <li key={'answerelement'+key+"-"+i}> 
			<OverlayTrigger 
					overlay={ <Tooltip id={'recentquestiontabletdusernametooltip'+i}>{ a.username }</Tooltip> }
					placement={'bottom'}>
				<b>{ icon }</b>
			</OverlayTrigger>
			 - { a.s }</li>
		});


		question_elements.push(<Card key={'qelement'+key}>
			<Card.Text>
				{ question.description }<br/>
				{ question.instruction }
				<ul>{ answer_elements }</ul>
			</Card.Text>
		</Card>);
	});
	
	return <>{ question_elements }</>;
}
