import React, { ReactElement, useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';

import { ADMIN_ROLES, iAdminSection } from './iAdmin';

// Kept in step with MIN_PASSWORD_LENGTH in src/server/app_admin.ts.
// The server's check is the authoritative one; this only saves a round trip.
export const MIN_PASSWORD_LENGTH = 8;

export interface iNewUser {
	username: string;
	password: string;
	idsection: string;
	role: string;
}

interface AdminCreateUserFormPropsType {
	sections: iAdminSection[];
	onCreate: (user: iNewUser) => Promise<boolean>;
}


function blank_user(): iNewUser {
	return { username: '', password: '', idsection: '', role: 'student' };
}


/**
	Create a user, optionally enrolling them in a section at the same time.

	The admin types a password on the user's behalf and has to pass it along
	out of band; there is no admin password-reset route, so afterwards users go
	through the normal /api/users/passwordresetrequest flow. The field has a
	show/hide toggle because the admin needs to read back what they typed.
*/
export default function AdminCreateUserForm(props: AdminCreateUserFormPropsType): ReactElement {
	const [user, setUser] = useState<iNewUser>(blank_user());
	const [showPassword, setShowPassword] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const set_field = (field: keyof iNewUser, value: string): void => {
		setUser(prev => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		setIsSaving(true);
		const ok = await props.onCreate(user);
		setIsSaving(false);

		if (ok) {
			setUser(blank_user());
			setShowPassword(false);
		}
	};

	return (
		<Card className='mb-4'>
			<Card.Body>
				<Card.Title>Create a user</Card.Title>
				<Form onSubmit={handleSubmit}>
					<Row>
						<Col md={4}>
							<Form.Group className='mb-2' controlId='user_username'>
								<Form.Label>Username</Form.Label>
								<Form.Control
									type='text'
									value={user.username}
									maxLength={255}
									placeholder='student@wvu.edu'
									onChange={e => set_field('username', e.target.value)}
									required
								/>
							</Form.Group>
						</Col>
						<Col md={3}>
							<Form.Group className='mb-2' controlId='user_password'>
								<Form.Label>Password</Form.Label>
								<InputGroup>
									<Form.Control
										type={showPassword ? 'text' : 'password'}
										value={user.password}
										minLength={MIN_PASSWORD_LENGTH}
										onChange={e => set_field('password', e.target.value)}
										required
									/>
									<Button
										variant='outline-secondary'
										type='button'
										onClick={() => setShowPassword(!showPassword)}
									>{showPassword ? 'Hide' : 'Show'}</Button>
								</InputGroup>
								<Form.Text className='text-muted'>
									At least {MIN_PASSWORD_LENGTH} characters. You will need to
									pass this to the user yourself.
								</Form.Text>
							</Form.Group>
						</Col>
						<Col md={3}>
							<Form.Group className='mb-2' controlId='user_idsection'>
								<Form.Label>Section (optional)</Form.Label>
								<Form.Select
									value={user.idsection}
									onChange={e => set_field('idsection', e.target.value)}
								>
									<option value=''>No section</option>
									{props.sections.map(s => (
										<option key={s.idsection} value={s.idsection}>
											{s.code} &mdash; {s.title}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col md={1}>
							<Form.Group className='mb-2' controlId='user_role'>
								<Form.Label>Role</Form.Label>
								<Form.Select
									value={user.role}
									onChange={e => set_field('role', e.target.value)}
									disabled={user.idsection === ''}
								>
									{ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col md={1} className='d-flex align-items-start'>
							<Form.Group className='mb-2' style={{ marginTop: 32 }}>
								<Button type='submit' variant='primary' disabled={isSaving}>
									{isSaving ? 'Creating...' : 'Create'}
								</Button>
							</Form.Group>
						</Col>
					</Row>
				</Form>
			</Card.Body>
		</Card>
	);
}
