//     
import React from 'react';
import { Row, Col, Breadcrumb, Button  } from 'react-bootstrap';

import IfGrades from './IfGrades';
import { Message, Loading } from './../components/Misc';

import ForceLogin from './../components/ForceLogin';

                                  


                          

                                 
                 
                      
                    
                 
  

export default class IfGradesContainer extends React.Component                                            {
	constructor(props     ) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			data: [],
		};
		(this     ).refreshData = this.refreshData.bind(this);
		(this     ).handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		// Load data.
		this.refreshData();
	}


	handleSubmit(e                                    ) {
		if(e) e.preventDefault();
		this.refreshData();
	}

	refreshData() {

		fetch('/api/ifgame/grades', {
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

		const filter = (
			<form name='c' onSubmit={this.handleSubmit}>
				<Button bsStyle='primary'>Refresh filter</Button>
			</form>
			);

		return (
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
		);
	}
}