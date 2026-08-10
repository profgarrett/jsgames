import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { getUserFromBrowser } from './Authentication';

/**
	The site's single navbar, rendered once in index.jsx above <Routes>.

	This absorbed the bar that used to live inside PreviewContainer, so the
	brand is now global rather than landing-page-only. Styling is unchanged
	from that original (bg='dark' variant='dark' + a fluid Container), so '/'
	looks the same; every other page gains a brand bar above its breadcrumbs.

	The Admin link appears only for the site administrator. This is cosmetic --
	user_require_admin on every /api/admin route is the actual boundary.

	Note this renders for logged-out visitors too, which is correct: the brand
	is public and isAdmin is false when anonymous, so nothing leaks. Do not
	wrap it in ForceLogin, or the landing page will bounce to /login.
*/
export default function SiteHeader(): ReactElement {
	// getUserFromBrowser() reads a module-level cache, not state. index.jsx
	// populates it before the first render, but a login later in the same page
	// load would not re-render this component -- hence state plus a mount
	// effect, so the Admin link is not missing after logging in.
	const [isAdmin, setIsAdmin] = useState(getUserFromBrowser().isAdmin);

	useEffect(() => {
		setIsAdmin(getUserFromBrowser().isAdmin);
	}, []);

	return (
		<Navbar bg='dark' variant='dark'>
			<Container fluid>
				<Navbar.Brand href='/'>Excel.fun</Navbar.Brand>
				{isAdmin
					? <Nav>
						<Nav.Link as={Link} to='/admin'>Admin</Nav.Link>
					</Nav>
					: null}
			</Container>
		</Navbar>
	);
}
