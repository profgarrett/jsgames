import React, { ReactElement, useEffect, useState } from 'react';

import { Container, Breadcrumb, Row, Col, Button, Navbar } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import LevelList from './LevelList';
import { Message, Loading } from '../components/Misc';

import { IfLevelSchema, IfLevels } from '../../shared/IfLevelSchema';


export default function LevelListContainer() {

	const [message, setMessage] = useState('Loading data from server')
	const [messageStyle, setMessageStyle] = useState('info');
	const [isLoadingLessons, setIsLoadingLessons] = useState(true);
	const [isLoadingReviews, setIsLoadingReviews] = useState(true);
	const [levels, setLevels] = useState<IfLevelSchema[]>([]);
	const [reviews, setReviews] = useState<IfLevelSchema[]>([]);

	const params = useParams();
	const navigate = useNavigate();
	const code: string = params._code ? params._code : 'all';

	const reviewUnavailable = IfLevels.filter( l=>l.code === code+'review' ).length === 0;

	useEffect( () => {
		
		// Fetch lessons
		fetch('/api/levels/levels/byCode/'+code, {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				let ifLevels = json.map( j => new IfLevelSchema(j) );
				setLevels(ifLevels);
				setMessage('');
				setMessageStyle('info');
				setIsLoadingLessons(false);
			})
			.catch( error => {
				setLevels([]);
				setMessage('Error: ' + error);
				setMessageStyle('danger');
				setIsLoadingLessons(false);
			});


		if(reviewUnavailable) {
			// No reviews!
			setReviews([]);
			setIsLoadingReviews(false);

		} else {
			// Fetch reviews
			fetch('/api/levels/levels/byCode/'+code+'review', {
					credentials: 'include'
				})
				.then( response => response.json() )
				.then( json => {
					let ifLevels = json.map( j => new IfLevelSchema(j) );
					setReviews(ifLevels);
					setMessage('');
					setMessageStyle('info');
					setIsLoadingReviews(false);
				})
				.catch( error => {
					setReviews([]);
					setMessage('Error: ' + error);
					setMessageStyle('danger');
					setIsLoadingReviews(false);
				});
			}
	}, [code]);



	const insertLevel = (code: string) => {
		setIsLoadingReviews(true);
		setIsLoadingLessons(true);

		fetch('/api/levels/new_level_by_code/'+code, {
				method: 'post',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {

				let newLevel = new IfLevelSchema(json);
				navigate('/ifgame/level/'+newLevel._id+'/play');

			}).catch( error => {
				console.log(error);
				setMessage( error);

			}).then( () => {
				setIsLoadingReviews(false);
				setIsLoadingLessons(false);
			});
	};


	// Return start new lesson button 
	const _render_lesson_button = (code: string): ReactElement => {
		const uncompleted_lessons_count = levels.filter( l=> !l.completed ).length;
		const completed_lessons_count = levels.filter( l=> l.completed ).length;
		const lesson_label = completed_lessons_count > 0 ? 'Restart lesson' : 'Start lesson';
		const uncompleted_reviews_count = reviews.filter( l=> !l.completed ).length;
		
		// Don't post until data is loaded.
		if(uncompleted_lessons_count > 0 || uncompleted_reviews_count > 0) return <></>;

		return (<Button onClick={ () => insertLevel(code) }>{lesson_label}</Button>);
	}

	// Return start new review button
	const _render_review_button = (code: string): ReactElement => {
		const completed_lessons_count = levels.filter( l=> l.completed ).length;
		const uncompleted_reviews_count = reviews.filter( l=> !l.completed ).length;
		const completed_reviews_count = reviews.filter( l=> l.completed ).length;

		const review_label = completed_reviews_count > 0 ? 'Restart review' : 'Start review';
		// Don't post until data is loaded.

		if(uncompleted_reviews_count > 0) return <span/>;
		if(completed_lessons_count < 1 ) return <span />;

		return (<Button onClick={ () => insertLevel(code+'review') }>{review_label}</Button>);
	}


	const _get_highest_grade = (levels: IfLevelSchema[]): number|null => {

		let completed = levels.filter( l=> l.completed );
		let grades: number[] = completed.map( l => l.get_test_score_as_percent() );
		if(grades.length == 0) return null;
		return grades.sort((a,b) => b-a )[0];
		/*
		let max = completed.reduce( (max: number, l: IfLevelSchema) => {
			let grade: number = l.get_test_score_as_percent();

			if(max === null) {
				return grade;
			} else if( grade>max ) {
				return grade;
			} else {
				return max;
			}
		}, null);
		*/
	}


	// Return the highest grade text
	const _render_highest_grade = (): ReactElement => {
		const highest_lesson = _get_highest_grade(levels);
		const highest_review = _get_highest_grade(reviews);

		if( isLoadingLessons || isLoadingReviews ) return <></>;

		// Not completed.
		if(highest_lesson === null) {
			return <div>You need to complete this lesson</div>;
		}

		// Completed lesson, but not review.
		if(reviewUnavailable) {
			return <div>Your highest grade is {highest_lesson}%.</div>;
		}

		// Need review.
		if(highest_review === null) {
			return <div>Your highest lesson grade is {highest_lesson}%.
					You still need to complete the review.</div>;
		} else {
			return <div>Your best lesson grade is {highest_lesson}%, 
					and your best review grade is {highest_review}%.</div>;
		}
	}


	// Return a link to continue anything in progress.
	const _render_complete_in_progress = ():  ReactElement => {
		const in_progress_lessons = levels.filter( l=>!l.completed);
		const in_progress_reviews = reviews.filter( l=>!l.completed);

		if(in_progress_lessons.length > 0) {
			return <div><Button 
							onClick={ () => { navigate( '/ifgame/level/'+in_progress_lessons[0]._id +'/play'); }}>Continue your current lesson</Button>
					</div>;
		}

		if(in_progress_reviews.length > 0) {
			return <div><Button 
							onClick={ () => { navigate( 
								'/ifgame/level/'+in_progress_reviews[0]._id +'/play') }}
						>Continue your current review</Button>
					</div>;
		}

		return <div/>;
	}


	const render = (): ReactElement => {
		const page_level = IfLevels.filter( level => level.code === code )[0];

		const p_style = { fontStyle: 'italic', marginBottom: '1rem'};
		const crumbs = (<Breadcrumb>
				<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
				<Breadcrumb.Item active>{ page_level.title } List</Breadcrumb.Item>
			</Breadcrumb>);

		const body_lesson = isLoadingLessons 
				? <div/>
				: <div>
					<h5 style={{marginTop:'2rem'}}>Lesson</h5>
					<p style={p_style} >{ page_level.description }</p>
					<LevelList levels={levels} />
					{ _render_lesson_button(code) }
				</div>;

		const body_review = isLoadingReviews || reviewUnavailable
				? <div/>
				: <div>
					<h5 style={{marginTop:'2rem'}}>Review</h5>
					<p style={p_style}>This review will help you remember the outcomes from the lesson.
						Wait a week after completing the lesson before starting it. It will become available after you finish a lesson.</p>
					<LevelList levels={reviews} />
					{ _render_review_button(code) }		
				</div>;


		return (
			<Container fluid>
				<Row>
				<Col xs={12}>
					{ crumbs }
					<h5>{ page_level.title }</h5>
					<div>
						{ _render_highest_grade() }
					</div>
					<hr/>
					<Loading loading={isLoadingReviews || isLoadingLessons } />
					<Message message={ message} style={ messageStyle} />
					{ _render_complete_in_progress() }
					{ body_lesson }
					{ body_review }
				</Col>
			</Row>
			</Container>
		);		
	}
	return render();
}
