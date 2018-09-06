import React from 'react';
import PropTypes from 'prop-types';
import { get_username } from './Misc';


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
		const username = get_username();

		if(username===null) {
			this.context.router.history.push('/login/');
		}

		return <div onClick={ ()=> that.context.router.history.push('/logout/') } style={ divStyle}>{ username }</div>;
	}
}
ForceLogin.contextTypes = {
	router: PropTypes.object.isRequired
};
