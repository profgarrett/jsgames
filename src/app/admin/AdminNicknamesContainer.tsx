import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Alert, Breadcrumb, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { getUserFromBrowser } from '../components/Authentication';
import ForceLogin from '../components/ForceLogin';
import { Loading, Message } from '../components/Misc';
import { StyledReactTable } from '../components/StyledReactTable';

import { iNickname } from './iAdmin';
import { iNicknameUploadRow, iParseResult, parse_roster_file } from './nicknameParser';


const JSON_HEADERS = {
	'Accept': 'application/json',
	'Content-Type': 'application/json',
};


/**
	Pull a readable message out of a failed response.

	Same shape as AdminContainer's: the routes answer with { error: '...' } and
	the middleware answers with a bare 401/403 and no body.
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
	Upload a Blackboard roster and view the student nicknames it produced.

	The flow is deliberately two steps -- choose a file, see what was found,
	then upload -- rather than uploading on selection. A roster export is easy
	to pick wrong (the gradebook download looks almost identical), and the
	preview is what makes that obvious before anything is written.

	The isAdmin check below is a convenience so non-admins see an explanation
	instead of an empty table. It is not the security boundary --
	user_require_admin on every /api/admin route is.
*/
export default function AdminNicknamesContainer(): ReactElement {
	const [nicknames, setNicknames] = useState<iNickname[]>([]);
	const [domain, setDomain] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [messageStyle, setMessageStyle] = useState('');

	// Result of parsing the chosen file, before anything is sent.
	const [preview, setPreview] = useState<iParseResult | null>(null);
	const [filename, setFilename] = useState('');

	// Held so the file input can be cleared after a successful upload;
	// otherwise choosing the same file again fires no change event.
	const fileInput = useRef<HTMLInputElement | null>(null);

	// getUserFromBrowser reads a module-level cache populated before the first
	// render, so seed state from it and refresh once on mount.
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

	// Reload the table. Called after every mutation instead of patching local
	// state, which keeps the table honest about what the server actually did.
	const refresh = async (): Promise<void> => {
		setIsLoading(true);

		try {
			const response = await fetch('/api/admin/nicknames',
				{ method: 'get', credentials: 'include', headers: JSON_HEADERS });

			if (!response.ok) throw new Error(await error_from_response(response));

			const json = await response.json();
			setNicknames(json.nicknames);
			setDomain(json.domain);

		} catch (error: any) {
			setNicknames([]);
			show_error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (isAdmin) void refresh();
		else setIsLoading(false);
	}, [isAdmin]);


	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		const file = e.target.files && e.target.files[0];

		setMessage('');
		setPreview(null);
		setFilename('');

		if (!file) return;

		setFilename(file.name);

		try {
			const result = await parse_roster_file(file);
			setPreview(result);
			if (result.error !== null) show_error(result.error);

		} catch (error: any) {
			show_error('Could not read that file: ' + error.message);
		}
	};


	const handleUpload = async (): Promise<void> => {
		if (!preview || preview.error !== null || preview.rows.length === 0) return;

		setIsSaving(true);

		try {
			const response = await fetch('/api/admin/nicknames', {
				method: 'post',
				credentials: 'include',
				headers: JSON_HEADERS,
				body: JSON.stringify({ rows: preview.rows }),
			});

			if (!response.ok) {
				show_error(await error_from_response(response));
				return;
			}

			const json = await response.json();

			const skipped_note = json.skipped && json.skipped.length > 0
				? ' ' + json.skipped.length + ' row(s) were rejected by the server.'
				: '';

			show_success(
				'Stored ' + json.stored + ' nickname(s). ' +
				'Filled in ' + json.backfilled + ' existing account(s); the rest will be ' +
				'set the next time those students log in.' + skipped_note);

			setPreview(null);
			setFilename('');
			if (fileInput.current) fileInput.current.value = '';

			await refresh();

		} catch (error: any) {
			show_error(error.message);
		} finally {
			setIsSaving(false);
		}
	};


	const handleDelete = async (nickname: iNickname): Promise<void> => {
		if (!window.confirm(
			'Remove the roster entry for ' + nickname.nickname + ' (' + nickname.email + ')?\n\n' +
			'This does not change a nickname already saved on their account.')) return;

		try {
			const response = await fetch('/api/admin/nicknames/' + nickname.idnickname,
				{ method: 'delete', credentials: 'include', headers: JSON_HEADERS });

			if (!response.ok) {
				show_error(await error_from_response(response));
				return;
			}

			show_success('Removed ' + nickname.nickname);
			await refresh();

		} catch (error: any) {
			show_error(error.message);
		}
	};


	const columns = [
		{
			id: 'nickname',
			Header: 'Nickname',
			width: null,
			accessor: 'nickname',
		},
		{
			id: 'email',
			Header: 'Email',
			width: 240,
			accessor: 'email',
		},
		{
			id: 'student_id',
			Header: 'Student ID',
			width: 120,
			accessor: (row: iNickname) => row.student_id === null ? '' : row.student_id,
		},
		{
			id: 'account',
			Header: 'Account',
			width: 150,
			// Three states worth telling apart: no account yet, an account
			// already carrying this name, and an account whose nickname is still
			// blank (it gets filled at their next login).
			accessor: (row: iNickname) => {
				if (row.iduser === null) return 'not registered';
				if (row.user_nickname === null || row.user_nickname === '') return 'awaiting login';
				return row.user_nickname;
			},
		},
		{
			id: 'remove',
			Header: '',
			width: 90,
			accessor: (row: iNickname) => (
				<Button
					variant='outline-danger'
					size='sm'
					title={'Remove ' + row.nickname}
					onClick={() => handleDelete(row)}
				>&times; remove</Button>
			),
		},
	];


	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/'>Home</Breadcrumb.Item>
			<Breadcrumb.Item title='Admin' href='/admin'>Admin</Breadcrumb.Item>
			<Breadcrumb.Item title='Nicknames' active>Nicknames</Breadcrumb.Item>
		</Breadcrumb>
	);

	if (!isAdmin) {
		return (
			<Container fluid>
				<Row><Col>
					<ForceLogin />
					{crumbs}
					<h3>Nicknames</h3>
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
				<h3>Nicknames</h3>

				<div style={{ marginBottom: 20 }}>
					<Link to='/admin'>
						<Button variant='outline-info'>Back to admin</Button>
					</Link>
				</div>

				<Message message={message} style={messageStyle} />

				<Card className='mb-4'>
					<Card.Body>
						<Card.Title>Upload a roster</Card.Title>

						<Form.Group className='mb-2' controlId='nickname_file'>
							<Form.Label>Blackboard export</Form.Label>
							<Form.Control
								type='file'
								ref={fileInput as any}
								accept='.xls,.xlsx,.csv,.tsv,.txt'
								onChange={handleFileChange}
							/>
							<Form.Text className='text-muted'>
								The file downloaded from Blackboard, unmodified. Only
								<i> Last Name</i>, <i>First Name</i>, <i>Username</i> and
								<i> Student ID</i> are read; every other column is ignored.
								Usernames become <code>username@{domain || 'mix.wvu.edu'}</code>.
								Re-uploading replaces the entries it matches.
							</Form.Text>
						</Form.Group>

						{preview !== null && preview.error === null && (
							<div style={{ marginTop: 12 }}>
								<Alert variant='info' className='py-2'>
									Found <b>{preview.rows.length}</b> student(s) in{' '}
									<b>{filename}</b> ({preview.encoding},{' '}
									{preview.delimiter}-separated).
									{preview.skipped.length > 0 && (
										<> Skipped {preview.skipped.length} line(s):{' '}
										{preview.skipped.slice(0, 5)
											.map(s => 'line ' + s.line + ' (' + s.reason.toLowerCase() + ')')
											.join(', ')}
										{preview.skipped.length > 5 ? ', ...' : ''}.</>
									)}
								</Alert>

								<PreviewTable rows={preview.rows} domain={domain} />

								<Button
									variant='primary'
									onClick={handleUpload}
									disabled={isSaving}
								>{isSaving ? 'Uploading...' : 'Upload ' + preview.rows.length + ' nickname(s)'}</Button>
							</div>
						)}
					</Card.Body>
				</Card>

				<Loading loading={isLoading} />

				<h4>Nicknames ({nicknames.length})</h4>
				<StyledReactTable columns={columns} data={nicknames} />
				<p style={{ color: 'gray', fontSize: '0.9em' }}>
					A nickname is copied onto a student&rsquo;s account the first time they
					log in, and only if their account does not already have one. Editing a
					roster entry here never overwrites a name already saved on an account.
				</p>
			</Col></Row>
		</Container>
	);
}


/**
	The first few parsed rows, so the admin can see the columns landed where
	they expect before writing anything.

	Five rows is enough to catch a first/last name swap or a gradebook file
	chosen by mistake, and short enough not to push the upload button off
	screen.
*/
function PreviewTable( props: { rows: iNicknameUploadRow[], domain: string } ): ReactElement {
	const shown = props.rows.slice(0, 5);
	const domain = props.domain || 'mix.wvu.edu';

	const email_for = (username: string): string =>
		username.indexOf('@') === -1 ? username + '@' + domain : username;

	return (
		<div style={{ marginBottom: 12, overflowX: 'auto' }}>
			<table className='table table-sm table-bordered' style={{ maxWidth: 700 }}>
				<thead>
					<tr>
						<th>Nickname</th>
						<th>Email</th>
						<th>Student ID</th>
					</tr>
				</thead>
				<tbody>
					{shown.map((row, i) => (
						<tr key={i}>
							<td>{row.first_name} {row.last_name}</td>
							<td>{email_for(row.username)}</td>
							<td>{row.student_id}</td>
						</tr>
					))}
				</tbody>
			</table>
			{props.rows.length > shown.length && (
				<span style={{ color: 'gray', fontSize: '0.9em' }}>
					...and {props.rows.length - shown.length} more.
				</span>
			)}
		</div>
	);
}
