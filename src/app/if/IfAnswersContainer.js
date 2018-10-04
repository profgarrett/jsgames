//@flow
import React from 'react';
import { Row, Col, Breadcrumb, DropdownButton, MenuItem, Button  } from 'react-bootstrap';

import IfAnswers from './IfAnswers';
import { Message, Loading } from './../components/Misc';

import { IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';


type AnswersPropsType = {};

type AnswersContainerStateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	code: string,
	levels: Array<LevelType>
};

export default class IfAnswersContainer extends React.Component<AnswersPropsType, AnswersContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			code: 'tutorial',
			levels: [],
		};
		(this: any).refreshData = this.refreshData.bind(this);
		(this: any).handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		// Load data.
		this.refreshData();
	}


	handleSubmit(e: ?SyntheticEvent<HTMLButtonElement>) {
		if(e) e.preventDefault();
		this.refreshData();
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
				<Breadcrumb.Item title='Answers' active>Answers</Breadcrumb.Item>
			</Breadcrumb>
			);

		const filter = (
			<form name='c' onSubmit={this.handleSubmit}>
				<DropdownButton bsStyle='Default' title='Level' key='levelsection' id='levelselect'>
					{ IfLevels.map( (l,i) => <MenuItem eventKey={i}>{l.code}</MenuItem>})}
				</DropdownButton>
				<Button bsStyle='primary'>Update</Button>
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
					<IfAnswers levels={this.state.levels} />
				</Col>
			</Row>
		);
	}
}