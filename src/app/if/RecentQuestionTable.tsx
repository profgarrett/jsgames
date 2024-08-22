import React, { ReactElement, useState } from 'react';

import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
}

interface Answer {
	s: string;
	correct: boolean|null;
	completed: boolean;
}

// Build unique keys in user_to_questions_map
//
// Updates passed arguments for questions and answers
function update_user_answers_and_unique_questions(levels: Array<IfLevelSchema>, 
	unique_questions: Map<string, Question>,
	user_answers: Map<string, Map<string, Array<Answer>>>) {

    levels.forEach((l: IfLevelSchema) => {
        l.pages.forEach((p: IfPageBaseSchema, i: number) => {
			// Unique code
            const questionKey = l.code + '.'+ i.toString().padStart(3, '0');  
			//`${l.code}.${p.description}.${p.instruction}`;

			// See if this is a new question, if so, save to list of unique qs
			if(typeof unique_questions.get(questionKey) == 'undefined') {
				unique_questions.set(questionKey, {
					level: l.code,
					description: p.description,
					instruction: p.instruction,
					order: i,
				});
			}

			// If new user, add
            if (!user_answers.has(l.username)) {
                user_answers.set(l.username, new Map<string, Array<Answer>>());
            }

			// Add question to user
            const user_question_map = user_answers.get(l.username);
            if (!user_question_map) throw new Error(`Missing ${l.username} in user_to_questions_map recent q table`);

			if(!user_question_map.has(questionKey)) {
				user_question_map.set(questionKey, [] );
			}
			const user_answers_array = user_question_map.get(questionKey);
			if(typeof user_answers_array == 'undefined') throw new Error('Invalid questionKey QuestionTable');

			user_answers_array.push({
				s: p.toString(),
				correct: p.correct,
				completed: p.completed
			});
        });
    });

	// Add all questions to each user.
	user_answers.forEach( ( user_map_of_answers, key: string ) => {
		unique_questions.forEach( (question: Question, key: string) => {
			if(typeof user_map_of_answers.get(key) == 'undefined' ) {
				user_map_of_answers.set(key, []);
			}
		});
	});
}



export default function RecentQuestionTable(props: PropsType): ReactElement {

	const user = getUserFromBrowser();
	const isAdmin = user.isAdmin;
	if(!isAdmin) { throw new Error('Only admins have access to this screen '); }

	if(props.levels.length < 1) return <div/>;

	// Load levels into the questions 
	const unique_questions = new Map<string, Question>();
	const user_answers = new Map<string, Map<string, Array<Answer>>>();
	update_user_answers_and_unique_questions(props.levels, unique_questions, user_answers); 

	// get sorted keys
	const sorted_question_keys = Array.from(unique_questions.keys()).sort();
	const sorted_user_keys = Array.from(user_answers.keys()).sort();

	// Create headers td contents
	let tr_header_ths: Array<ReactElement> = [<th key={'recentquestiontabletdusername'}>User</th>];
	sorted_question_keys.forEach( (key: string, i: number ) => {
		const title = unique_questions.get(key)?.level + ': ' +  
				unique_questions.get(key)?.description + " " +
				unique_questions.get(key)?.instruction;

		tr_header_ths.push(<th key={'recentquestiontabletdusername'+i}>
			<OverlayTrigger 
					overlay={ <Tooltip id={'recentquestiontabletdusernametooltip'+i}>{ title }</Tooltip> }
					placement={'bottom'}>
				<b>{i}</b>
			</OverlayTrigger>
		</th>);
	});

	// Create tr header row
	const ths = [<tr key={'recentquestiontabletdusername-tr'}>{ tr_header_ths }</tr>];
	
	// Add a tr for each user
	const trs: Array<ReactElement> = [];
	sorted_user_keys.forEach( (username: string, i: number ) => {
		const ua = user_answers.get(username);
		const k = 'recentquestiontable-tr-'+username;
		const tds: Array<ReactElement> = [<td key={k+'tdusername'}>{username}</td>];
		
		sorted_question_keys.forEach( (key: string, i: number ) => {
			const answers = ua?.get(key) || [];

			const answer_overlays = answers.map( (a: Answer) => {
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
				
				return (<OverlayTrigger 
							overlay={ <Tooltip id={k+''+i+'td'}>{ a?.s }</Tooltip> }
							placement={'bottom'}><span>{icon}</span>
						</OverlayTrigger>);
			});

			tds.push(<td key={k+'-td-'+i}>{ answer_overlays }</td>);
					
		});

		trs.push(<tr key={k+i+username}>{ tds }</tr>);
	});
	
	return <Table striped bordered hover><thead>{ ths }</thead><tbody>{trs}</tbody></Table>;
}
