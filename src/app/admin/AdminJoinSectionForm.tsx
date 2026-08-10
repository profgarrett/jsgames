import React, { ReactElement, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';

import { ADMIN_ROLES, iAdminSection, iAdminUser } from './iAdmin';

interface AdminJoinSectionFormPropsType {
	users: iAdminUser[];
	sections: iAdminSection[];
	onJoin: (iduser: number, idsection: number, role: string) => Promise<boolean>;
}


/**
	Which sections may this user still be joined to?

	One enrollment per (user, section), so anything they already belong to is
	filtered out -- the rule shows up as an absent option instead of a 409
	after the fact. The server still returns 409 (backed by the unique index
	from sql27), which covers the case where this list has gone stale.

	Mirrors sections_available_to_user() in src/server/app_admin.ts.
*/
export function sections_available_to_user(
		sections: iAdminSection[],
		user: iAdminUser | null ): iAdminSection[] {

	if( user === null ) return sections;
	const taken = new Set( user.sections.map( s => s.idsection ) );
	return sections.filter( s => !taken.has(s.idsection) );
}


// Join an existing user to an existing section.
export default function AdminJoinSectionForm(props: AdminJoinSectionFormPropsType): ReactElement {
	const [iduser, setIduser] = useState('');
	const [idsection, setIdsection] = useState('');
	const [role, setRole] = useState('student');
	const [isSaving, setIsSaving] = useState(false);

	const selectedUser = props.users.find(u => String(u.iduser) === iduser) || null;
	const available = sections_available_to_user(props.sections, selectedUser);

	// Changing the user can invalidate the chosen section, so clear it.
	const handleUserChange = (value: string): void => {
		setIduser(value);
		setIdsection('');
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (iduser === '' || idsection === '') return;

		setIsSaving(true);
		const ok = await props.onJoin(Number(iduser), Number(idsection), role);
		setIsSaving(false);

		if (ok) {
			setIdsection('');
			setRole('student');
		}
	};

	const section_options = available.map(s => (
		<option key={s.idsection} value={s.idsection}>
			{s.code} &mdash; {s.title} ({s.term} {s.year})
		</option>
	));

	// A user already in everything gets an explanation rather than an empty box.
	const no_sections_left = selectedUser !== null && available.length === 0
		? <Form.Text className='text-muted'>
			{selectedUser.username} already belongs to every section.
		</Form.Text>
		: null;

	return (
		<Card className='mb-4'>
			<Card.Body>
				<Card.Title>Join a user to a section</Card.Title>
				<Form onSubmit={handleSubmit}>
					<Row>
						<Col md={4}>
							<Form.Group className='mb-2' controlId='join_iduser'>
								<Form.Label>User</Form.Label>
								<Form.Select
									value={iduser}
									onChange={e => handleUserChange(e.target.value)}
									required
								>
									<option value=''>Choose a user...</option>
									{props.users.map(u => (
										<option key={u.iduser} value={u.iduser}>{u.username}</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col md={4}>
							<Form.Group className='mb-2' controlId='join_idsection'>
								<Form.Label>Section</Form.Label>
								<Form.Select
									value={idsection}
									onChange={e => setIdsection(e.target.value)}
									disabled={iduser === ''}
									required
								>
									<option value=''>Choose a section...</option>
									{section_options}
								</Form.Select>
								{no_sections_left}
							</Form.Group>
						</Col>
						<Col md={2}>
							<Form.Group className='mb-2' controlId='join_role'>
								<Form.Label>Role</Form.Label>
								<Form.Select value={role} onChange={e => setRole(e.target.value)}>
									{ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col md={2} className='d-flex align-items-end'>
							<Form.Group className='mb-2'>
								<Button
									type='submit'
									variant='primary'
									disabled={isSaving || iduser === '' || idsection === ''}
								>{isSaving ? 'Joining...' : 'Join'}</Button>
							</Form.Group>
						</Col>
					</Row>
				</Form>
			</Card.Body>
		</Card>
	);
}
