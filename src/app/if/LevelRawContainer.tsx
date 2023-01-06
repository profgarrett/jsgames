import React, { ReactElement, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import { useParams, useNavigate } from 'react-router-dom';


import { Row, Col, Breadcrumb, Button  } from 'react-bootstrap';
import { Message, Loading } from '../components/Misc';
//import ReactJson from 'react-json-view';
import { IfLevelSchema } from '../../shared/IfLevelSchema';

import ForceLogin from '../components/ForceLogin';
import { IfPageBaseSchema } from '../../shared/IfPageSchemas';



export default function LevelScoreContainer() {

	const [message, setMessage] = useState('Loading data from server')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [level, setLevel] = useState<IfLevelSchema|null>(null);
	const [pageIndex, setpageIndex] = useState<any>(null);

	const params = useParams();
	const navigate = useNavigate();
	const _id = params._id ? params._id : null;
	const _pageIndex = params._pageIndex ? params._pageIndex : null;

    // Call to remove a page from an object.
    // Uses array indexing, so i starts with 0.
    const delete_page = (i: number) => {

		// Safety check- only run if we've loaded a level.
		if(level === null || typeof level === 'undefined') return;

        level.pages.splice(i, 1);

        // No updates if the level is completed.
        if(level.completed) throw new Error('Can not update completed level');

        // Don't delete all pages. Update algo requires >0 pages.
        if(level.pages.length === 0) throw new Error('Should not delete all pages');

        // We may have deleted the last page. Make sure that the latest page
        // is marked as uncompleted.
        // Otherwise, the algorithm that updates pages will be upset, as 
        // it should be the only thing to mark a page as finished.
        if(level.pages.length > 0) {
            level.pages[level.pages.length-1].completed = false;
        }

        update_level(level);
    }

    const delete_level = (level: IfLevelSchema) => {
		setMessage('Saving...');
		setMessageStyle('')
		setIsLoading(true);

		// Create url allowing whole-sale replacement of level with new information.
		const url = '/api/levels/level/'+level._id+'/delete'; 

		// Fire AJAX.
		fetch(url, {
				method: 'post',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: level.toJsonString()
			})
			.then( (response: any): any => response.json() )
			.then( (json: any) => {
				if(json._error) throw new Error(json._error); 
                console.log(json);
				setIsLoading(false);
				setpageIndex(null);
				setMessage('Level deleted');
				setMessageStyle('')

				
			})
			.catch( (error: any) => {
				setLevel( null );
				setpageIndex(null);
				setMessage('Error: ' + error.message);
				setIsLoading(false);

			});
    }

    const update_level = (level_json: any) => {
        
        // Convert back into regular IfLevel.
        const level = new IfLevelSchema(level_json);

        // No updates if the level is completed.
        if(level.completed) throw new Error('Can not update completed level');

		// Show loading status.
		setMessage('Saving...');
		setMessageStyle('')
		setIsLoading(true);

		// Create url allowing whole-sale replacement of level with new information.
		const url = '/api/levels/level/'+level._id+'?validate_only=0&replace=1'; 

		// Fire AJAX.
		fetch(url, {
				method: 'post',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: level.toJsonString()
			})
			.then( (response: any): any => response.json() )
			.then( (json: any): IfLevelSchema => {
				if(json._error) throw new Error(json._error); 
				return new IfLevelSchema(json);
			})
			.then( (level: IfLevelSchema) => {
				setIsLoading(false);
				setpageIndex(null);
				setLevel(level);
				setMessage('Update saved');
				setMessageStyle('')

				
			})
			.catch( (error: any) => {
				setLevel( null );
				setpageIndex(null);
				setMessage('Error: ' + error.message);
				setIsLoading(false);
			});
    }


	useEffect( () => {
		const url =  '/api/levels/level/'+_id+'/tagged';

		fetch(url, {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( level => {
				setIsLoading(false);
				setLevel(level);
				setMessage('');
				setMessageStyle('')
			})
			.catch( error => {
				setLevel( null );
				setpageIndex(null);
				setMessage('Error: ' + error.message);
				setIsLoading(false);

			});
	}, [_id] );


    const render_level = ( level: IfLevelSchema ): ReactElement => {
        
        if(isLoading) return <p>Loading...</p>;
        
        const dom_delete_last_page = level.pages.length > 1 
            ? <div><Button onClick={ () => delete_page(level.pages.length-1)}>Delete last page ({level.pages.length})</Button></div>
            : '';

        const dom_delete_level = <div><Button onClick={ () => delete_level(level)}>Delete entire level</Button></div>;

        const dom_level = <div>Not implemented</div>;
		/* <ReactJson 
                src={level.toJson() } 
                collapsed={ 3 }
                displayDataType={ false }
                enableClipboard={ false }
                onEdit={ (edit) => this.update_level(edit.updated_src) }
                shouldCollapse={ field => (
                        field.name === 'history' || 
                        field.name === 'pages' ||
                        field.name === 'props' 
                )}
            />;
			*/

        return <div>
                <h3>Level {level.title} ({level._id})</h3>
                { dom_delete_last_page }
                { dom_delete_level }
                <b>Raw Json (some editing ok in pages)</b>
                { dom_level }
            </div>;
        
    }
    
    const render_page = ( page: IfPageBaseSchema ): ReactElement => {
        if(isLoading) return <p>Loading...</p>;
		if( pageIndex === null ) return <h1>No page index</h1>;

		const history = page.history;

        const dom_page = <h1>Not implmented</h1>
		/* <ReactJson 
                src={page.toJson() } 
                collapsed={ 1 }
                displayDataType={ false }
                enableClipboard={ false }
                shouldCollapse={ field => (
                        field.name === 'history' || 
                        field.name === 'pages' ||
                        field.name === 'props' 
                )}
            />;
					

		const history_lis = history.map( (h,i) => {
			console.log(h);
			const content = '' +
				(typeof h.predicted_answers_used === 'undefined' ? '' : '['+h.predicted_answers_used.join(', ') +'] ') +
				(typeof h.client_f === 'undefined' ? '' : h.client_f) +
				(typeof h.tags !== 'undefined' && h.tags.length > 0 ? ' ['+h.tags.map( tag => tag.tag ).join(', ') +']' : '');
			
			return <li key={'pageHistory'+i}> { h.dt.toString()} : { h.code } - { content }</li>;
		});
		*/
		return (<div>
			<h1>Page { pageIndex }</h1>
			<ul>{ "history_lis" }</ul>
			{ dom_page }
		</div>);
	}


	const levelraw = (level === null || typeof level === 'undefined') 
		? 'loading...' 
		: render_level(level);

	const crumbs = level ?
		<Breadcrumb>
			<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
			<Breadcrumb.Item active>{ level.title }</Breadcrumb.Item>
		</Breadcrumb>
		: <span></span>;

	
	const back = level ?
		<Button variant='primary' 
				style={{ marginBottom: 20, marginTop: 20 }} 
				href={ '/ifgame/' }>
				Back to home page
		</Button>
		: <span />;

		// If we have an optional argument to highlight page, then go ahead and show it first above the rest.
		let render_page2;
		if( typeof pageIndex !== 'undefined' && pageIndex !== null && typeof level !== 'undefined' && level !== null ) {
			render_page2 = 	render_page( level.pages[pageIndex]);
		}
		return <h1>Not coded</h1>;
/*
		return (
			<Container fluid>
				<Row>
					<Col>
						<div>
						<ForceLogin/>
						{ crumbs }
						<h3>{ level ? level.title : '' }</h3>

						<Message message={message} style={messageStyle} />
						<Loading loading={isLoading } />
						{ render_page }
						<div style={{ textAlign: 'center' }}>{ back }</div>
						{ levelraw }
						<div style={{ textAlign: 'center' }}>{ back }</div>
						<br/>
						</div>
					</Col>
				</Row>
			</Container>
		);
*/
}