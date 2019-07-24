//     
import React from 'react';
import { Container, ButtonToolbar, ButtonGroup, Row, Col, Breadcrumb, DropdownButton, Dropdown, Button  } from 'react-bootstrap';

import IfQuestions from './IfQuestions';
import { Message, Loading } from './../components/Misc';
import Filter from './Filter';

import { IfLevels, IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';

                                           
                                  


                             

                                    
                 
                      
                    
                  
                 
                         
  

export default class IfQuestionsContainer extends React.Component                                                  {
	constructor(props     ) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			pagetype: '',
			outputs: '',
			levels: [],
		};
		(this     ).onRefreshData = this.onRefreshData.bind(this);
		(this     ).onReady = this.onReady.bind(this);
	}

	onReady(filter        ) {
		this.setState({ isLoading: false, message: ''});
		this.onRefreshData(filter);
	}

	onRefreshData(filter        ) {
		const args = [];

		// Set server-level filters for the http request.
		if(filter.levels !== '') args.push('code='+filter.levels);
		if(filter.sections !== '') args.push('idsection='+filter.sections);
		if(filter.users !== '') args.push('iduser='+filter.users);


		// Set local filters, which are applied locally.
		if(filter.pagetypes !== '') this.setState({ pagetype: filter.pagetypes });
		if(filter.outputs !== '') this.setState({ outputs: filter.outputs });

		this.setState({ isLoading: true, message: 'Loading question data'});

		fetch('/api/ifgame/questions?' +args.join('&'), {
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
				this.setState({
					levels: ifLevels,
					messageStyle: '',
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					messageStyle: 'danger',
					isLoading: false
				});
			});
	}



	render()       {

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Questions' active>Questions</Breadcrumb.Item>
			</Breadcrumb>
			);


		const search = new URLSearchParams(window.location.search);
		const filter_defaults = search.has('idsection') 
			? { pagetypes: 'IfPageFormulaSchema|IfPageHarsonsSchema', outputs: 'tags', levels: 'math1', sections: search.get('idsection') }
			: { pagetypes: 'IfPageFormulaSchema|IfPageHarsonsSchema', outputs: 'tags', levels: 'math1'};
		

		const filter = <Filter 
				onChange={this.onRefreshData} 
				onReady={this.onReady} 
				disabled={this.state.isLoading} 
				defaults={filter_defaults}
				filters={{ 
					levels: [], 
					sections: [], 
					users: [], 
					pagetypes: [], 
					outputs: [
						{ value: 'tags', label: 'Tags'},
						{ value: 'table', label:'Table' },
						{ value: 'excel',  label:'Excel' }
					]
				}}
			/>;


		// Filter returned values based off of pagetype filter set in state.
		const filterpagetype = (type        ) => this.state.pagetype.split('|').includes( type ) ;
		const filtered_levels = this.state.levels.map( (level           ) => { 
			const pages = level.pages.filter(p => filterpagetype(p.type) );
			return { ...level, pages };
		});

		return (
			<Container fluid='true'>
				<Row>
					<Col>
						<ForceLogin/>
						{ crumbs }
						<h3>Questions</h3>

						<Message message={this.state.message} style={this.state.messageStyle} />
						<Loading loading={this.state.isLoading } />
						{ filter }
						<IfQuestions levels={filtered_levels} output={this.state.outputs} />
					</Col>
				</Row>
			</Container>
		);
	}
}