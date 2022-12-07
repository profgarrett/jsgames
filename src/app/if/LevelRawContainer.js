// @flow
import React from 'react';
//import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb, Button  } from 'react-bootstrap';
import { Message, Loading } from './../components/Misc';
import ReactJson from 'react-json-view';
//import { getUserFromBrowser } from './../components/Authentication';
import { IfLevelSchema } from './../../shared/IfLevelSchema';

import ForceLogin from './../components/ForceLogin';
import { IfPageBaseSchema } from './../../shared/IfPageSchemas';
import type { Node } from 'react';


type PropsType = {
	match: any
};
type StateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	level: ?IfLevelSchema,
	pageIndex: ?number,
	_id: number
};



export default class LevelScoreContainer extends React.Component<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			level: null,
			pageIndex: null,
			_id: this.props.match.params._id
		};
        (this: any).update_level = this.update_level.bind(this);
        (this: any).delete_page = this.delete_page.bind(this);
        (this: any).delete_level = this.delete_level.bind(this);
	}

    // Call to remove a page from an object.
    // Uses array indexing, so i starts with 0.
    delete_page(i: number) {
        const level = this.state.level;

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

        this.update_level(level);
    }

    delete_level(level: IfLevelSchema) {

		// Show loading status.
		this.setState({ 
			message: 'Saving...',
			messageStyle: '',
			isLoading: true
		});

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

				// Add feedback event to the level and then show.
				this.setState({ 
					isLoading: false,
					level: null,
					pageIndex: null,
                    message: 'Level deleted',
                    messageStyle: '',
				});
				
			})
			.catch( (error: any) => {
				this.setState({ 
					level: null, 
					pageIndex: null,
					message: error.message,
					isLoading: false
				});
			});
    }

    update_level(level_json: any) {
        
        // Convert back into regular IfLevel.
        const level = new IfLevelSchema(level_json);

        // No updates if the level is completed.
        if(level.completed) throw new Error('Can not update completed level');

		// Show loading status.
		this.setState({ 
			message: 'Saving...',
			messageStyle: '',
			isLoading: true
		});

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
			.then( (ifLevel: IfLevelSchema) => {

				// Add feedback event to the level and then show.
				this.setState({ 
					isLoading: false,
					level: ifLevel,
					pageIndex: null,
                    message: 'Update saved',
                    messageStyle: '',
				});
				
			})
			.catch( (error: any) => {
				this.setState({ 
					level: null, 
					pageIndex: null,
					message: error.message,
					isLoading: false
				});
			});
    }

	componentDidMount() {
		let _id = this.props.match.params._id;
		let _pageIndex = this.props.match.params._pageIndex;
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
			.then( ifLevel => {
				this.setState({
					level: ifLevel,
					pageIndex: _pageIndex,
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					level: null,
					message: 'Error: ' + error,
					isLoading: false
				});
			});
	}


    render_level( level: IfLevelSchema ): Node {
        
        if(this.state.isLoading) return <p>Loading...</p>;
        
        const dom_delete_last_page = level.pages.length > 1 
            ? <div><Button onClick={ () => this.delete_page(level.pages.length-1)}>Delete last page ({level.pages.length})</Button></div>
            : '';

        const dom_delete_level = <div><Button onClick={ () => this.delete_level(level)}>Delete entire level</Button></div>;

        const dom_level =  <ReactJson 
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

        return <div>
                <h3>Level {level.title} ({level._id})</h3>
                { dom_delete_last_page }
                { dom_delete_level }
                <b>Raw Json (some editing ok in pages)</b>
                { dom_level }
            </div>;
        
    }
    
    render_page( page: IfPageBaseSchema ): Node {
        if(this.state.isLoading) return <p>Loading...</p>;
		if( this.state.pageIndex === null ) return <h1>No page index</h1>;

		const history = page.history;

        const dom_page =  <ReactJson 
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
		return (<div>
			<h1>Page { this.state.pageIndex }</h1>
			<ul>{ history_lis }</ul>
			{ dom_page }
		</div>);
	}

	render(): Node {
		const level = this.state.level;
		const pageIndex = this.state.pageIndex;

        const levelraw = (level === null || typeof level === 'undefined') 
			? 'loading...' 
			: this.render_level(level);

		const crumbs = this.state.level ?
			<Breadcrumb>
				<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
				<Breadcrumb.Item active>{ this.state.level.title }</Breadcrumb.Item>
			</Breadcrumb>
			: <span></span>;

		
		const back = this.state.level ?
			<Button variant='primary' 
					style={{ marginBottom: 20, marginTop: 20 }} 
					href={ '/ifgame/' }>
					Back to home page
			</Button>
			: <span />;

		// If we have an optional argument to highlight page, then go ahead and show it first above the rest.
		let render_page = null;
		if( typeof pageIndex !== 'undefined' && pageIndex !== null && typeof level !== 'undefined' && level !== null ) {
			render_page = 	this.render_page( level.pages[pageIndex]);
		}

		return (
			<Container fluid>
				<Row>
					<Col>
						<ForceLogin/>
						{ crumbs }
						<h3>{ this.state.level ? this.state.level.title : '' }</h3>

						<Message message={this.state.message} style={this.state.messageStyle} />
						<Loading loading={this.state.isLoading } />
						{ render_page }
						<div style={{ textAlign: 'center' }}>{ back }</div>
						{ levelraw }
						<div style={{ textAlign: 'center' }}>{ back }</div>
						<br/>
					</Col>
				</Row>
			</Container>
		);
	}
}