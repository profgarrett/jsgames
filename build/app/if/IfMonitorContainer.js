//     
import React from 'react';
import { Container, Row, Col, Breadcrumb, Button  } from 'react-bootstrap';

import IfMonitor from './IfMonitor';
import { Message, Loading } from './../components/Misc';
import Filter from './Filter';

import { IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';

                                           
                                  


                           

                                  
                 
                      
                    
                         
  

export default class IfMonitorContainer extends React.Component                                              {
	constructor(props     ) {
		super(props);
		this.state = { 
			message: 'Loading filter data',
			messageStyle: '',
			isLoading: true,
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
		
		if(filter.code != '') args.push('code='+filter.code);
		if(filter.idsection !== '') args.push('idsection='+filter.idsection);
		if(filter.iduser !== '') args.push('iduser='+filter.iduser);

		this.setState({ isLoading: true, message: 'Loading data' });

		fetch('/api/ifgame/recent_levels?'+args.join('&'), {
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
					messageStyle: 'Error',
					isLoading: false
				});
			});
	}



	render()       {

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Monitor' active>Monitor</Breadcrumb.Item>
			</Breadcrumb>
			);

		return (
			<Container fluid='true'>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Recent Activity</h3>

					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					<Filter onChange={this.onRefreshData} onReady={this.onReady} disabled={this.state.isLoading} />
					<IfMonitor levels={this.state.levels} />
				</Col>
			</Row>
			</Container>
		);
	}
}