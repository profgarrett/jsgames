import 'babel-polyfill'; // IE11 compatability.
// updated
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Table, Row, Col, Navbar, Nav, NavDropdown, NavItem, MenuItem, HelpBlock, FormControl, Span, Label, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';


import { Glyphicon } from 'react-bootstrap';

//  Old browser compatability.
import 'whatwg-fetch'; // ajax support.
import Promise from 'promise-polyfill';
if (!window.Promise) { window.Promise = Promise; }


// This is a standard Glyph for showing success.
export class OkGlyphicon extends React.Component {
	render() {
		let styleYes = {
			//fontSize: 24,
			color: '#3c763d',
			paddingLeft: 2
		};
		return <Glyphicon style={ styleYes } glyph='ok'/>;
	}
}



// This is a standard Glyph for showing success.
export class SuccessGlyphicon extends React.Component {
	render() {
		let styleYes = {
			fontSize: 24,
			color: '#3c763d',
			paddingRight: 2
		};
		return <Glyphicon style={ styleYes } glyph='ok-circle'/>;
	}
}


// This is a standard Glyph for showing progress.
export class ProgressGlyphicon extends React.Component {
	render() {
		let styleYes = {
			fontSize: 24,
			paddingRight: 2,
			color: 'black'
		};
		return <Glyphicon style={ styleYes } glyph='question-sign'/>;
	}
}


// This is a standard Glyph for showing success.
export class FailureGlyphicon extends React.Component {

	render() {
		let styleNo = {
			fontSize: 24,
			paddingRight: 2,
			color: 'rgb(199, 37, 78)'
		};
		return <Glyphicon style={ styleNo } glyph='remove-circle' />;
	}

}


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
		return <div className={this.props.className} dangerouslySetInnerHTML={ { '__html': this.props.html } }></div>;
	}
}
HtmlDiv.propTypes = {
	html: PropTypes.string.isRequired,
	className: PropTypes.string
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
		let styles = {
			marginTop: 0,
			visible: false,
			hidden: true
		};

		return <span />;

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
	}
}

/*

*/


export class Loading extends React.Component {
	render() {
		return (
			<Row><Col>
			{ this.props.loading ? <b>Loading</b> : '' }
			</Col></Row>
		);
	}
}
Loading.propTypes = {
	loading: PropTypes.bool.isRequired
};



export class Message extends React.Component {
	render() {
		if(this.props.message.length > 0 )
			return (<Alert bsStyle={ this.props.style ? this.props.style : 'info' }>{ this.props.message }</Alert>); 
		else
			return (<p></p>);
	}
}
Message.propTypes = {
	message: PropTypes.string.isRequired,
	style: PropTypes.string
};


// Return the cookie with the given name.  If not found, return null.
export function get_cookie(arg) {
	let cookies = document.cookie.split(';').map( c => c.trim());
	cookies = cookies.map( c=> { return {'name': c.split('=')[0], 'value': c.split('=')[1] }} );
	let match = cookies.filter( c=> c.name === arg );

	return match.length === 0 ? null : match[0].value;
}