//     
import React from 'react';
import { Row, Col, Breadcrumb, DropdownButton, MenuItem, Button  } from 'react-bootstrap';

import IfAnswers from './IfAnswers';
import { Message, Loading } from './../components/Misc';

import { IfLevels, IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';

                                           
                                  


                           

                                  
                 
                      
                    
              
                         
  

export default class IfAnswersContainer extends React.Component                                              {
	constructor(props     ) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			code: 'summary',
			levels: [],
		};
		(this     ).refreshData = this.refreshData.bind(this);
		(this     ).handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		// Load data.
		this.refreshData();
	}


	/*
	handleSubmit(e: ?SyntheticEvent<HTMLButtonElement>) {
		if(e) e.preventDefault();
		this.setState({  })
		this.refreshData();
	}
	*/

	handleChange(value     ) {
		//if(e) e.preventDefault();
		this.setState({ code: value }, () => this.refreshData());

	}

	refreshData() {

		fetch('/api/ifgame/recent_levels/'+this.state.code, {
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
				<Breadcrumb.Item title='Answers' active>Answers</Breadcrumb.Item>
			</Breadcrumb>
			);

		const filter = (
			<form name='c' >
				<DropdownButton 
						onSelect={this.handleChange}
						bsStyle='primary' title='Pick a level to view' 
						key='levelsection' id='levelselect'>
					{ IfLevels.map( (l,i) => <MenuItem key={'dropdownitem'+i} eventKey={l.code}>{l.code}</MenuItem> )}
				</DropdownButton>
			</form>
			);

		return (
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Answers for { this.state.code }</h3>

					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					{ filter }
					<IfAnswers levels={this.state.levels} />
				</Col>
			</Row>
		);
	}
}