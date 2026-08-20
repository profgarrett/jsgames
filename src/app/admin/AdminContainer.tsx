import React, { ReactElement, useEffect, useState } from 'react';
import { Alert, Breadcrumb, Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { getUserFromBrowser } from '../components/Authentication';
import ForceLogin from '../components/ForceLogin';
import { Loading, Message } from '../components/Misc';

import AdminCreateSectionForm, { iNewSection } from './AdminCreateSectionForm';
import AdminCreateUserForm, { iNewUser } from './AdminCreateUserForm';
import AdminJoinSectionForm from './AdminJoinSectionForm';
import AdminSectionReports from './AdminSectionReports';
import AdminUserTable from './AdminUserTable';
import { iAdminSection, iAdminUser, iAdminUserSection } from './iAdmin';


const JSON_HEADERS = {
	'Accept': 'application/json',
	'Content-Type': 'application/json',
};


/**
	Pull a readable message out of a failed response.

	The admin routes answer with { error: '...' }; the middleware answers with a
	bare 401/403 status and no body. Show whichever we get rather than a generic
	"something went wrong", so a bad code or a duplicate is diagnosable without
	opening devtools.
*/
async function error_from_response( response: Response ): Promise<string> {
	try {
		const json = await response.json();
		if( json && typeof json.error === 'string' ) return json.error;
	} catch {
		// No JSON body -- fall through to the status text.
	}

	if( response.status === 401 || response.status === 403 )
		return 'Not authorized. You must be logged in as the site administrator.';

	return 'Request failed (' + response.status + ')';
}


/**
	The admin page: every user and their sections, with the ability to create
	users and sections and to join or remove a user from a section.

	The isAdmin check below is a convenience so non-admins see an explanation
	instead of an empty table. It is not the security boundary -- the client
	cache is trivially spoofable, and user_require_admin on every /api/admin
	route is what actually protects the data.
*/
export default function AdminContainer(): ReactElement {
	const [users, setUsers] = useState<iAdminUser[]>([]);
	const [sections, setSections] = useState<iAdminSection[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [messageStyle, setMessageStyle] = useState('');

	// getUserFromBrowser reads a module-level cache populated before the first
	// render, so seed state from it and refresh once on mount. Reading it
	// directly during render would leave a stale value after a same-page login.
	const [isAdmin, setIsAdmin] = useState(getUserFromBrowser().isAdmin);

	useEffect(() => {
		setIsAdmin(getUserFromBrowser().isAdmin);
	}, []);

	const show_error = (text: string): void => {
		setMessage(text);
		setMessageStyle('Error');
	};

	const show_success = (text: string): void => {
		setMessage(text);
		setMessageStyle('');
	};

	// Reload both lists. Called after every mutation instead of patching local
	// state, which keeps the table honest about what the server actually did.
	const refresh = async (): Promise<void> => {
		setIsLoading(true);

		try {
			const [users_response, sections_response] = await Promise.all([
				fetch('/api/admin/users', { method: 'get', credentials: 'include', headers: JSON_HEADERS }),
				fetch('/api/admin/sections', { method: 'get', credentials: 'include', headers: JSON_HEADERS }),
			]);

			if (!users_response.ok) throw new Error(await error_from_response(users_response));
			if (!sections_response.ok) throw new Error(await error_from_response(sections_response));

			setUsers(await users_response.json());
			setSections(await sections_response.json());

		} catch (error: any) {
			setUsers([]);
			setSections([]);
			show_error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (isAdmin) void refresh();
		else setIsLoading(false);
	}, [isAdmin]);


	// Shared POST/DELETE wrapper. Returns true on success so the forms know
	// whether to clear themselves.
	const submit = async (url: string, method: string, body: any, success: string): Promise<boolean> => {
		try {
			const response = await fetch(url, {
				method: method,
				credentials: 'include',
				headers: JSON_HEADERS,
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				show_error(await error_from_response(response));
				return false;
			}

			show_success(success);
			await refresh();
			return true;

		} catch (error: any) {
			show_error(error.message);
			return false;
		}
	};

	const handleCreateUser = async (user: iNewUser): Promise<boolean> => {
		return submit('/api/admin/users', 'post', {
			username: user.username,
			password: user.password,
			idsection: user.idsection === '' ? null : Number(user.idsection),
			role: user.role,
		}, 'Created ' + user.username.trim().toLowerCase());
	};

	const handleCreateSection = async (section: iNewSection): Promise<boolean> => {
		return submit('/api/admin/sections', 'post', {
			code: section.code,
			title: section.title,
			year: Number(section.year),
			term: section.term,
			opens: section.opens,
			closes: section.closes,
			levels: section.levels,
		}, 'Created section ' + section.code.trim().toLowerCase());
	};

	const handleJoin = async (iduser: number, idsection: number, role: string): Promise<boolean> => {
		const user = users.find(u => u.iduser === iduser);
		const section = sections.find(s => s.idsection === idsection);

		return submit('/api/admin/enrollments', 'post', { iduser, idsection, role },
			'Added ' + (user ? user.username : 'user') +
			' to ' + (section ? section.code : 'section') + ' as ' + role);
	};

	const handleRemove = async (user: iAdminUser, section: iAdminUserSection): Promise<void> => {
		// Removing a section's last faculty member is allowed, but it hides the
		// section from the faculty UI entirely, so say so before it happens.
		const is_last_faculty = section.role === 'faculty'
			&& users.filter(u => u.sections.some(
				s => s.idsection === section.idsection && s.role === 'faculty')).length === 1;

		const warning = is_last_faculty
			? '\n\n' + section.code + ' will have no faculty member. It will no longer '
				+ 'appear in the faculty screens, though you can still manage it here.'
			: '';

		if (!window.confirm('Remove ' + user.username + ' from ' + section.code + '?' + warning)) return;

		await submit('/api/admin/enrollments', 'delete',
			{ iduser: user.iduser, idsection: section.idsection },
			'Removed ' + user.username + ' from ' + section.code);
	};


	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/'>Home</Breadcrumb.Item>
			<Breadcrumb.Item title='Admin' active>Admin</Breadcrumb.Item>
		</Breadcrumb>
	);

	if (!isAdmin) {
		return (
			<Container fluid>
				<Row><Col>
					<ForceLogin />
					{crumbs}
					<h3>Admin</h3>
					<Alert variant='warning'>
						This page is only available to the site administrator.
					</Alert>
				</Col></Row>
			</Container>
		);
	}

	return (
		<Container fluid>
			<Row><Col>
				<ForceLogin />
				{crumbs}
				<h3>Admin</h3>
				<div style={{ marginBottom: 20 }}>
					<Link to='/ifgame/progress'>
						<Button variant='outline-info'>Class progress</Button>
					</Link>
				</div>
				<Message message={message} style={messageStyle} />
				<Loading loading={isLoading} />

				<AdminCreateUserForm
					sections={sections}
					onCreate={handleCreateUser}
				/>

				<AdminCreateSectionForm
					onCreate={handleCreateSection}
				/>

				<AdminJoinSectionForm
					users={users}
					sections={sections}
					onJoin={handleJoin}
				/>

				<AdminSectionReports
					sections={sections}
				/>

				<h4>Users ({users.length})</h4>
				<AdminUserTable
					users={users}
					onRemove={handleRemove}
				/>
			</Col></Row>
		</Container>
	);
}
