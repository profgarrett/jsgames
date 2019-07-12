import React from 'react';
import PropTypes from 'prop-types';
import { getUserFromBrowser } from './../components/Authentication';

// Force any pages containing this one to log in first.
export default class ForceLogin extends React.Component {

	render() {
		const that = this;
		const divStyle = { 
			position: 'fixed',
			right: '2px',
			bottom: '2px',
			color: 'lightgray'
		};
		const user = getUserFromBrowser();

		if(user.username ===null || user.username === '') {
			this.context.router.history.push('/login/');
		}

		return <div 
			onClick={ ()=> that.context.router.history.push('/logout/') } 
			style={ divStyle}>{ user.username }</div>;
	}
}
ForceLogin.contextTypes = {
	router: PropTypes.object.isRequired
};
