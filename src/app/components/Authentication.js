/* @flow */
import '@babel/polyfill'; // IE11 compatability.

//  Old browser compatability.
import 'whatwg-fetch'; // ajax support.
import Promise from 'promise-polyfill';
if (!window.Promise) { window.Promise = Promise; }



// Return the cookie with the given name.  If not found, return null.
function get_cookie(arg: string): string {
	let cookies = document.cookie.split(';').map( c => c.trim());
	cookies = cookies.map( c=> { return {'name': c.split('=')[0], 'value': c.split('=')[1] }; } );
	let match = cookies.filter( c=> c.name === arg );

	return match.length === 0 ? '' : match[0].value;
}


type BrowserUserType = {
	username: string,
	isAdmin: boolean,
};


/**
	This function is used by the client to return information about the current user.
	It's based solely upon cookie data.

	If the user isn't logged in, username === ''

	Returns {
		username: 
		iduser: 1
		isTeacher: bool
		isAdmin: bool
	}
*/
export function getUserFromBrowser(): BrowserUserType {
	const user = {
		username: get_cookie('x-access-token-username'),
		isAdmin: get_cookie('is-admin') === 'True',
	};

	// If the username is an email address, then replace the encoded @ with the proper symbol.
	user.username = user.username.split('%40').join('@');

	return user;
}

/*
export function setUserToBrowser(user: BrowserUserType): BrowserUserType {
	set_cookie( 'email', user.email);
	set_cookie( 'isAdmin', user.isAdmin ? 'True' : 'False');
	set_cookie( 'isTeacher', user.isTeacher ? 'True' : 'False' );
	return getUserFromBrowser();
}
*/
/*
export async function refreshUserBrowserFromServer() {

}
*/