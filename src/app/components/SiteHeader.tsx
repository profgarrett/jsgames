import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Nav, Navbar, Row, Col } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

import { getUserFromBrowser } from './Authentication';
import useBookHub from '../pages/useBookHub';
import '../pages/book_theme.css';

/*
	Slug of the reading page at `pathname` ("/pages/course_dv/dv40-colors/index"
	-> "course_dv/dv40-colors/index"), or '' for anything else, including the
	/pages section picker and /pages/list, which have no single course.
*/
const getBookSlug = (pathname: string): string => {
	if (!pathname.startsWith('/pages/') || pathname === '/pages/list') return '';
	try {
		return decodeURIComponent(pathname.slice('/pages/'.length)).replace(/\/+$/, '');
	} catch {
		return '';
	}
};

/**
	The site's single navbar, rendered once in index.jsx above <Routes>.

	The Admin link appears only for the site administrator. This is cosmetic --
	user_require_admin on every /api/admin route is the actual boundary.

	On the reading pages (/pages/...) it renders as a light, book-style header
	carrying the course's title (from its hub page, see useBookHub.ts) so it
	matches the book layout in PageView.tsx; everywhere else it is the dark
	Bootstrap navbar.

	Note this renders for logged-out visitors too. Do not
	wrap it in ForceLogin, or the landing page will bounce to /login.
*/
export default function SiteHeader(): ReactElement {
	// getUserFromBrowser() reads a module-level cache, not state. index.jsx
	// populates it before the first render, but a login later in the same page
	// load would not re-render this component -- hence state plus a mount
	// effect, so the Admin link is not missing after logging in.
	const [isAdmin, setIsAdmin] = useState(getUserFromBrowser().isAdmin);

	// Deploy date/time, pulled from the same /meta.json that CacheBuster polls
	// for the build hash. Admin-only, purely informational.
	const [deployDt, setDeployDt] = useState<string | null>(null);

	// meta.json is only written by the production build (build_metajson.js) and,
	// even then, only ends up reachable at the site root once deployed. The dev
	// server (--static build) roots the build/ folder itself at '/', so a fetch
	// would 404 as /meta.json locally -- same reason CacheBuster skips itself on
	// localhost. Rather than hide the control there, show a fixed dev-mode label.
	const [isLocalhost] = useState(
		document.location.href.substr(0, 'http://localhost'.length) === 'http://localhost'
	);

	const location = useLocation();
	const isBookRoute = location.pathname === '/pages' || location.pathname.startsWith('/pages/');
	const hub = useBookHub(isBookRoute ? getBookSlug(location.pathname) : '');

	useEffect(() => {
		setIsAdmin(getUserFromBrowser().isAdmin);
	}, []);

	useEffect(() => {
		if (!isAdmin || isLocalhost) return;

		fetch(`/meta.json?${new Date().getTime()}`, { cache: 'no-cache' })
			.then(response => response.json())
			.then(json => {
				if (typeof json.dt === 'string') setDeployDt(json.dt);
			})
			.catch(() => {
				// Not critical -- just don't show a deploy time.
			});
	}, [isAdmin, isLocalhost]);

	const deployText = isAdmin && (isLocalhost || deployDt)
		? (isLocalhost ? 'localhost dev mode' : `Deployed ${new Date(deployDt as string).toLocaleString()}`)
		: null;

	if (isBookRoute) {
		return (
			<header className='book-header'>
				<div className='book-header-inner'>
					{hub && hub.title
						? <Link to={`/pages/${hub.rootSlug}`} className='book-header-brand'>{hub.title}</Link>
						: <Link to='/' className='book-header-brand'>Excel.fun</Link>}
					<nav className='book-header-nav' aria-label='Site'>
						<Link to='/'>Home</Link>
						<Link to='/live'>Live</Link>
						{isAdmin ? <Link to='/admin'>Admin</Link> : null}
						{deployText ? <span className='book-header-deploy'>{deployText}</span> : null}
					</nav>
				</div>
			</header>
		);
	}

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
				{deployText
					? <Navbar.Text
							className='ms-auto'
							style={{ fontSize: '0.75rem', opacity: 0.6 }}
						>
							{deployText}
						</Navbar.Text>
					: null}
			</Container>
		</Navbar>
		</Col></Row>
		</Container>
	);
}
