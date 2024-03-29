import React, { useState, ReactElement } from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb  } from 'react-bootstrap';

import Recent from './Recent';
import { Message, Loading, IStringIndexJsonObject } from '../components/Misc';
import Filter from './Filter';

import { useParams, useNavigate } from 'react-router-dom';

import { IfLevelPagelessSchema } from '../../shared/IfLevelSchema';

//import 'url-search-params-polyfill';

import ForceLogin from '../components/ForceLogin';




export default function IfRecentContainer(): ReactElement {
	const [ message, setMessage ] = useState('Loading filter data');
	const [ messageStyle, setMessageStyle ] = useState('');
	const [ isLoading, setIsLoading ] = useState(true);
	const [ levels, setLevels ] = useState([]);

	const params = useParams();
	const navigate = useNavigate();
	const _idsection = params._idsection ? params._idsection : null;

	const onReady = (filter: any) => {
		setIsLoading(false);
		setMessage('');
		onRefreshData(filter);
	};


	const onRefreshData = (filter: any) => {
		const args: IStringIndexJsonObject = [];
		
		if(filter.levels != '') args.push('code='+filter.levels);
		if(filter.sections !== '') args.push('idsection='+filter.sections);
		if(filter.users !== '') args.push('iduser='+filter.users);
		if(filter.days !== '') args.push('updated='+filter.days);

		setIsLoading(true);
		setMessage('Loading data');

		fetch('/api/reports/recent?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => json.map( j => new IfLevelPagelessSchema(j) ) )
			.then( ifLevels => {
				setLevels(ifLevels);
				setMessage('');
				setMessageStyle('');
				setIsLoading(false);
			})
			.catch( error => {
				setLevels([]);
				setMessage('Error: ' + error);
				setMessageStyle('Error');
				setIsLoading(false);
			});
	};



	// Render

	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
			<Breadcrumb.Item title='Recent activity' active>Recent activity</Breadcrumb.Item>
		</Breadcrumb>
		);

	const search = new URLSearchParams(window.location.search);

	const filter_defaults = { sections: _idsection };

	const filter_filters = {
		levels: [],
		sections: [],
		users: [],
		days: [ 
			{ value: 1, label: '1 day'} , 
			{ value: 3, label: '3 days'}, 
			{ value: 7, label: '1 week' },
			{ value: 14, label: '2 weeks' },
			{ value: 21, label: '3 weeks' },
			{ value: 28, label: '4 weeks' },
		]
	};

	const filter = <Filter 
			onChange={onRefreshData} 
			onReady={onReady} 
			disabled={isLoading} 
			defaults={filter_defaults}
			filters={filter_filters}
		/>;


	return (
		<Container fluid>
		<Row>
			<Col>
				<ForceLogin/>
				{ crumbs }
				<h3>Recent Activity</h3>

				<Message message={message} style={messageStyle} />
				<Loading loading={isLoading } />
				{ filter }
				<Recent levels={levels} />
			</Col>
		</Row>
		</Container>
	);
	
}