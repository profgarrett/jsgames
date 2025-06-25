import React, { useState, ReactElement } from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb, Tab, Tabs  } from 'react-bootstrap';

import RecentLevelTable from './RecentLevelTable';
import RecentQuestionTable from './RecentQuestionTable';
import RecentAnswerTable from './RecentAnswerTable';
import { Message, Loading, IStringIndexJsonObject } from '../components/Misc';
import Filter from './Filter';

import { useParams } from 'react-router-dom';

import { IfLevelSchema } from '../../shared/IfLevelSchema';
import ForceLogin from '../components/ForceLogin';


export default function IfRecentContainer(): ReactElement {
	const [ message, setMessage ] = useState('Loading filter data');
	const [ messageStyle, setMessageStyle ] = useState('');
	const [ isLoading, setIsLoading ] = useState(true);
	const [ levels, setLevels ] = useState([]);

	const params = useParams();
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
		if(filter.days !== '') args.push('updated='+filter.days*24*60); // convert into minutes
		args.push('pageless=0'); // return with pages

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
			.then( json => json.map( j => new IfLevelSchema(j) ) )
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
			<Breadcrumb.Item title='home' href='/'>Home</Breadcrumb.Item>
			<Breadcrumb.Item title='My Progress' href='/ifgame' >My Progress</Breadcrumb.Item>
			<Breadcrumb.Item title='Recent activity' active>Recent</Breadcrumb.Item>
		</Breadcrumb>
		);

	const search = new URLSearchParams(window.location.search);

	const filter_defaults = { sections: _idsection, days: 7, levels: 'feedback_t' };

	const filter_filters = {
		levels: [],
		sections: [],
		users: [],
		days: [ 
			{ value: 0.03, label: '1 hour'} , 
			{ value: 1, label: '1 day'} , 
			{ value: 3, label: '3 days'}, 
			{ value: 7, label: '1 week' },
			{ value: 14, label: '2 weeks' },
			{ value: 21, label: '3 weeks' },
			{ value: 28, label: '4 weeks' },
			{ value: 356, label: '1 year' },
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
				<Tabs defaultActiveKey='answers' className='mb-3'>
					<Tab eventKey='levels' title='Levels' >
						<RecentLevelTable levels={levels} />
					</Tab>
					<Tab eventKey='questions' title='Questions'>
						<RecentQuestionTable levels={levels} />
					</Tab>
					<Tab eventKey='answers' title='Answers'>
						<RecentAnswerTable levels={levels} />
					</Tab>
				</Tabs>
			</Col>
		</Row>
		</Container>
	);
	
}