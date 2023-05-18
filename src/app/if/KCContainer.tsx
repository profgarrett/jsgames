import React, { ReactElement, useEffect, useState } from 'react';

import { Container, Breadcrumb, Row, Col, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import { IfPageAnswer } from '../../shared/IfPageSchemas';
import { ClassProgressChart } from './ClassProgressChart';
import { KCCharts } from './KCCharts';
import { LevelModal } from './LevelModal';
import { Message, Loading } from '../components/Misc';
import Filter from './Filter';
import { DEMO_MODE } from '../../server/secret';

import ForceLogin from '../components/ForceLogin';
import { IfLevelSchema } from '../../shared/IfLevelSchema';

export default function KCContainer() {
	const [message, setMessage] = useState('Loading data from server')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [answers, setAnswers] = useState<IfPageAnswer[]|null>(null);

	const [modalLevel, setModalLevel] = useState<IfLevelSchema|null>(null);
	const [isModalLoading, setIsModalLoading] = useState(false);

	const params = useParams();
	const navigate = useNavigate();
	const _id = params._id ? params._id : null;
	

	const onReady = (filter: any) => {
		setIsLoading(false);
		setMessage('');
		onRefreshData(filter);
	};

	const onRefreshData = (filter: any) => {
		const args: string[] = [];

		if(filter.sections !== '') args.push('idsection='+filter.sections);
        if(filter.levels !== '') args.push('code='+filter.levels);

		setIsLoading(true);
		setMessage('Loading progress data');
		
		fetch('/api/reports/answers?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
                const answers = json.map( j => new IfPageAnswer(j) )
				setAnswers(answers);
				setMessage('');
				setMessageStyle('');
				setIsLoading(false);

			})
			.catch( error => {
				setAnswers(null);
				setMessage('Error: ' + error.message);
				setIsLoading(false);
				setMessageStyle('Error');
			});
	}


	/*
		Load a level to view as a modal box.
	*/
	const show_modal = (level_id: number) => {
		setIsModalLoading(true);

		fetch('/api/reports/level/'+level_id , {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				setModalLevel(ifLevel);
				setIsModalLoading(false);
			})
			.catch( error => {
				setModalLevel(null);
				setIsModalLoading(false);
				setMessage('Error: ' + error.message);
			});
	}

	const hide_modal = () => {
		setModalLevel(null);
	}

	// Render
	const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='KC Analysis' active>KC Analysis</Breadcrumb.Item>
			</Breadcrumb>
			);
	
	const default_level = 'math1';

	const search = new URLSearchParams(window.location.search);
	const filter_defaults = search.has('idsection') 
		? { levels: default_level, sections: search.get('idsection') }
		: { levels: default_level };
	
	const filter = <Filter 
			onChange={onRefreshData} 
			onReady={onReady} 
			disabled={isLoading} 
			defaults={filter_defaults}
			filters={{
				levels: [],
				sections: []
			}}
		/>;

	const empty = !isLoading && answers !== null && answers.length == 0
			? <p>No students in this section have yet started completing lessons. Once they get started, you'll see a chart here with their progress</p>
			: null;
	const modal = modalLevel == null 
			? null
			: <LevelModal level={modalLevel} hide={ () => hide_modal() }/>;

	const dom_answers = answers !== null && answers.length > 0 
			? <KCCharts answers={answers} />
			: null

	return (
		<Container fluid>
		<Row>
			<Col>
				<ForceLogin/>
				{ crumbs }
				<h3>Student Learning</h3>
				<Message message={message} style={messageStyle} />
				<Loading loading={ isLoading || isModalLoading } />
				{ modal }
				{ filter }
				{ empty }
				{ dom_answers }				
			</Col>
		</Row>
		</Container>
	);

}