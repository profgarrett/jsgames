import '@babel/polyfill'; // IE11 compatability.

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'react-bootstrap';
import { ClipLoader, ScaleLoader } from 'react-spinners';
import secret from './../../server/secret';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointRight, faCheck, faCheckSquare, faPencilAlt, faMinusCircle } from '@fortawesome/free-solid-svg-icons';

//  Old browser compatability.
import 'whatwg-fetch'; // ajax support.
import Promise from 'promise-polyfill';
if (!window.Promise) { window.Promise = Promise; }


export class PageHeader extends React.Component {
	render() {
		return (
		<div className='pb-2 mt-4 mb-2 border-bottom'>
			{ this.props.header }
		</div>);
	}
}
PageHeader.propTypes = {
	header: PropTypes.string.isRequired
};

/*
	This wraps problematic compoments that throw errors.
	It keeps the whole react app from getting hosed by an error
*/
export class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: false, info: false };
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true, error: error, info: info });
		// You can also log the error to an error reporting service
		//logErrorToMyService(error, info);
	}

	render() {
		if (this.state.hasError) {
			console.log(this.state.error);
			console.log(this.state.info);
			return <h1>Something went wrong.</h1>;
		}
		return this.props.children;
	}
}
ErrorBoundary.propTypes = {
	children: PropTypes.any
};


// Source:
// https://github.com/FortAwesome/react-fontawesome

// Used as an inline checkmark.
export class SmallOkGlyphicon extends React.Component {
	render() {
		return (<FontAwesomeIcon 
			style={{ paddingLeft: 2, paddingTop: 2, paddingRight: 5, fontSize: '1.4rem', color: '#3c763d' }} 
			icon={faCheck} />);
	}
}

					

// This is a standard Glyph for showing success.
export class HandPointRightGlyphicon extends React.Component {
	render() {
		return (<FontAwesomeIcon 
			style={{ paddingLeft: 2, top: 3, paddingRight: 5, fontSize: 21 }} 
			icon={faHandPointRight} />);
	}
}



// This is a standard Glyph for showing success.
export class CompletedGlyphicon extends React.Component {
	render() {
		return (<FontAwesomeIcon 
			style={{ color: this.props.color, paddingLeft: 2, paddingTop: 3, paddingRight: 5, fontSize: '2em' }} 
			icon={faCheckSquare} />);
	}
}
CompletedGlyphicon.propTypes = {
	color: PropTypes.string.isRequired
};



export class CorrectGlyphicon extends React.Component {
	render() {
		return (<FontAwesomeIcon 
			style={{ color: 'green', paddingLeft: 2, top: 3, paddingRight: 5, fontSize: '2em' }} 
			icon={faCheck} />);
	}
}



// This is a standard Glyph for showing progress.
export class ProgressGlyphicon extends React.Component {
	render() {
		return (<FontAwesomeIcon 
			style={{ color: 'black', paddingLeft: 2, top: 3, paddingRight: 5, fontSize: '2em' }} 
			icon={faPencilAlt} />);
	}
}



// This is a standard Glyph for showing success.
export class IncorrectGlyphicon extends React.Component {
	render() {
		return (<FontAwesomeIcon 
			style={{ paddingLeft: 2, top: 3, paddingRight: 5, fontSize: '2em', color: 'rgb(199, 37, 78)' }} 
			icon={faMinusCircle} />);
	}
}



// Returns a div that will set contents to the passed HTML.
export class UnbrokenSpan extends React.Component {

	render() {
		// Use dangerouslySetInnerHtml so that the description can use html characters.
		return <span style={{color: '#2f6f9f'}} dangerouslySetInnerHTML={ { '__html': this.props.html } }></span>;
	}
}
UnbrokenSpan.propTypes = {
	html: PropTypes.string.isRequired
};



// Returns a div that will set contents to the passed HTML.
export class BlueSpan extends React.Component {

	render() {
		// Use dangerouslySetInnerHtml so that the description can use html characters.
		return <span style={{color: '#2f6f9f'}} dangerouslySetInnerHTML={ { '__html': this.props.html } }></span>;
	}
}
BlueSpan.propTypes = {
	html: PropTypes.string.isRequired
};




// Returns a div that will set contents to the passed HTML.
export class HtmlSpan extends React.Component {

	render() {
		// Use dangerouslySetInnerHtml so that the description can use html characters.
		return <span dangerouslySetInnerHTML={ { '__html': this.props.html } }></span>;
	}
}
HtmlSpan.propTypes = {
	html: PropTypes.string.isRequired
};


// Returns a div that will set contents to the passed HTML.
export class HtmlDiv extends React.Component {

	render() {
		// Use dangerouslySetInnerHtml so that the description can use html characters.
		return <div className={this.props.className} style={this.props.style} dangerouslySetInnerHTML={ { '__html': this.props.html } }></div>;
	}
}
HtmlDiv.propTypes = {
	html: PropTypes.string.isRequired,
	className: PropTypes.string,
	style: PropTypes.object
};



export class PrettyDate extends React.Component {


	render() {
		/*
		 * JavaScript Pretty Date
		 * Copyright (c) 2008 John Resig (jquery.com)
		 * Licensed under the MIT license.
		 * http://ejohn.org/files/pretty.js
		 * Modified by Nathan Garrett
		 */

		// Takes an ISO time and returns a string representing how
		// long ago the date represents.

		// We should always receive a real date object.
		if(typeof this.props.date !== 'object') 
			throw new Error('Invalid object prop passed to PrettyDate');

		let diff = (((new Date()).getTime() - this.props.date.getTime()) / 1000),
			day_diff = Math.floor(diff / 86400);

		let message = '';
		
		// Error condition if we can't compare.
		if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
			message = 'Error translating date';
		
		// Message.
		message = day_diff == 0 && (
				diff < 60 && 'just now' ||
				diff < 120 && '1 minute ago' ||
				diff < 3600 && Math.floor( diff / 60 ) + ' minutes ago' ||
				diff < 7200 && '1 hour ago' ||
				diff < 86400 && Math.floor( diff / 3600 ) + ' hours ago') ||
			day_diff == 1 && 'yesterday' ||
			day_diff < 7 && day_diff + ' days ago' ||
			day_diff < 31 && Math.ceil( day_diff / 7 ) + ' weeks ago';

		return (
			<span>{ message}</span>
		);
	}
}
PrettyDate.propTypes = {
	date: PropTypes.object.isRequired
};


export class PageNotFound extends React.Component {
	render() {
		return (<Row><Col xs={12}>Page not found!</Col></Row>);
	}
}


export class Menu extends React.Component {
	render() {
		return <span />;
		/*
		Disabled menu to make it easier to embed.
		let styles = {
			marginTop: 0,
			visible: false,
			hidden: true
		};

		return (
			<Row style={styles}>
				<Col>
				<Navbar className='navbar navbar-dark bg-dark'>
					<Navbar.Header>
						<LinkContainer to='/'>
							<Navbar.Brand>JS Games</Navbar.Brand>
						</LinkContainer>
					</Navbar.Header>
					<Navbar.Collapse>
						<Nav pullRight>
							<LinkContainer to='/ifgame'>
								<NavItem >If Game</NavItem>
							</LinkContainer>
							<LinkContainer to='/logout'>
								<NavItem >Logout</NavItem>
							</LinkContainer>
						</Nav>
					</Navbar.Collapse>
				</Navbar>
				</Col>
			</Row>
		);
		*/
	}
}

/*

*/


export class Loading extends React.Component {
	render() {
		const style = {
			position: 'absolute',
			left: '50%',
			top: '50%',
			paddingTop: 150,
			transform: 'translate(-50%, -50%)'
		};

		return (
			<div style={style}>
				{ this.props.loading ? <ClipLoader size={70} color='black' /> : null }
			</div>
		);
	}
}
Loading.propTypes = {
	loading: PropTypes.bool.isRequired
};



export class Message extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hidden: false };
	}
	render() {
		if(this.props.message.length < 1 || this.state.hidden) return null;

		const that = this;
		const style = {
			position: 'fixed',
			left: 0,
			right: 0,
			top: 0,
			textAlign: 'center',
			marginTop: 5,
			marginLeft: '20%',
			marginRight: '20%',
			zIndex: 9000
		};
		const spinner = !this.props.spinner ? null : 
					<ScaleLoader color='white' height={15} />;

		return (
			<div style={style} 
					onClick={ () => that.setState({ hidden: true }) } >
				<Alert variant={ this.props.style ? this.props.style : 'info' }>
					<div >
						{ this.props.message }
						{ spinner }
					</div>
				</Alert>
			</div>
		);
	}
}
Message.propTypes = {
	message: PropTypes.string.isRequired,
	spinner: PropTypes.bool,
	style: PropTypes.string
};


// Return the cookie with the given name.  If not found, return null.
export function get_cookie(arg) {
	let cookies = document.cookie.split(';').map( c => c.trim());
	cookies = cookies.map( c=> { return {'name': c.split('=')[0], 'value': c.split('=')[1] }} );
	let match = cookies.filter( c=> c.name === arg );

	return match.length === 0 ? null : match[0].value;
}

export function get_username_or_emptystring() {
	let cookie =  get_cookie('x-access-token-username');
	if(cookie === null) return '';
	return cookie;
	
}

// Return boolean with if the user is an administrator or not.
export function get_user_is_admin() {
	const username = get_username_or_emptystring();
	return (username === secret.ADMIN_USERNAME || username === 'test');
}