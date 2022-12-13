import React, { ReactElement, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb } from 'react-bootstrap';

import Questions from './Questions';
import { Message, Loading } from '../components/Misc';
import Filter from './Filter';

import { IfLevels, IfLevelSchema } from '../../shared/IfLevelSchema';

import ForceLogin from '../components/ForceLogin';

export default function QuestionsContainer() {
	const [ message, setMessage ] = useState('Loading data from server');
	const [ messageStyle, setMessageStyle ] = useState('');
	const [ isLoading, setIsLoading ] = useState(true);
	const [ pagetype, setPagetype ] = useState('');
	const [ outputs, setOutputs ] = useState('');
	const [ levels, setLevels ] = useState([]); // IfLevelSchemas

	const onReady = (filter: any) => {
		setIsLoading(false);
		setMessage('');
		onRefreshData(filter);
	}

	const onRefreshData = (filter: any) => {
		const args: string[] = [];

		// Set server-level filters for the http request.
		if(filter.levels !== '') args.push('code='+filter.levels);
		if(filter.sections !== '') args.push('idsection='+filter.sections);
		if(filter.users !== '') args.push('iduser='+filter.users);

		
		// Set local filters, which are applied locally.
		if(filter.pagetypes !== '') setPagetype(filter.pagetypes);
		if(filter.outputs !== '') setOutputs( filter.outputs);

		setIsLoading(true);
		setMessage('Loading question data');

		fetch('/api/reports/questions?' +args.join('&'), {
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
				setMessageStyle('');
				setMessage('');
				setIsLoading(false);
				
			})
			.catch( error => {
				setLevels([]);
				setMessageStyle('danger');
				setMessage('Error: ' + error);
				setIsLoading(false);
			});
	}


	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
			<Breadcrumb.Item title='Questions' active>Questions</Breadcrumb.Item>
		</Breadcrumb>
		);

	const default_type =  'All';  // 'IfPageFormulaSchema|IfPageHarsonsSchema|IfPagePredictFormulaSchema';
	const default_output = 'excel';
	const default_level = 'if1';

		//'IfPageChoice'; 
		//'IfPageNumberAnswerSchema'; //'IfPageFormulaSchema|IfPageHarsonsSchema'
	const search = new URLSearchParams(window.location.search);
	const filter_defaults = search.has('idsection') 
		? { pagetypes: default_type, outputs: default_output, levels: default_level, sections: search.get('idsection') }
		: { pagetypes: default_type, outputs: default_output, levels: default_level };

	

	const filter = <Filter 
			onChange={onRefreshData} 
			onReady={onReady} 
			disabled={isLoading} 
			defaults={filter_defaults}
			filters={{ 
				levels: [], 
				sections: [], 
				users: [], 
				pagetypes: [], 
				outputs: [
					{ value: 'tags', label: 'Tags'},
					{ value: 'table', label:'Table' },
					{ value: 'excel',  label:'Excel' },
					{ value: 'chart', label: 'Chart' },
				]
			}}
		/>;


	// Filter returned values based off of pagetype filter set in state.
	const filterpagetype = (type: string) => pagetype === 'All' || pagetype.split('|').includes( type );

	let filtered_levels = levels.map( (level: IfLevelSchema) => { 
		// Note: filtering by level will break some of the table functionalisty (i.e., linking the raw version
		// of a page).
		let new_level = new IfLevelSchema(level.toJson()); // create a new level.
		new_level.pages = new_level.pages.filter(p => filterpagetype(p.type) ); // filter page.
		return new_level;
	});

	return (
		<Container fluid>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Questions</h3>

					<Message message={message} style={messageStyle} />
					<Loading loading={isLoading } />
					{ filter }
					<Questions levels={filtered_levels} output={outputs} />
				</Col>
			</Row>
		</Container>
	);
}