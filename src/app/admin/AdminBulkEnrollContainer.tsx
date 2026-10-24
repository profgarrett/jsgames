import React, { ReactElement, useEffect, useState } from 'react';
import { Alert, Badge, Breadcrumb, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { getUserFromBrowser } from '../components/Authentication';
import ForceLogin from '../components/ForceLogin';
import { Loading, Message } from '../components/Misc';

import { iAdminSection, iBulkEnrollResponse, iBulkEnrollResult } from './iAdmin';


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
	Split the textarea into usernames: one per line, trimmed, lowercased, with
	blanks and exact repeats dropped. The server applies the same rules; doing
	it here as well keeps the count on the button honest.
*/
export function parse_username_lines( text: string ): string[] {
	const seen = new Set<string>();
	const out: string[] = [];

	text.split(/\r?\n/).forEach( raw => {
		const u = raw.trim().toLowerCase();
		if( u === '' || seen.has(u) ) return;
		seen.add(u);
		out.push(u);
	});

	return out;
}


// How each server status is shown. Order here is the order rows are sorted in,
// so the lines needing attention come first.
const STATUS_DISPLAY: { [status: string]: { label: string, variant: string } } = {
	no_account: { label: 'Not logged in yet (skipped)', variant: 'warning' },
	duplicate: { label: 'Duplicate of an earlier line', variant: 'secondary' },
	already: { label: 'Already in section', variant: 'info' },
	added: { label: 'Added', variant: 'success' },
};
const STATUS_ORDER = Object.keys(STATUS_DISPLAY);


/**
	Paste a list of usernames and join every matching account to one section.

	Only accounts that already exist are joined. Students get an account the
	first time they log in, so anyone who hasn't yet is listed and skipped;
	running the same list again later picks them up. Anyone already in the
	section is left alone, whatever their role.

	The isAdmin check below is a convenience so non-admins see an explanation
	instead of an empty form. It is not the security boundary --
	user_require_admin on every /api/admin route is.
*/
export default function AdminBulkEnrollContainer(): ReactElement {
	const [sections, setSections] = useState<iAdminSection[]>([]);
	const [idsection, setIdsection] = useState('');
	const [text, setText] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [messageStyle, setMessageStyle] = useState('');
	const [result, setResult] = useState<iBulkEnrollResponse | null>(null);

	// getUserFromBrowser reads a module-level cache populated before the first
	// render, so seed state from it and refresh once on mount.
	const [isAdmin, setIsAdmin] = useState(getUserFromBrowser().isAdmin);

	useEffect(() => {
		setIsAdmin(getUserFromBrowser().isAdmin);
	}, []);

	const show_error = (msg: string): void => {
		setMessage(msg);
		setMessageStyle('Error');
	};

	const show_success = (msg: string): void => {
		setMessage(msg);
		setMessageStyle('');
	};

	const load_sections = async (): Promise<void> => {
		setIsLoading(true);

		try {
			const response = await fetch('/api/admin/sections',
				{ method: 'get', credentials: 'include', headers: JSON_HEADERS });

			if (!response.ok) throw new Error(await error_from_response(response));

			setSections(await response.json());

		} catch (error: any) {
			setSections([]);
			show_error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (isAdmin) void load_sections();
		else setIsLoading(false);
	}, [isAdmin]);


	const usernames = parse_username_lines(text);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (idsection === '' || usernames.length === 0) return;

		setIsSaving(true);
		setResult(null);
		setMessage('');

		try {
			const response = await fetch('/api/admin/enrollments/bulk', {
				method: 'post',
				credentials: 'include',
				headers: JSON_HEADERS,
				body: JSON.stringify({ idsection: Number(idsection), usernames }),
			});

			if (!response.ok) {
				show_error(await error_from_response(response));
				return;
			}

			const json: iBulkEnrollResponse = await response.json();
			setResult(json);

			show_success(
				'Added ' + json.added + ' to ' + json.code + ' as ' + json.role + '. ' +
				json.already + ' already in the section. ' +
				json.no_account + ' not logged in yet (skipped).' +
				(json.duplicate > 0 ? ' ' + json.duplicate + ' duplicate line(s).' : ''));

		} catch (error: any) {
			show_error(error.message);
		} finally {
			setIsSaving(false);
		}
	};


	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/'>Home</Breadcrumb.Item>
			<Breadcrumb.Item title='Admin' href='/admin'>Admin</Breadcrumb.Item>
			<Breadcrumb.Item title='Bulk add' active>Bulk add to section</Breadcrumb.Item>
		</Breadcrumb>
	);

	if (!isAdmin) {
		return (
			<Container fluid>
				<Row><Col>
					<ForceLogin />
					{crumbs}
					<h3>Bulk add to section</h3>
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
				<h3>Bulk add to section</h3>

				<div style={{ marginBottom: 20 }}>
					<Link to='/admin'>
						<Button variant='outline-info'>Back to admin</Button>
					</Link>
				</div>

				<Message message={message} style={messageStyle} />
				<Loading loading={isLoading} />

				<Card className='mb-4'>
					<Card.Body>
						<Form onSubmit={handleSubmit}>
							<Row>
								<Col md={6}>
									<Form.Group className='mb-2' controlId='bulk_usernames'>
										<Form.Label>Usernames, one per line</Form.Label>
										<Form.Control
											as='textarea'
											rows={14}
											value={text}
											onChange={e => setText(e.target.value)}
											placeholder={'bj000@mix.wvu.edu\nab123'}
											style={{ fontFamily: 'monospace' }}
										/>
										<Form.Text className='text-muted'>
											A bare username such as <code>bj000</code> also matches
											<code> bj000@</code> plus the campus email domain.
										</Form.Text>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group className='mb-3' controlId='bulk_idsection'>
										<Form.Label>Section</Form.Label>
										<Form.Select
											value={idsection}
											onChange={e => setIdsection(e.target.value)}
											required
										>
											<option value=''>Choose a section...</option>
											{sections.map(s => (
												<option key={s.idsection} value={s.idsection}>
													{s.code} &mdash; {s.title} ({s.term} {s.year})
												</option>
											))}
										</Form.Select>
									</Form.Group>

									<Button
										type='submit'
										variant='primary'
										disabled={isSaving || idsection === '' || usernames.length === 0}
									>{isSaving
										? 'Adding...'
										: 'Add ' + usernames.length + ' username(s) to section'}</Button>

									<p className='text-muted' style={{ marginTop: 12, fontSize: '0.9em' }}>
										Matching accounts are joined as <b>students</b>. Anyone already
										in the section keeps their current role. Usernames with no
										account (they have not logged in yet) are skipped, so it is
										safe to run the same list again later.
									</p>
								</Col>
							</Row>
						</Form>
					</Card.Body>
				</Card>

				{result !== null && <ResultTable results={result.results} />}
			</Col></Row>
		</Container>
	);
}


// One row per pasted line, problems first, then in the order pasted.
function ResultTable( props: { results: iBulkEnrollResult[] } ): ReactElement {
	const rows = props.results
		.map( (r, i) => ({ ...r, i }) )
		.sort( (a, b) =>
			(STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)) || (a.i - b.i) );

	return (
		<div style={{ overflowX: 'auto' }}>
			<h4>Results ({rows.length})</h4>
			<table className='table table-sm table-bordered' style={{ maxWidth: 900 }}>
				<thead>
					<tr>
						<th>Pasted</th>
						<th>Matched account</th>
						<th>Result</th>
					</tr>
				</thead>
				<tbody>
					{rows.map( r => {
						const display = STATUS_DISPLAY[r.status] || { label: r.status, variant: 'secondary' };
						return (
							<tr key={r.i}>
								<td><code>{r.line}</code></td>
								<td>{r.username === null ? '' : r.username}</td>
								<td><Badge bg={display.variant}>{display.label}</Badge></td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
