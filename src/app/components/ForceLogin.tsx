import React, { useEffect, useState } from 'react';
import { getUserFromBrowser } from './Authentication';
import CSS from 'csstype';

interface IUsersLoginStatusJson {
	logged_in: boolean;
	username: string;
}

// Build the /login/ URL to send an anonymous visitor to, preserving the page
// they were trying to reach (path + query string) so LoginContainer can send
// them back there after a successful login. The target is encoded as a
// single encodeURIComponent'd value so any character in the path (including
// '-') round-trips safely; see LoginContainer's decodeRedirectUrl().
function getLoginRedirectHref(): string {
	const target = window.location.pathname + window.location.search;
	if (target === '' || target === '/') return '/login/';
	return '/login/?url=' + encodeURIComponent(target);
}

// Force any pages containing this one to log in first.
// Also shows currently logged in user as a small box on the bottom-left of the screen.
export default function ForceLogin() {
	const user = getUserFromBrowser();

	// Check cookies on client side.
	if(user.username ===null || user.username === '') {
		window.location.href = getLoginRedirectHref();
		return <></>;
	}

	// Retrieve loged in status from server.
	useEffect( () => {

		fetch('/api/users/login/status', {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( (json: IUsersLoginStatusJson) => {
				// Not logged in. Hard-reset.
				if(json.logged_in === false) {
					window.location.href = getLoginRedirectHref();
				}
			})
			.catch( error => {
				console.log(error);
			});
	
	}, []);

	
	const divStyle: CSS.Properties = { 
		position: 'fixed',
		left: '2px',
		bottom: '2px',
		color: 'lightgray'
	};

	return (<div 
		style={ divStyle}
		onClick={ ()=> window.location.href = '/logout/' } 
		>{ user.username }</div> 
	);

}
