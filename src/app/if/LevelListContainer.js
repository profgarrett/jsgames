// @flow
import React from 'react';
import PropTypes from 'prop-types';

import type { Node } from 'react';

import LevelList from './LevelList';
import Container from 'react-bootstrap/Container';
import { Breadcrumb, Row, Col, Button } from 'react-bootstrap';
import { Message, Loading } from './../components/Misc';
import { IfLevelSchema, IfLevels } from './../../shared/IfLevelSchema';

import { withRouter } from "react-router";


type PropsType = {
	match: Object,
	history: any,
};



type StateType = {
	code: string,
	message: string,
	messageStyle: string,
	isLoadingLessons: boolean,
	isLoadingReviews: boolean,
	reviewUnavailable: boolean,
	lessons: Array<any>,
	reviews: Array<any>
};


export default withRouter( class LevelListContainer extends React.Component<PropsType, StateType> {

	constructor(props: PropsType) {
		super(props);
		this.state = { 
			code: this.props.match.params._code,
			message: 'Loading data from server',
			messageStyle: 'info',
			isLoadingLessons: true,
			isLoadingReviews: true,
			reviewUnavailable: IfLevels.filter( l=>l.code === this.props.match.params._code+'review' ).length === 0,
			lessons: [],
			reviews: []
		};
		(this: any).insertLevel = this.insertLevel.bind(this);

	}

	componentDidMount() {
		const code = this.props.match.params._code ? this.props.match.params._code : 'all';
		
		// Fetch lessons
		fetch('/api/levels/levels/byCode/'+code, {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				let ifLevels = json.map( j => new IfLevelSchema(j) );
				this.setState({
					lessons: ifLevels,
					message: '',
					messageStyle: 'info',
					isLoadingLessons: false
				});
			})
			.catch( error => {
				this.setState({ 
					lessons: [],
					message: 'Error: ' + error,
					messageStyle: 'danger',
				});
			});


		if(this.state.reviewUnavailable) {
			// No reviews!
			this.setState({ reviews: [], isLoadingReviews: false}); 
		} else {
			// Fetch reviews
			fetch('/api/levels/levels/byCode/'+code+'review', {
					credentials: 'include'
				})
				.then( response => response.json() )
				.then( json => {
				let ifLevels = json.map( j => new IfLevelSchema(j) );
					this.setState({
						reviews: ifLevels,
						message: '',
						messageStyle: 'info',
						isLoadingReviews: false
					});
				})
				.catch( error => {
					this.setState({ 
						reviews: [],
						message: 'Error: ' + error,
						messageStyle: 'danger',
					});
				});
			}
	}



	insertLevel(code: string) {
		this.setState({ isLoadingReviews: true, isLoadingLessons: true });

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
				this.props.history.push('/ifgame/level/'+newLevel._id+'/play');

			}).catch( error => {
				console.log(error);
				this.setState({ message: error });
			}).then( () => this.setState({ isLoadingReviews: false, isLoadingLessons: false }));
	}


	// Return start new lesson button 
	_render_lesson_button(code: string) {
		const uncompleted_lessons_count = this.state.lessons.filter( l=> !l.completed ).length;
		const completed_lessons_count = this.state.lessons.filter( l=> l.completed ).length;
		const lesson_label = completed_lessons_count > 0 ? 'Restart lesson' : 'Start lesson';
		const uncompleted_reviews_count = this.state.reviews.filter( l=> !l.completed ).length;
		
		// Don't post until data is loaded.
		if(uncompleted_lessons_count > 0 || uncompleted_reviews_count > 0) return <span/>;

		return (<Button 
				onClick={ e => this.insertLevel(code) }>
					{lesson_label}
			</Button>);
	}

	// Return start new review button
	_render_review_button(code: string) {
		const completed_lessons_count = this.state.lessons.filter( l=> l.completed ).length;
		const uncompleted_reviews_count = this.state.reviews.filter( l=> !l.completed ).length;
		const completed_reviews_count = this.state.reviews.filter( l=> l.completed ).length;

		const review_label = completed_reviews_count > 0 ? 'Restart review' : 'Start review';
		// Don't post until data is loaded.

		if(uncompleted_reviews_count > 0) return <span/>;
		if(completed_lessons_count < 1 ) return <span />;

		return (<Button 
					onClick={ e => this.insertLevel(code+'review') }>
						{review_label}
				</Button>);
	}


	_get_highest_grade(levels: Array<any>) {

		return levels.filter( l=> l.completed ).reduce( (max, l) => {
			let grade = l.get_test_score_as_percent();
			if(max === null) return grade;
			if(grade>max ) return grade;
			return max;
		}, null);
	}


	// Return the highest grade text
	_render_highest_grade() {
		const highest_lesson = this._get_highest_grade(this.state.lessons);
		const highest_review = this._get_highest_grade(this.state.reviews);

		// Not completed.
		if(highest_lesson === null) {
			return <div>You have not yet completed this lesson</div>;
		}

		// Completed lesson, but not review.
		if(this.state.reviewUnavailable) {
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
	_render_complete_in_progress() {
		const in_progress_lessons = this.state.lessons.filter( l=>!l.completed);
		const in_progress_reviews = this.state.reviews.filter( l=>!l.completed);

		if(in_progress_lessons.length > 0) {
			return <div><Button 
							onClick={ () => this.props.history.push(
								'/ifgame/level/'+in_progress_lessons[0]._id +'/play') }
						>Continue your current lesson</Button>
					</div>;
		}

		if(in_progress_reviews.length > 0) {
			return <div><Button 
							onClick={ () => this.props.history.push(
								'/ifgame/level/'+in_progress_reviews[0]._id +'/play') }
						>Continue your current review</Button>
					</div>;
		}

		return <div/>;
	}


	render() {
		const code = this.props.match.params._code ? this.props.match.params._code : 'all';
		const page_level = IfLevels.filter( level => level.code === code )[0];

		const p_style = { fontStyle: 'italic', marginBottom: '1rem'};
		const crumbs = (<Breadcrumb>
				<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
				<Breadcrumb.Item active>{ page_level.title } List</Breadcrumb.Item>
			</Breadcrumb>);

		const body_lesson = this.state.isLoadingLessons 
				? <div/>
				: <div>
					<h5 style={{marginTop:'2rem'}}>Lesson</h5>
					<p style={p_style} >{ page_level.description }</p>
					<LevelList levels={this.state.lessons} />
					{ this._render_lesson_button(code) }
				</div>;

		const body_review = this.state.isLoadingReviews || this.state.reviewUnavailable
				? <div/>
				: <div>
					<h5 style={{marginTop:'2rem'}}>Review</h5>
					<p style={p_style}>This review will help you remember the outcomes from the lesson.
						Wait a week after completing the lesson before starting it.</p>
					<LevelList levels={this.state.reviews} />
					{ this._render_review_button(code) }		
				</div>;


		return (
			<Container fluid>
				<Row>
				<Col xs={12}>
					{ crumbs }
					<h5>{ page_level.title }</h5>
					<div>
						{ this._render_highest_grade() }
					</div>
					<hr/>
					<Loading loading={this.state.isLoadingReviews || this.state.isLoadingLessons } />
					<Message message={this.state.message} style={this.state.messageStyle} />
					{ this._render_complete_in_progress() }
					{ body_lesson }
					{ body_review }
				</Col>
			</Row>
			</Container>
		);		
	}

});
