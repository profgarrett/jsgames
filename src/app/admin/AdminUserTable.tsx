import React, { ReactElement } from 'react';
import { Button } from 'react-bootstrap';

import { StyledReactTable } from '../components/StyledReactTable';
import { iAdminUser, iAdminUserSection } from './iAdmin';

interface AdminUserTablePropsType {
	users: iAdminUser[];
	onRemove: (user: iAdminUser, section: iAdminUserSection) => void;
}


/**
	Render a user's memberships as plain text: "acct301 (student), acct302 (faculty)".

	Kept separate from the JSX so the "Enrolled in" column can be a string.
	StyledReactTable filters and sorts with String(cellValue), so a column whose
	accessor returns JSX stringifies to "[object Object]" and becomes
	unfilterable -- which is why the remove buttons live in their own column
	rather than inline with the section names.
*/
export function format_sections( user: iAdminUser ): string {
	if( user.sections.length === 0 ) return '';
	return user.sections.map( s => s.code + ' (' + s.role + ')' ).join(', ');
}


/**
	Every user and the sections they belong to, with a remove button per
	membership.

	Roles are plain text, not a dropdown. There is no role-change route by
	design -- to move someone between roles, remove them and add them back.
	The note under the table says so, so the omission reads as a decision
	rather than a missing feature.
*/
export default function AdminUserTable(props: AdminUserTablePropsType): ReactElement {

	const render_remove_buttons = (user: iAdminUser): ReactElement => {
		if (user.sections.length === 0) {
			return <span style={{ color: 'gray' }}>&mdash;</span>;
		}

		return (
			<>
				{user.sections.map(section => (
					<Button
						key={section.idsection}
						variant='outline-danger'
						size='sm'
						title={'Remove ' + user.username + ' from ' + section.code}
						style={{ marginRight: 4, marginBottom: 2 }}
						onClick={() => props.onRemove(user, section)}
					>&times; {section.code}</Button>
				))}
			</>
		);
	};

	const columns = [
		{
			id: 'username',
			Header: 'Username',
			width: null,
			accessor: 'username',
		},
		{
			id: 'section_count',
			Header: '#',
			width: 60,
			accessor: (row: iAdminUser) => row.sections.length,
		},
		{
			id: 'sections',
			Header: 'Enrolled in',
			width: 220,
			accessor: (row: iAdminUser) => format_sections(row),
		},
		{
			id: 'remove',
			Header: 'Remove from',
			width: 180,
			accessor: (row: iAdminUser) => render_remove_buttons(row),
		},
		{
			id: 'iduser',
			Header: 'ID',
			width: 70,
			accessor: 'iduser',
		},
	];

	return (
		<>
			<StyledReactTable columns={columns} data={props.users} />
			<p style={{ color: 'gray', fontSize: '0.9em' }}>
				Roles cannot be edited. To change someone&rsquo;s role, remove them from the
				section and add them back with the new role.
			</p>
		</>
	);
}
