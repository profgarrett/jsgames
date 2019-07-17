//     
import React from 'react';
import { Container, Row, Col, Breadcrumb  } from 'react-bootstrap';

import IfGrades from './IfGrades';
import { Message, Loading } from './../components/Misc';
import Filter from './Filter';

import ForceLogin from './../components/ForceLogin';

                                  


                          

                                 
                 
                      
                    
                 
  

export default class IfGradesContainer extends React.Component                                            {
	constructor(props     ) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			data: []
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

		if(filter.sections !== '') args.push('idsection='+filter.sections);

		this.setState({ isLoading: true, message: 'Loading grade data'});
		
		fetch('/api/ifgame/grades?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				this.setState({
					data: json,
					messageStyle: '',
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					data: [],
					message: 'Error: ' + error,
					messageStyle: 'Error',
					isLoading: false
				});
			});
	}



	render()       {

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Grades' active>Grades</Breadcrumb.Item>
			</Breadcrumb>
			);


		const search = new URLSearchParams(window.location.search);
		const filter_defaults = search.has('idsection') 
			? { sections: search.get('idsection') }
			: {};
		
		const filter = <Filter 
				onChange={this.onRefreshData} 
				onReady={this.onReady} 
				disabled={this.state.isLoading} 
				defaults={filter_defaults}
				filters={{sections: [] }}
			/>;

		return (
			<Container fluid='true'>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Grades</h3>
					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					{ filter }
					<IfGrades data={this.state.data} />
				</Col>
			</Row>
			</Container>
		);
	}
}