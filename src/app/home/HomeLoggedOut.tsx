import React, { ReactElement, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';

import { Message } from '../components/Misc';
import CacheBuster from '../components/CacheBuster';
import PreviewList from '../if/PreviewList';
import PreviewLevel from '../if/PreviewLevel';
import { IfLevelSchema, EXCEL_TUTORIAL_LEVEL_LIST, SQL_TUTORIAL_LEVEL_LIST } from '../../shared/IfLevelSchema';

/*
	The anonymous view of '/'. 
	The tutorial previews are split into two tables, Excel and SQL, off the
	shared level lists.
*/
export default function HomeLoggedOut(): ReactElement {
	const [previewLevelCode, setPreviewLevelCode] = useState('');
	const [level, setLevel] = useState<null|IfLevelSchema>(null);
	const [message, setMessage] = useState('');
	const [messageStyle, setMessageStyle] = useState('');

	useEffect( () => {
		if(previewLevelCode == '') return;
		setLevel(null);

		fetch('/api/levels/previewlevel/'+previewLevelCode, {
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
			})
			.catch( error => {
				setLevel(null);
				setMessage('Error: ' + error);
				setMessageStyle('danger');
			});

		}, [previewLevelCode]);

	const preview = previewLevelCode == ''
			? null
			: <PreviewLevel level={level} close={ () => setPreviewLevelCode('') } />;

	return (
		<Container fluid>
			<Row><Col>
				<div className='card' style={{ backgroundColor: '#f5f5f5', marginTop: 10 }}>
					<div className='card-body'>
						<div className='card-text'>

							<h3>A free Excel & SQL tutorial system</h3>
							This website teaches you how to write SQL queries and Excel formulas.
							<br/><br/>
							It is a research project developed by <a href='https://profgarrett.com'>Nathan Garrett</a>.
							Some  publications about it are <a href='https://scholar.google.com/citations?user=UJXCwEcAAAAJ&hl=en&oi=ao'>posted online</a>.
							The site is free for both individuals and faculty.
							<br/><br/>
							For any questions or comments, please contact me at <a href='mailto:profgarrett@gmail.com'>profgarrett@gmail.com</a>.
							I&apos;m happy to setup a class structure for faculty to simplify the grading process.
							</div>
					</div>
				</div>
			</Col>
			</Row>

			<Row>
				<Col>
					<CacheBuster/>
					<div style={{ paddingTop: 10}} />
					<Message message={message} style={messageStyle} />

					<Link to='/login'>
						<Button variant='primary' size='lg'>
							Login or create an account to start working on tutorials
						</Button>
					</Link>

					<PreviewList
						title='Preview an Excel tutorial'
						codes={ EXCEL_TUTORIAL_LEVEL_LIST }
						onPreviewLevel={ setPreviewLevelCode } />

					<PreviewList
						title='Preview a SQL tutorial'
						codes={ SQL_TUTORIAL_LEVEL_LIST }
						onPreviewLevel={ setPreviewLevelCode } />

					{ preview }
				</Col>
			</Row>
		</Container>
	);
}
