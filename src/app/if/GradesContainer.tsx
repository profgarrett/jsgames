import React, { ReactElement, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb  } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import Grades from './Grades';
import { Message, Loading } from '../components/Misc';
import Filter from './Filter';
import { DEMO_MODE } from '../../server/secret';

import ForceLogin from '../components/ForceLogin';



interface GradesContainerStateType {
	message: string;
	messageStyle: string;
	isLoading: boolean;
	data: Array<any>;
}

export default function GradesContainer(): ReactElement {
	const [ message, setMessage ] = useState('Loading data from server');
	const [ messageStyle, setMessageStyle ] = useState('');
	const [ isLoading, setIsLoading ] = useState(true);
	const [ data, setData ] = useState([]);

	const onReady = (filter: any) => {
		setIsLoading(false);
		setMessage('');
		onRefreshData(filter);
	};

	const params = useParams();
	const navigate = useNavigate();
	const _idsection = params._idsection ? params._idsection : null;

	const onRefreshData = (filter: any) => {
		const args: string[] = [];

		if(filter.sections !== '') args.push('idsection='+filter.sections);

		setIsLoading(true);
		setMessage('Loading grade data');
		
		fetch('/api/reports/grades?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				setData(json);
				setMessageStyle('');
				setMessage('');
				setIsLoading(false);
			})
			.catch( error => {
				setData([]);
				setMessageStyle('Error');
				setMessage('Error: ' + error);
				setIsLoading(false);
			});
	};


	// Render
	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
			<Breadcrumb.Item title='Grades' active>Grades</Breadcrumb.Item>
		</Breadcrumb>
		);


	const filter_defaults = { sections: _idsection };
	
	const filter = <Filter 
			onChange={onRefreshData} 
			onReady={onReady} 
			disabled={isLoading} 
			defaults={filter_defaults}
			filters={{sections: [] }}
		/>;

	return (
		<Container fluid>
		<Row>
			<Col>
				<ForceLogin/>
				{ crumbs }
				<h3>Grades</h3>
				<Message message={message} style={messageStyle} />
				<Loading loading={isLoading } />
				{ filter }
				<Grades data={data} />
			</Col>
		</Row>
		</Container>
	);
}