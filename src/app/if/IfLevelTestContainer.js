import React from 'react';
import { PageHeader, Row, Col } from 'react-bootstrap';

import IfLevelTest from './IfLevelTest';
import { Message, Loading } from './../components/Misc';
import { IfLevelSchema } from './../../shared/IfGame';

if(typeof IfLevelSchema === 'undefined') throw new Error('blah!');

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



////////////////////////////////////////////////////////////////////
// Login Tests
////////////////////////////////////////////////////////////////////

const login_password = 'p'+Math.random(10000000, 99999999);

const login_tests = [
	{
		title: 'Login: Log out of system',
		url: '/api/logout/',
		options: { method: 'POST' },
		test_response: (response, json) => response.status === 200 && json.logout === true
	},
	{
		title: 'Login: check status as guest',
		url: '/api/login/status',
		options: { method: 'GET' },
		test_response: (response, json) => json.logged_in === false
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
		body: { username: 'test', password: login_password, token: 'invalid' },
		test_response: (response) => response.status === 403
	},
	{
		title: 'Login: create user - valid token',
		url: '/api/login/',
		options: { method: 'POST' },
		body: { username: 'test', password: login_password, token: USER_CREATION_SECRET },
		test_response: (response, json) => json.logged_in === true
	},
	{
		title: 'Login: check status as logged in user',
		url: '/api/login/status',
		options: { method: 'GET' },
		test_response: (response, json) => response.status !== 401 && json.logged_in === true
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
		body: { username: 'test', password: login_password, token: USER_CREATION_SECRET },
		test_response: (response, json) => json.logged_in === true
	}
];




////////////////////////////////////////////////////////////////////
// Gen Tests
////////////////////////////////////////////////////////////////////


// These are used to test the adaptive code using the test_gens files.
let gen_level = {};
let gen_page_count = 0;

const gen_tests = [
	{
		title: 'Gens: Create test level',
		url: '/api/ifgame/new_level_by_code/test_gens',
		options: { method: 'POST' },
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			return response.status === 200 && json.type === 'IfLevelSchema' && json.username === 'test';
		}
	},
	{
		title: 'Gens: LinearGen1 page 1 tutorial, failed attempt to add bad level',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = 'bad';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			return (response.status === 200 && 
					json.pages.length === gen_page_count &&
					json.pages[gen_page_count-1].description === 'LinearGen1_tutorial' && 
					json.type === 'IfLevelSchema' && 
					json.username === 'test');
		}
	},
	{
		title: 'Gens: LinearGen1 page 1 tutorial, good add level',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = '=a1';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			gen_page_count++;
			return (response.status === 200 && 
					json.pages.length === gen_page_count &&
					json.pages[gen_page_count-1].description !== 'LinearGen1_tutorial' && 
					json.type === 'IfLevelSchema' && 
					json.username === 'test');
		}
	},
	{
		title: 'Gens: LinearGen1 page 2 test, bad add level',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = 'bad';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			gen_page_count++;
			return (response.status === 200 && 
					json.pages.length === gen_page_count &&
					json.pages[gen_page_count-1].description !== 'LinearGen2' && 
					json.type === 'IfLevelSchema' && 
					json.username === 'test');
		}
	},
	{
		title: 'Gens: UntilGen - Make sure that wrong tutorial answers add a new page & repeat 1',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = 'bad';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			return (response.status === 200 && 
				json.pages.length === 1+gen_page_count &&
				json.pages[gen_page_count-1].description === 'UntilGen1' &&
				json.pages[gen_page_count-1].client_f === 'bad' &&
				json.pages[gen_page_count].description === 'UntilGen1' &&
				json.pages[gen_page_count].client_f === null);
		}
	},
	{
		title: 'Gens: UntilGen - Make sure that wrong tutorial answers add a new page & repeat 2',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = 'bad';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			return (response.status === 200 && 
				json.pages.length === 1+gen_page_count &&
				json.pages[gen_page_count-1].description === 'UntilGen1' &&
				json.pages[gen_page_count-1].client_f === 'bad' &&
				json.pages[gen_page_count].description === 'UntilGen1' &&
				json.pages[gen_page_count].client_f === null);
		}
	},
	{
		title: 'Gens: UntilGen - Make sure that right tutorial answers do continue',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = '=a1';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			return (response.status === 200 && 
				json.pages.length === 1+gen_page_count &&
				json.pages[gen_page_count-1].description === 'UntilGen1' &&
				json.pages[gen_page_count-1].client_f === '=a1' &&
				json.pages[gen_page_count].description !== 'UntilGen1');
		}
	},
	{
		title: 'Gens: Shuffle 1 (a, b, or c)',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = '=a1';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			return (response.status === 200 && 
				json.pages.length === 1+gen_page_count &&
				json.pages[json.pages.length-1].description.substr(0, 7) === 'Shuffle');
		}
	},
	{
		title: 'Gens: Shuffle 1 (a, b, or c)',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = '=a1';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			return (response.status === 200 && 
				json.pages.length === 1+gen_page_count &&
				json.pages[json.pages.length-1].description.substr(0, 7) === 'Shuffle');
		}
	},
	{
		title: 'Gens: Shuffle 1 (a, b, or c)',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_f = '=a1';
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);
			
			// Ensure that we have all 3 shuffles.
			let p = [json.pages[json.pages.length-2], json.pages[json.pages.length-3], json.pages[json.pages.length-4]];
			p = p.filter( p=> p.description.substr(0, 7) === 'Shuffle' );

			let r = (response.status === 200 && 
				json.pages.length === gen_page_count + 1 &&
				p.length === 3);

			return r;
		}
	},
	{
		title: 'Gens: Adaptive 1 - submit bad test 1',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_items = [2,1];
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);

			// Ensure that it was added correctly.
			let r = (response.status === 200 && 
				json.pages.length === gen_page_count + 1 &&
				// failed test.
				json.pages[json.pages.length-2].description === 'AdaptiveTest' &&
				json.pages[json.pages.length-2].correct === false &&
				// last page is not yet complete/submitted.
				json.pages[json.pages.length-1].description === 'AdaptiveTutorial');

			return r;
		}
	},
	{
		title: 'Gens: Adaptive 1 - submit good tutorial 1',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_items = [1,2];
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);

			// Ensure that it was added correctly.
			let r = (response.status === 200 && 
				json.pages.length === gen_page_count + 1 &&
				// passed tutorial.
				json.pages[json.pages.length-2].description === 'AdaptiveTutorial' &&
				json.pages[json.pages.length-2].correct === true &&
				// last page is successful.
				json.pages[json.pages.length-1].description === 'AdaptiveTest'

				);

			return r;
		}
	},
	{
		title: 'Gens: Adaptive 1 - submit bad test 2',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_items = [2,1];
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);

			// Ensure that it was added correctly.
			let r = (response.status === 200 && 
				json.pages.length === gen_page_count + 1 &&
				// failed test.
				json.pages[json.pages.length-2].description === 'AdaptiveTest' &&
				json.pages[json.pages.length-2].correct === false 
				);

			return r;
		}
	},
	{
		title: 'Gens: Adaptive 1 - submit bad tutorial 2.1',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_items = [2,1];
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);

			// Ensure that it was added correctly.
			let r = (response.status === 200 && 
				json.pages.length === gen_page_count &&
				// failed tutorial, repeat last page again.
				json.pages[json.pages.length-1].description === 'AdaptiveTutorial' &&
				json.pages[json.pages.length-1].correct === false 
				);

			return r;
		}
	},
	{
		title: 'Gens: Adaptive 1 - submit bad tutorial 2.2',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_items = [1,2];
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);

			// Ensure that it was added correctly.
			let r = (response.status === 200 && 
				json.pages.length === gen_page_count + 1 &&
				// passed tutorial.
				json.pages[json.pages.length-2].description === 'AdaptiveTutorial' &&
				json.pages[json.pages.length-2].correct === true &&
				// last page is successful.
				json.pages[json.pages.length-1].description === 'AdaptiveTest'

				);

			return r;
		}
	},
	{
		title: 'Gens: Adaptive 1 - submit good test 2',
		url: ()=> '/api/ifgame/level/'+gen_level._id,
		options: { method: 'POST' },
		body: ()=> { 
			let last_page = gen_level.pages[gen_level.pages.length-1];
			last_page.client_items = [1,2];
			gen_page_count = gen_level.pages.length; // update page_no before save.
			return gen_level.toJson();
		},
		test_response: (response, json) => {
			gen_level = new IfLevelSchema(json);

			// Ensure that it was added correctly.
			let r = (response.status === 200 && 
				json.pages.length === gen_page_count + 1 &&
				// passed test.
				json.pages[json.pages.length-2].description === 'AdaptiveTest' &&
				json.pages[json.pages.length-2].correct === true 
				);

			return r;
		}
	},

];





////////////////////////////////////////////////////////////////////
// If Tests
////////////////////////////////////////////////////////////////////


// These are used as the solutions for the test level.
let if_game_json = null;
let if_game_test_client_f_correct = '=true';
let if_game_test_client_f_incorrect = '=false';

const if_tests = [
	{
		title: 'if: Create "test" level',
		url: '/api/ifgame/new_level_by_code/test',
		options: { method: 'POST' },
		test_response: (response, json) => {
			if_game_json = json;
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
		test_response: (response, json) => {
			return response.status === 200 && json.length > 0;
		}
	},
	{
		title: 'if: Get one',
		url: ()=> '/api/ifgame/level/'+if_game_json._id,
		options: { method: 'GET' },
		test_response: (response, json) => {
			if_game_json = json;
			return (response.status === 200 &&
				json.code === 'test' &&
				json.type === 'IfLevelSchema' &&
				json.pages.length === 1 &&
				json.pages[0].type === 'IfPageFormulaSchema');
		}
	},
	{
		title: 'if: Get one - test date format returned int',
		url: ()=> '/api/ifgame/level/'+if_game_json._id,
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
		url: ()=> '/api/ifgame/level/'+if_game_json._id,
		options: { method: 'POST' },
		body: ()=> { 
			let ifgame = new IfLevelSchema(if_game_json);
			ifgame.pages[ifgame.pages.length-1].client_f = if_game_test_client_f_correct;
			return ifgame.toJson();
		},
		test_response: (response, json) => {
			if_game_json = json;
			return (response.status === 200 && 
				json.pages.length === 2 &&
				json.pages[0].client_f === if_game_test_client_f_correct);
		}
	},
	{
		title: 'if: Update, confirm tutorial can not update completed item',
		url: ()=> '/api/ifgame/level/'+if_game_json._id,
		options: { method: 'POST' },
		body: ()=> { 
			let ifgame = new IfLevelSchema(if_game_json);
			ifgame.pages[0].client_f = if_game_test_client_f_incorrect;
			return ifgame.toJson();
		},
		test_response: response => response.status === 500 
	},
	{
		title: 'if: Test incorrect answer of client_f (no new page)',
		url: ()=> '/api/ifgame/level/'+if_game_json._id,
		options: { method: 'POST' },
		body: ()=> { 
			let ifgame = new IfLevelSchema(if_game_json);
			ifgame.pages[1].client_f = if_game_test_client_f_incorrect;
			return ifgame.toJson();
		},
		test_response: (response, json) => {
			if_game_json = json;
			return (response.status === 200 && 
				!json.pages[json.pages.length-1].correct &&
				json.pages.length === if_game_json.pages.length
			);
		}
	},
	{
		title: 'if: Successfull update of tutorial page',
		url: ()=> '/api/ifgame/level/'+if_game_json._id,
		options: { method: 'POST' },
		body: ()=> { 

			let ifgame = new IfLevelSchema(if_game_json);
			ifgame.pages[1].client_f = if_game_test_client_f_correct;
			return ifgame.toJson();
		},
		test_response: (response, json) => {
			if_game_json = json;
			return (
				response.status === 200 && 
				json.pages[1].client_f === if_game_test_client_f_correct &&
				json.pages[1].correct
			);
		}
	},
	{
		title: 'if: Successfull bad solution for test page (test score)',
		url: ()=> '/api/ifgame/level/'+if_game_json._id,
		options: { method: 'POST' },
		body: ()=> { 
			let ifgame = new IfLevelSchema(if_game_json);
			ifgame.pages[2].client_f = if_game_test_client_f_incorrect;
			return ifgame.toJson();
		},
		test_response: (response, json) => 
				response.status === 200 && 
				json.pages.length === 4 &&
				json.pages[2].client_f === if_game_test_client_f_incorrect &&
				json.pages[2].correct === false &&
				json.pages[0].correct && json.pages[1].correct && json.pages[2].correct === false
	},
	{
		title: 'if: Delete',
		url: ()=> '/api/ifgame/level/'+if_game_json._id,
		options: { method: 'DELETE' },
		test_response: (response, json) => response.status === 200 && json.success
	}
];






export default class IfLevelListContainer extends React.Component {

	constructor(props) {
		super(props);

		const tests = [ ...login_tests, ...if_tests, ...gen_tests  ];

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
				options.body = typeof tests[i].body ==='function' ? JSON.stringify(tests[i].body()) : JSON.stringify(tests[i].body);
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

		//this.setState({ message: 'Completed tests!'});
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