import React, { ReactElement, useEffect, useState } from 'react';

import { Container, Row, Col, Tabs, Tab, Breadcrumb, Navbar  } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import { ClassProgressChart } from './ClassProgressChart';
import  ClassProgressGrades from './ClassProgressGrades';
import { Message, Loading } from '../components/Misc';
import Filter from './Filter';

//import { DEMO_MODE } from '../configuration';

import ForceLogin from '../components/ForceLogin';
import { IfLevelPagelessSchema } from '../../shared/IfLevelSchema';


export default function ClassProgressContainer() {

	const [message, setMessage] = useState('Loading data from server')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [pageless_levels, setLevels] = useState<IfLevelPagelessSchema[]>([]);

	const params = useParams();
	const navigate = useNavigate();
	const search = new URLSearchParams(window.location.search);
	const url = window.location.href.split('/');
	const _id = Number.parseInt(url[url.length-1]);

	// Invalid ID value
	if(Number.isNaN(_id)) {
		navigate('/ifgame');
	}

	const onReady = (filter: any) => {
		setIsLoading(false);
		setMessage('');
		onRefreshData(filter);
	};

	const onRefreshData = (filter: any) => { 

		setIsLoading(true);
		setMessage('Loading progress data');
		
		fetch('/api/reports/progress?idsection='+filter.sections, {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				const pageless_levels = json.map( j => new IfLevelPagelessSchema(j) );
				setLevels( pageless_levels );
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

	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/'>Home</Breadcrumb.Item>
			<Breadcrumb.Item title='My Progress' href='/ifgame/'>My Progress</Breadcrumb.Item>
			<Breadcrumb.Item title='Class' active>Class Progress</Breadcrumb.Item>
		</Breadcrumb>
		);

	const filter_defaults = { sections: _id };
	
	const filter = <Filter 
			onChange={onRefreshData} 
			onReady={onReady} 
			disabled={isLoading} 
			defaults={filter_defaults}
			filters={{sections: [] }}
		/>;

	const empty = pageless_levels.length === 0 && isLoading === false
			? <p>No students in this section have yet started completing lessons. Once they get started, you'll see a chart here with their progress</p>
			: null;

	// Fixes old bug, where some people's levels didn't have a props value.
	const data = pageless_levels.filter( l => l.props !== null ); 

	return (
		<Container fluid>
		<Navbar bg='dark' variant='dark'>
			<Container fluid>
				<Navbar.Brand href='/'>Excel.fun</Navbar.Brand>
			</Container>
		</Navbar>

		<Row>
			<Col>
				<ForceLogin/>
				{ crumbs }
				<Message message={message} style={messageStyle} />
				<Loading loading={ isLoading } />
				{ filter }
				{ empty }
				<br/>
				<Tabs defaultActiveKey='chart'>
					<Tab eventKey='chart' title='Chart of class progress'>
						<ClassProgressChart data={data}  />
					</Tab>
					<Tab eventKey='grades' title='Grade table'>
						<ClassProgressGrades data={data} />
					</Tab>
				</Tabs>
			</Col>
		</Row>
		</Container>
	);
}