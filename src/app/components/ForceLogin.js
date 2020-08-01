import React from 'react';
import PropTypes from 'prop-types';
import { getUserFromBrowser } from './../components/Authentication';

//$FlowFixMe
//import { useHistory } from "react-router-dom";


// Force any pages containing this one to log in first.
export default class ForceLogin extends React.Component {

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		const user = getUserFromBrowser();
		//const history = useHistory();

		if(user.username ===null || user.username === '') {
			//history.push('/login/');
			window.location.href = '/login/'
		}
	}
	
	render(): Node {
		const user = getUserFromBrowser();
		const that = this;
		const divStyle = { 
			position: 'fixed',
			left: '2px',
			bottom: '2px',
			color: 'lightgray'
		};
		//const history = useHistory

		return <div 
			onClick={ ()=> 
				//history.push('/logout/') 
				window.location.href = '/login/'
				} 
			style={ divStyle}>{ user.username }</div>;
	}
}
