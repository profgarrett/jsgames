import React, { ReactElement, useEffect, useState } from 'react';
import { getUserFromBrowser } from '../components/Authentication';
import HomeLoggedIn from './HomeLoggedIn';
import HomeLoggedOut from './HomeLoggedOut';

/*
	the site's home page, in two modes.
*/
export default function HomeContainer(): ReactElement {
	// getUserFromBrowser() reads a module-level cache, not state. index.jsx
	// fills it before the first render, but a login later in the same page load
	// would not re-render this component -- hence state plus a mount effect.
	// Same pattern as components/SiteHeader.tsx.
	const [username, setUsername] = useState(getUserFromBrowser().username);

	useEffect(() => {
		setUsername(getUserFromBrowser().username);
	}, []);

	return username === '' || username === null
		? <HomeLoggedOut />
		: <HomeLoggedIn />;
}
