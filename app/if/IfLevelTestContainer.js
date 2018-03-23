import React from 'react';
import PropTypes from 'prop-types';

import IfLevelTest from './IfLevelTest';

import { PageHeader, Row, Col, Button } from 'react-bootstrap';
import { Message, Loading } from './../components/Misc';

import { IfLevelSchema, IfLevels } from './../../shared/IfGame';

// We need to have this token passed in the URL in order to properly test the user creation process.
// Must match value given in secret.js on the server.
const search = new URLSearchParams(window.location.search);
const USER_CREATION_SECRET = search.get('USER_CREATION_SECRET');



const default_fetch_options = {
	credentials: 'include',
	mode: 'same-origin',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	}
};

const test_password = 'p'+Math.random(10000000, 99999999);

let test_ifgame_json; // used as a temp variable for if_tests.




const login_tests = [
	{
		title: 'Login: Log out of system',
		url: '/api/logout/',
		options: { method: 'POST' },
		test_response: (response, json) => response.status === 200 && json.logout === true
	},
	{
		title: 'Login: check status as guest',
		url: '/api/login',
		options: { method: 'GET' },
		test_response: (response) => response.status === 401
	},
	{
		title: 'Login: Delete test user',
		url: '/api/login_clear_test_user',
		options: { method: 'POST' },
		test_response: (response, json) => response.status === 200 && json.success === true
	},
	{
		title: 'Login: create user - invalid token',
		url: '/api/login/',
		options: { method: 'POST' },
		body: { username: 'test', password: test_password, token: 'invalid' },
		test_response: (response) => response.status === 403
	},
	{
		title: 'Login: create user - valid token',
		url: '/api/login/',
		options: { method: 'POST' },
		body: { username: 'test', password: test_password, token: USER_CREATION_SECRET },
		test_response: (response, json) => json.logged_in === true
	},
	{
		title: 'Login: check status as logged in user',
		url: '/api/login',
		options: { method: 'GET' },
		test_response: (response, json) => response.status !== 401 && json.login === true
	},
	{
		title: 'Login: logout valid user',
		url: '/api/logout/',
		options: { method: 'POST' },
		test_response: (response, json) => response.status === 200 && json.logout === true
	},
	{
		title: 'Login: login as newly created user - bad password & good token',
		url: '/api/login/',
		options: { method: 'POST' },
		body: { username: 'test', password: 'xcv', token: USER_CREATION_SECRET },
		test_response: (response) => response.status === 401
	},
	{
		title: 'Login: login as newly created user - good password & good token',
		url: '/api/login/',
		options: { method: 'POST' },
		body: { username: 'test', password: test_password, token: USER_CREATION_SECRET },
		test_response: (response, json) => json.logged_in === true
	}
];


// Global variable for tracking last updated.
let if_game_test_updated_client_f = '=not(false);';

const if_tests = [
	{
		title: 'if: Create "test" level',
		url: '/api/ifgame/new_level_by_code/test',
		options: { method: 'POST' },
		test_response: (response, json) => {
			test_ifgame_json = json;
			return response.status === 200 && json.type === 'IfLevelSchema' && json.username === 'test';
		}
	},
	{
		title: 'if: Create "invalid" level',
		url: '/api/ifgame/new_level_by_code/invalid_level',
		options: { method: 'POST' },
		test_response: (response ) => response.status === 500
	},
	{
		title: 'if: List',
		url: '/api/ifgame/levels/byCode/test',
		options: { method: 'GET' },
		test_response: (response, json) => response.status === 200 && json.length > 0
	},
	{
		title: 'if: Get one',
		url: ()=> '/api/ifgame/level/'+test_ifgame_json._id,
		options: { method: 'GET' },
		test_response: (response, json) => response.status === 200 && json.code === 'test'
	},
	{
		title: 'if: Get one - test date format returned int',
		url: ()=> '/api/ifgame/level/'+test_ifgame_json._id,
		options: { method: 'GET' },
		test_response: (response, json) => response.status === 200 && typeof json.updated === 'number' && typeof json.created === 'number'
	},	{
		title: 'if: Get one that does not exist',
		url: '/api/ifgame/level/zzzzzzzz',
		options: { method: 'GET' },
		test_response: (response) => response.status === 404
	},
	{
		title: 'if: Update',
		url: ()=> '/api/ifgame/level/'+test_ifgame_json._id,
		options: { method: 'POST' },
		body: ()=> { 
			// 
			let ifgame = IfLevelSchema(test_ifgame_json);
			ifgame.client_f = if_game_test_updated_client_f;

			let updated_json = test_ifgame_json.toJson();
			
			return updated_json;
		},
		test_response: (response, json) => response.status === 200 && json.client_f !== if_game_test_updated_client_f
	},
	{
		title: 'if: Delete',
		url: ()=> '/api/ifgame/level/'+test_ifgame_json._id,
		options: { method: 'DELETE' },
		test_response: (response, json) => response.status === 200 && json.success
	}
];


export default class IfLevelListContainer extends React.Component {

	constructor(props) {
		super(props);

		const tests = [ ...login_tests, ...if_tests];

		this.state = { 
			message: 'Preparing to test',
			message_style: 'info',
			isLoading: true,
			tests: tests,
			current_test_i: 0,
			error: null,
			USER_CREATION_SECRET: USER_CREATION_SECRET
		};
	}

	componentDidMount() {
		// Begin testing.
		if(this.state.USER_CREATION_SECRET) {
			this.tests();
		} else {
			this.setState({ message: 'Must provide USER_CREATION_SECRET'});
		}
	}


	async tests() {
		let tests = this.state.tests;
		let completed_test = {};
		let json = {};
		let options = {};
		let response = {};
		let url = '';

		for(let i=0; i<tests.length; i++) {
			this.setState({ message: 'Test '+i+': '+tests[i].title, current_test_i: i });

			// Create request & send. Handled body & url being functions.
			options = { ...default_fetch_options, ...tests[i].options };
			if(tests[i].body) {
				options.body = typeof tests[i].body ==='function' ? tests[i].body() : JSON.stringify(tests[i].body);
			}
			url = typeof tests[i].url === 'function' ? tests[i].url() : tests[i].url;

			response = await fetch(url, options);

			// Load results into JSON, even if text was given.
			if( response.status === 200) {
				json = await response.json();
			} else {
				json = { text: await response.text()};
			}

			// Update state with the revised test.
			completed_test = { ...tests[i], result: tests[i].test_response(response, json)};
			tests = [ ...tests];
			tests[i] = completed_test;

			// Update state
			if(!completed_test.result) {
				this.setState({ tests: tests, message: 'Failed test '+i+' - ' +tests[i].title });
				console.log(json);
				console.log(response);
				break;
			} else {
				this.setState({ tests: tests });
			}
		}

		this.setState({ message: 'Completed tests!'});
	}


	render() {

		return (
			<div>
			<Row>
				<Col xs={12}>
					<PageHeader>Testing Page</PageHeader>
					<Message message={this.state.message} style={this.state.message_style} />
					<Loading loading={this.state.isLoading } />
					<IfLevelTest tests={this.state.tests} />
				</Col>
			</Row>
			</div>
		);
	}
}