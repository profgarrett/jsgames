//@flow
import React from 'react';
import { Row, Col, Breadcrumb, DropdownButton, MenuItem  } from 'react-bootstrap';

import IfActivity from './IfActivity';
import { Message, Loading } from './../components/Misc';

import { IfLevels, IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';


type ActivityPropsType = {};

type ActivityContainerStateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	code: string,
	levels: Array<LevelType>
};

export default class IfActivityContainer extends React.Component<ActivityPropsType, ActivityContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			isLoading: true,
			code: 'math1',
			levels: [],
		};
		(this: any).refreshData = this.refreshData.bind(this);
		(this: any).handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		// Load data.
		this.refreshData();
	}


	handleChange(value: any) {
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



	render(): Node {

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Activity' active>Activity</Breadcrumb.Item>
			</Breadcrumb>
			);

		const filter = (
			<form name='c' onSubmit={this.handleChange}>
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
					<h3>Recently Updated Levels</h3>

					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					{ filter }
					<IfActivity levels={this.state.levels} />
				</Col>
			</Row>
		);
	}
}