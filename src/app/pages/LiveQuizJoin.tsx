/*
	Entry point for students joining a live quiz session (route: /live).

	Requires an existing account (ForceLogin redirects anonymous visitors to
	/login), then takes the short code the instructor is showing on their
	screen. Once joined, hands off to LiveQuizPlay for the rest of the session.
*/
import React, { ReactElement, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';

import ForceLogin from '../components/ForceLogin';
import LiveQuizPlay from './LiveQuizPlay';

function LiveQuizJoin(): ReactElement {
	const [code, setCode] = useState('');
	const [idsession, setIdsession] = useState<number | null>(null);
	const [error, setError] = useState('');
	const [joining, setJoining] = useState(false);

	const join = async (event: React.FormEvent): Promise<void> => {
		event.preventDefault();
		const trimmed = code.trim();
		if (trimmed === '') return;

		setJoining(true);
		setError('');

		try {
			const res = await fetch(`/api/quizsessions/${encodeURIComponent(trimmed)}/join`, {
				method: 'POST',
				credentials: 'include',
			});
			const json = await res.json();
			if (!res.ok) { setError(json.error || 'That code was not found.'); setJoining(false); return; }
			setIdsession(json.idsession);
		} catch {
			setError('Network error -- please try again.');
			setJoining(false);
		}
	};

	if (idsession !== null) return <LiveQuizPlay idsession={idsession} />;

	return (
		<Container fluid>
			<ForceLogin />
			<Row className='justify-content-center mt-5'>
				<Col xs={12} sm={8} md={5} lg={4}>
					<Card body>
						<h3 className='mb-3'>Join live quiz</h3>
						<Form onSubmit={join}>
							<Form.Group className='mb-3'>
								<Form.Label>Session code</Form.Label>
								<Form.Control
									type='text'
									value={code}
									autoFocus
									onChange={(e) => setCode(e.target.value.toUpperCase())}
									placeholder='e.g. AB3XQ9'
								/>
							</Form.Group>
							{ error !== '' ? <Alert variant='danger'>{ error }</Alert> : null }
							<Button type='submit' variant='primary' disabled={joining || code.trim() === ''}>
								{ joining ? 'Joining…' : 'Join' }
							</Button>
						</Form>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}

export default LiveQuizJoin;
