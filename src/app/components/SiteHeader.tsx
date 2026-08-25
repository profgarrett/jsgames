import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Nav, Navbar, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { getUserFromBrowser } from './Authentication';

/**
	The site's single navbar, rendered once in index.jsx above <Routes>.

	The Admin link appears only for the site administrator. This is cosmetic --
	user_require_admin on every /api/admin route is the actual boundary.

	Note this renders for logged-out visitors too. Do not
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
		<Container fluid style={{  }}>
			<Row><Col>
		<Navbar bg='dark' variant='dark'>
			<Container fluid>
				<Navbar.Brand href='/'>Excel.fun</Navbar.Brand>
				<Nav>
					<Nav.Link as={Link} to='/live'>Live</Nav.Link>
				{isAdmin
					? <Nav.Link as={Link} to='/admin'>Admin</Nav.Link>
					: null}
				</Nav>
			</Container>
		</Navbar>
		</Col></Row>
		</Container>
	);
}
