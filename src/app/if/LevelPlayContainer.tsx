import React, { ReactElement, useEffect, useState } from 'react';

import { Container, Breadcrumb, Row, Col, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import { IfLevelSchema } from '../../shared/IfLevelSchema';
import { get_page_schema_as_class } from '../../shared/IfPageSchemas';

import LevelPlay from './LevelPlay';

import { ErrorBoundary, Message, IStringIndexJsonObject } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';
import Feedback from '../components/Feedback';

import CacheBuster from '../components/CacheBuster';

import { TIME_BEFORE_SHOWING_SOLUTION  } from './../configuration.js'; 


export default function LevelPlayContainer() {

	const [message, setMessage] = useState('Loading data from server')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [level, setLevel] = useState<IfLevelSchema|null>(null);
	const [selectedPageIndex, setSelectedPageIndex] = useState(-1);
	// -1 means no feedback is to be shown
	const [showFeedbackOn, setShowFeedbackOn] = useState(-1); 

	
	const params = useParams();
	const navigate = useNavigate();
	const _id = params._id ? params._id : null;
	

	// Mark that the user has finished viewing the feedback.
	const handleHideFeedback = () => {
		setShowFeedbackOn(-1);
	}

	/**
		A postback has occured. Go ahead and add information to the level showing that
		server feedback has been requested, and the type of feedback provided to the user.
		Note that we're not going through the normal update process of creating a new page
		and running through the updateUserFields. Since we just instantiated this from the 
		server-side of the postback, just update those.
	*/
	const addFeedbackEventToLevel = (level: IfLevelSchema, feedback_page: number): IfLevelSchema => {
		//const history = {};
		const page = level.pages[feedback_page];
		const time = page.get_time_in_seconds();

		// Increment hints.
		// TODO: Fix, hints_parsed isn't being saved, instead relying on history.
		// TODO FIX LOGGING PROBLEM
		page.hints_parsed = page.hints_parsed + 1;
		//history.hints_parsed = page.hints_parsed;

		page.history.push({
			code: 'client_update_feedback',
			hints_parsed: page.hints_parsed,
			dt: new Date(),
			correct: page.correct,
			client_feedback: page.client_feedback,
		});

		// If we're over time, then increment view solution.
		if(time > TIME_BEFORE_SHOWING_SOLUTION ) {
			page.hints_viewsolution = page.hints_viewsolution + 1;
			page.history[page.history.length-1].hints_viewsolution = page.hints_viewsolution;
		}

		return level;
	}

	// Update level based on user input.
	// Changes is passed a json object with the updated values.
	const handleChange = (json: IStringIndexJsonObject): void => {

		if(typeof level === 'undefined' || level === null) {
			throw new Error('Invalid onChange of undefined LevelPlayContainer');

		} else {
			// Don't accept any input if we are currently loading
			if(isLoading) return;

			const i = selectedPageIndex;
			
			// Create a fresh page.
			let page_json = level.pages[i].toJson();
			let page = get_page_schema_as_class(page_json);

			// Update fresh page with new values.
			page.updateUserFields( json );
			//console.log(page);
			
			// Create a new copy of the level to make sure that we trigger any updates.
			const newLevel = new IfLevelSchema( level.toJson());
			newLevel.pages[i] = page;
			setLevel(newLevel);
		}
	};


	/**
	 * Update the current page and send to the server for an update.
	 * 
	 * validate_only is true when we want to submit and get the next page. It's false when 
	 * we just want to test the current page, and if wrong, then not continue.
	 */
	const handleNext = ( validate_only: boolean ): void => {
		// Don't accept any input if we are currently loading
		if(isLoading) return;

		// Make sure that we have a level.		
		if(typeof level === 'undefined' || level === null) 
			throw new Error('Invalid onSubmit of undefined LevelPlayContainer');

		// Make sure that we don't already have a future page loaded in front of the current page.
		if( selectedPageIndex < level.pages.length-1 )
			throw new Error('current_page_i < this.state.level.pages.length-1 in LevelPlayContainer.onSubmit');

		let id = level._id, 
			current_page_i = selectedPageIndex,
			current_page = level.pages[current_page_i];
	

		// If the last page is a text-only one, update last page to show that it's been viewed.
		if(current_page.type === 'IfPageTextSchema') {
			current_page.toIfPageTextSchema().client_read = true;
		}

		// Make sure that the user has submitted something 
		//		UNLESS the timer has expired. THen it's ok to submit, even if we don't have user input.
		if(
				!current_page.client_has_answered() 
				&& current_page.correct_required 
				&& !current_page.time_limit_expired
				&& !validate_only // allow hints without a submission
			) {
			setMessage('You must provide an answer before continuing.');
			setMessageStyle('danger');
			return;
		}

		// Show loading status.
		setMessage('');
		setMessageStyle('');
		//setShowFeedbackOn(current_page_i); // remember what page to show feedback on.
		handleHideFeedback(); // hide feedback, it may be re-enabled by the loading code.
		setIsLoading(true);

		// User is allowed to just check the answer.  If they do, set URL
		// to pass this behavior to the server.
		const url = '/api/levels/level/'+id+'?validate_only=' + (validate_only ? '1': '0'); 

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
				// Add information about the feedback generated by the server.
				return addFeedbackEventToLevel(ifLevel, current_page_i);
			})
			.then( (ifLevel: IfLevelSchema) => {
				const page = ifLevel.pages[current_page_i];

				// Test to see if we're at the end of the level. If so, go to the review screen.
				if(ifLevel.completed) {
					// Hide the cursor, if the previous render has it showing loading,
					//  it needs to be reset.
					if(document.body) {
						document.body.style.cursor = 'default';
					}

					if( ifLevel.show_score_after_completing ) {
						navigate('/ifgame/level/'+ifLevel._id+'/score');
					} else {
						// Back to home page w/o any results shown.
						navigate('/ifgame');
					}
					return;
				} 

				// Did we try to validate? If so, show feedback no matter what.
				if(validate_only) {
					// Show feedback.
					setIsLoading(false);
					setLevel(ifLevel);
					setShowFeedbackOn(current_page_i);
					return;
				} 

				// User clicked on 'next'.
				// Go back to the top of the page.
				window.scrollTo(0,0);


				// Does the submitted page *not* require feedback to be shown?
				// If not, set index to the latest page.
				if(!page.show_feedback_on) {
					setIsLoading( false );
					setLevel( ifLevel );
					// Use latest page, not current_page_i (which would be the page for feedback)
					setSelectedPageIndex( ifLevel.pages.length-1 );
					handleHideFeedback();

					return;
				}

				// Don't show feedback for optional tutorial pages that aren't required
				// and aren't correct
				if(!page.correct_required && page.code === 'tutorial' && !page.correct) {
					setIsLoading( false);
					setLevel(ifLevel);
					setSelectedPageIndex( ifLevel.pages.length-1);
					handleHideFeedback();
					return;
				}

				// Show the page we saved at the beginning of this process.
				// Note that we are showing a feedback on a page that isn't 
				// the selected page. Clearing the feedback will reset the focus
				// to the latest page.
				setIsLoading(false);
				setLevel(ifLevel);
				setSelectedPageIndex( ifLevel.pages.length-1);
				setShowFeedbackOn( current_page_i );				
			})
			.catch( (error: any) => {
				setIsLoading( false);
				setLevel(null);
				setMessage(error.message);
				setMessageStyle('danger');
			});

	}



	useEffect( () => {

		// After the screen loads, fire off the initial request populate the level.
		fetch('/api/levels/level/'+_id, {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				let latest_page_i = ifLevel.pages.length-1;

				setLevel( ifLevel);
				setSelectedPageIndex( latest_page_i);
				setMessage('');
				setIsLoading(false);
			})
			.catch( error => {
				setLevel( null );
				setMessage('Error: ' + error.message);
				setIsLoading(false);
			});
	}, [_id] );


	// Render 
	//<Breadcrumb.Item href='/'>Home</Breadcrumb.Item>-->
	// <h3>{ this.state.level ? this.state.level.title : '' }</h3> 
	const crumbs = (level == null) ? <></> :
		<Breadcrumb>
			<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
			<Breadcrumb.Item active>{  level.title }</Breadcrumb.Item>
		</Breadcrumb>;


	if(isLoading) {
		(document.body) ? document.body.style.cursor = 'wait' : false;
	} else {
		(document.body) ? document.body.style.cursor = 'default' : false;
	}

	return (
		<Container fluid>
			<Row>
				<Col>
					<ForceLogin />
					<CacheBuster />
					{ crumbs }
					

					<Message spinner={isLoading } message={message} style={messageStyle} />
					<ErrorBoundary>
					{ level == null ? 'Loading...' :
						<div id='levelplaycontainer'>
							<LevelPlay 
								level={level} 
								selected_page_index={selectedPageIndex }
								onNext={ ()=>handleNext(false) }
								onValidate={ ()=>handleNext(true) }
								onChange={ (json)=>handleChange(json) }
								show_feedback={ showFeedbackOn != -1 }
								show_feedback_on={showFeedbackOn}
								onHideFeedback={handleHideFeedback}
								isLoading={isLoading}
							/>
							<Feedback
								data={level}
								code={_id == null ? 'loading' : _id}
							/>
						</div>
					}
					</ErrorBoundary>
				</Col>
			</Row>
		</Container>
	);
}
