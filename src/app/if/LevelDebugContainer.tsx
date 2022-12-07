import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Breadcrumb, Button  } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import LevelDebug from './LevelDebug';
import ForceLogin from '../components/ForceLogin';
import { Message, Loading } from '../components/Misc';

import { IfLevelSchema } from '../../shared/IfLevelSchema';

export default function IfLevelScoreContainer() {

	const [message, setMessage] = useState('Loading data from server')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [level, setLevel] = useState<null|IfLevelSchema>(null);
	const params = useParams();
	const _id = params._id

	const navigate = useNavigate();

	useEffect( () => {

		fetch('/api/levels/debuglevel/'+_id, {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				setLevel(ifLevel);
				setMessage('');
				setIsLoading(false);
			})
			.catch( error => {
				setLevel(null);
				setMessage('Error: ' + error);
				setIsLoading(false);
			});

		}, [_id]);



	const back = level != null ?
		<Button variant='primary' 
				style={{ marginBottom: 20, marginTop: 20 }} 
				href={ '/ifgame/' }>
				Back to home page
		</Button>
		: <span />;

	return (
		<Container fluid>
			<Row>
				<Col>
					<ForceLogin/>
					<Breadcrumb>
						<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
						{ level ? <Breadcrumb.Item active>{ level.title }</Breadcrumb.Item> : null }
					</Breadcrumb>
					<h3>{ level !== null ? level.title : '' }</h3>

					<Message message={message} style={messageStyle} />
					<Loading loading={isLoading } />
					<div style={{ textAlign: 'center' }}>{ back }</div>
					{ level ? <LevelDebug level={level} /> : null }
					<div style={{ textAlign: 'center' }}>{ back }</div>
					<br/>
				</Col>
			</Row>
		</Container>
	);
	
}