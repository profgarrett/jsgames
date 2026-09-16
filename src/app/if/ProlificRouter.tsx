import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import { Message, Loading } from '../components/Misc';
import { IfLevelSchema } from '../../shared/IfLevelSchema';
import { loadUserFromServer } from '../components/Authentication';
import { postJson, getJson } from '../components/Api';

/*
	Landing page for Prolific-recruited participants -- no login form, no manual account
	creation. This is /prolific.

	The researcher gives Prolific a study URL of this shape:
		https://excel.fun/prolific?level=testprolificstudy&section=STUDY1
	and Prolific appends its own participant-identifying parameters when a worker clicks
	through:
		&PROLIFIC_PID={{%PROLIFIC_PID%}}&STUDY_ID={{%STUDY_ID%}}&SESSION_ID={{%SESSION_ID%}}

	http://localhost:8080/prolific?PROLIFIC_PID=test123&STUDY_ID=abc&SESSION_ID=xyz&level=testprolificstudy&section=prolific

	This page reads all of that, auto-provisions (or re-uses) an account keyed to the
	participant's Prolific ID via POST /api/users/prolific_login, joins the given section
	(if any), resumes an in-progress attempt or starts a new one, and drops the participant
	straight into the level. `level` defaults to 'testprolificstudy'; `section` is optional
	(an empty/absent section code is a valid "no section", same as elsewhere on the site).
*/
export default function ProlificRouter() {
	const navigate = useNavigate();
	const [message, setMessage] = useState('');
	const [messageStyle, setMessageStyle] = useState('info');
	const [isLoading, setIsLoading] = useState(true);

	const search = new URLSearchParams(window.location.search);
	const prolific_pid = search.get('PROLIFIC_PID') || search.get('prolific_pid') || '';
	const study_id = search.get('STUDY_ID') || search.get('study_id') || '';
	const session_id = search.get('SESSION_ID') || search.get('session_id') || '';
	const section_code = search.get('section') || '';
	const level_code = search.get('level') || 'testprolificstudy';

	useEffect( () => {
		if( prolific_pid.trim() === '' ) {
			setIsLoading(false);
			setMessage(
				'This link is missing your Prolific participant ID, so we can\'t start the study. ' +
				'Please return to Prolific and open the study from there, rather than using a saved or copied link.'
			);
			setMessageStyle('danger');
			return;
		}

		(async () => {
			try {
				await postJson('/api/users/prolific_login', { prolific_pid, section_code, study_id, session_id }, {
					action: 'set up your session',
					unauthorized_message: 'We could not set up your session. Please return to Prolific and try again.',
				});

				// Refresh the cached identity (httpOnly cookie) before making authenticated calls.
				await loadUserFromServer();

				// Resume an already-started, uncompleted attempt if one exists (e.g. the
				// participant reloaded or lost their connection), rather than starting over.
				const existing = await getJson<any[]>('/api/levels/levels/byCode/' + level_code, {
					action: 'load your progress',
				});
				const in_progress = existing.filter( (l: any) => !l.completed );

				const level_json = in_progress.length > 0
					? in_progress[in_progress.length - 1]
					: await postJson<any>('/api/levels/new_level_by_code/' + level_code,
						{ prolific_study_id: study_id, prolific_session_id: session_id },
						{ action: 'start the study' });

				const newLevel = new IfLevelSchema(level_json);
				navigate('/ifgame/level/' + newLevel._id + '/play');

			} catch(error: any) {
				setIsLoading(false);
				setMessage( error.message === 'InvalidCode'
					? 'This study link has an invalid section code. Please contact the researcher.'
					: error.message === 'InvalidProlificId'
						? 'Your Prolific participant ID looks invalid. Please return to Prolific and try again.'
						: error.message );
				setMessageStyle('danger');
			}
		})();
		// Intentionally run once on mount -- these come from the URL and don't change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Container fluid>
			<Row>
				<Col xs={12}>
					<Loading loading={isLoading} />
					<Message message={message} style={messageStyle} />
				</Col>
			</Row>
		</Container>
	);
}
