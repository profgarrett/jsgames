import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import { Button, Row, Col, Navbar, ListGroup, Breadcrumb, Badge, FormControl } from 'react-bootstrap';

import { Message } from './../components/Misc';

import { IfLevelSchema } from './../../shared/IfLevelSchema';
import { IfPageBaseSchema } from '../../shared/IfPageSchemas';

import ForceLogin from './../components/ForceLogin';
import CacheBuster from './../components/CacheBuster';

import QRCode from "react-qr-code";
import { ResponsiveBar } from '@nivo/bar';

const REFRESH_TIME_IN_MS = 3000;


/* Provide a list of numbers
	Returns react
	*/
const build_chart_of_numeric_responses = (responses: number[]): ReactElement => {

	const counts = {};
	let min = 0;
	let max = 0;

    responses.forEach( (num) => {
		if(min < num) min = num;
		if(max > num) max =  num;
        counts[num] = (counts[num] || 0) + 1;
    });

	// reformat for bar
    const data = Object.keys(counts).map((key) => ({
        number: key,
        count: counts[key]
    }));

	return <ResponsiveBar
			data={data}
			keys={['count']}
			indexBy="number"

			margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
			padding={0.3}
			valueScale={{ type: 'linear' }}
			indexScale={{ type: 'band', round: true }}
			colors={{ scheme: 'nivo' }}
			borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Number',
				legendPosition: 'middle',
				legendOffset: 32
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Count',
				legendPosition: 'middle',
				legendOffset: -40
			}}
			labelSkipWidth={12}
			labelSkipHeight={12}
			labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
			legends={[
				{
					dataFrom: 'keys',
					anchor: 'bottom-right',
					direction: 'column',
					justify: false,
					translateX: 120,
					translateY: 0,
					itemsSpacing: 2,
					itemWidth: 100,
					itemHeight: 20,
					itemDirection: 'left-to-right',
					itemOpacity: 0.85,
					symbolSize: 20,
					effects: [
						{
							on: 'hover',
							style: {
								itemOpacity: 1
							}
						}
					]
				}
			]}
			animate={true}
		/>;
}

export default function FeedbackContainer() {
	const [question, setQuestion] = useState('Place your question here')
	const [message, setMessage] = useState('')
	const [messageStyle, setMessageStyle] = useState('');
	const [levels, setLevels] = useState<IfLevelSchema[]>([]);
	const [feedbackType, setFeedbackType] = useState('');
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const url = window.location.href.split('/');
	const sectionid = Number.parseInt(url[url.length-1]);

	// Fetch levels
	const updateLevels = (sectionid: number, feedbackType: string, startTimeout: Function) => { 

		fetch('/api/reports/recent?pageless=0&updated=10&code='+feedbackType + '&idsection='+sectionid, {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				const ifLevels = json.map( j => new IfLevelSchema(j) );
				setLevels(ifLevels);
				startTimeout(sectionid, feedbackType);
			})
			.catch( error => {
				console.log(error);
				setMessage('Error: ' + error);
				setMessageStyle('danger');
			});
		};

	// Refresh 
	const startTimeout = (sectionid, feedbackType) => {
		timeoutRef.current = setTimeout(() => {
			updateLevels(sectionid, feedbackType, startTimeout);
		}, REFRESH_TIME_IN_MS);
	};
		 
	const response_url = '/ifgame/feedback/create/' + feedbackType;

	const qr = feedbackType == '' 
		? null 
		: <div style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}>
		  <QRCode
			size={256}
			style={{ height: "auto", maxWidth: "100%", width: "100%", paddingBottom: '20px' }}
			value={response_url}
			viewBox={`0 0 256 256`}
		  />
		</div>;


	const load = (sectionid: number, feedbackType: string) => {
		setFeedbackType(feedbackType);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		};
		updateLevels(sectionid, feedbackType, startTimeout);
	};

	const feedback_buttons = feedbackType == '' 
		? (<>
			<Button key='b1' onClick={ () => load(sectionid, 'feedback_t') }>Text</Button>
			<Button key='b2' onClick={ () => load(sectionid, 'feedback_n') }>Number</Button>
		</>)
		: <></>;


	const _render_page = (p: IfPageBaseSchema, key: number): ReactElement => {
		let results = '';

		if(p.type == 'IfPageShortTextAnswerSchema') {
			results = p.toIfPageShortTextAnswerSchema().client;
		} else if(p.type == 'IfPageLongTextAnswerSchema') {
			results = p.toIfPageLongTextAnswerSchema().client;
		} else if(p.type == 'IfPageNumberAnswerSchema') {
			results = '' + p.toIfPageNumberAnswerSchema().client;
		} else {
			throw new Error('Invalid IfPageBaseSchema type of ' + p.type + ' (feedback_render_page)');
		}

		// Don't show empty results
		if(results == '') return <></>;

		return <ListGroup.Item key={'feedbacklevelpage'+key}>{ results }</ListGroup.Item>;
	};
	
	
	const feedback = <div className='card' style={{ backgroundColor: '#f5f5f5', marginBottom: 40 }}>
			<div className='card-body'>
				<div className='card-text'>
					<FormControl 
						type='text'
						size='lg'
						value={ question }
						placeholder='Type your question here'
						onChange={ (e) => setQuestion( e.target.value ) }
						/>
				</div>
			</div>
		</div>;
	
	// Filter out bad entries
	let levels_sorted = levels.filter( l => {
			if(l.pages.length < 1) return false;
			if( typeof l.pages[0].client == 'undefined' 
				|| l.pages[0].client == null
				|| l.pages[0].client == 'null') return false;
			return ('' + l.pages[0].client).length > 0;
		}).sort( (a, b) => a.created > b.created ? 1 : -1 );

	let client_sorted = levels_sorted.map( l => l.pages[0].client );

	const results = feedbackType == 'feedback_n'
		? build_chart_of_numeric_responses(client_sorted) 
		: <ListGroup variant="flush">
						{ levels_sorted.map( ( l, i ) => { return _render_page(l.pages[0], i); } )}
					</ListGroup>;

	const userids_strings = levels_sorted.map( ( l ) =>  l.username  ).sort();

	const userids = userids_strings.map( ( id, i ) => <Badge bg='secondary' key={'feedbackcontaineruserid'+i}>{id}</Badge> );

	return (
			<Container fluid>
				<Navbar bg='dark' variant='dark'>
					<Container fluid>
						<Navbar.Brand href='/'>Excel.fun</Navbar.Brand>
					</Container>
				</Navbar>
				<Breadcrumb>
					<Breadcrumb.Item href={'/'}>Home</Breadcrumb.Item>
					<Breadcrumb.Item href={'/ifgame/'}>My Progress</Breadcrumb.Item>
					<Breadcrumb.Item active={ true } href={'/ifgame/feedback'}>Feedback</Breadcrumb.Item>
				</Breadcrumb>

				{ feedback }
				{ feedback_buttons }
				<a href={response_url}>{qr}</a>				
				
				<ForceLogin />
				<CacheBuster/>
				<Message message={message} style={messageStyle} />

				<Row>
					<Col>
						{ results }
					</Col>
					<Col>
						{ userids }
					</Col>
					<Col>
						<div style={{ paddingBottom: '300px'}}></div>
						<br/><br/><br/>
					</Col>
				</Row>
			</Container>
	);

}

/*

			*/