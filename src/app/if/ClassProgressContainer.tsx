import React, { ReactElement, useEffect, useState } from 'react';

import { Container, Row, Col, Breadcrumb  } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import { ClassProgressChart } from './ClassProgressChart';
import { ClassProgressStudent } from './ClassProgressStudent';
import { LevelModal } from './LevelModal';
import { Message, Loading } from '../components/Misc';
import Filter from './Filter';

import { DEMO_MODE } from '../configuration';

import ForceLogin from '../components/ForceLogin';
import { IfLevelSchema, IfLevelPagelessSchema } from '../../shared/IfLevelSchema';


export default function ClassProgressContainer() {

	const [message, setMessage] = useState('Loading data from server')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [levels, setLevels] = useState<IfLevelSchema[]>([]);

	const params = useParams();
	const navigate = useNavigate();
	const _id = params._idsection ? params._idsection : null;

	const onReady = (filter: any) => {
		setIsLoading(false);
		setMessage('');
		onRefreshData();
	}

	const onRefreshData = () => { 
		const args : any[] = [];

		if(_id !== null) args.push('idsection='+_id);

		setIsLoading(true);
		setMessage('Loading progress data');
		
		fetch('/api/reports/progress?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				const levels = json.map( j => new IfLevelPagelessSchema(j) );
				setLevels( levels );
				setMessageStyle('');
				setMessage('');
				setIsLoading(false);
			})
			.catch( error => {
				setLevels( [] );
				setMessageStyle('Error');
				setMessage('Error: ' + error);
				setIsLoading(false);
			});
	}

	useEffect( () => {
		onRefreshData();
	}, [_id] );


	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
			<Breadcrumb.Item title='Progress' active>Class Progress</Breadcrumb.Item>
		</Breadcrumb>
		);

	const search = new URLSearchParams(window.location.search);
	const filter_defaults = search.has('idsection') 
		? { sections: search.get('idsection') }
		: {};
	
	const filter = <Filter 
			onChange={onRefreshData} 
			onReady={onReady} 
			disabled={isLoading} 
			defaults={filter_defaults}
			filters={{sections: [] }}
		/>;

	const empty = levels.length === 0 && isLoading === false
			? <p>No students in this section have yet started completing lessons. Once they get started, you'll see a chart here with their progress</p>
			: null;

	// Fixes old bug, where some people's levels didn't have a props value.
	const data = levels.filter( l => l.props !== null ); 

	return (
		<Container fluid>
		<Row>
			<Col>
				<ForceLogin/>
				{ crumbs }
				<h3>Class Progress</h3>
				<Message message={message} style={messageStyle} />
				<Loading loading={ isLoading } />
				{ filter }
				{ empty }
				<ClassProgressChart data={data}  />
			</Col>
		</Row>
		</Container>
	);
}