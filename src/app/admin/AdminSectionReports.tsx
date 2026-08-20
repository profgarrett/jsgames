import React, { ReactElement } from 'react';
import { Card, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { iAdminSection } from './iAdmin';

interface AdminSectionReportsPropsType {
	sections: iAdminSection[];
}

/*
	Per-section report links.
*/

// Chronological rank of a term within its year. Unrecognized terms get -1 so
// that they fall to the bottom of the year once the sort is reversed.
const TERM_ORDER: { [key: string]: number } = {
	spring: 0,
	summer: 1,
	fall: 2,
	winter: 3,
};

const term_rank = (term: string): number => {
	const rank = TERM_ORDER[String(term).toLowerCase()];
	return typeof rank === 'undefined' ? -1 : rank;
};

/**
	Newest first: year descending, then term descending, then code ascending.
	Puts the semester the admin actually cares about at the top.
*/
export function sort_sections_for_reports<T extends iAdminSection>(sections: T[]): T[] {
	return [...sections].sort( (a, b) => {
		if(a.year !== b.year) return b.year - a.year;

		const term_difference = term_rank(b.term) - term_rank(a.term);
		if(term_difference !== 0) return term_difference;

		return a.code.localeCompare(b.code);
	});
}


export default function AdminSectionReports(props: AdminSectionReportsPropsType): ReactElement {

	if(props.sections.length === 0) {
		return (
			<Card className='mb-4'>
				<Card.Body>
					<Card.Title>Section reports</Card.Title>
					<p className='mb-0'>No sections yet.</p>
				</Card.Body>
			</Card>
		);
	}

	const rows = sort_sections_for_reports(props.sections).map( section => (
		<tr key={section.idsection}>
			<td>{section.code} &mdash; {section.title} ({section.term} {section.year})</td>
			<td><Link to={'/ifgame/progress/'+section.idsection}>Progress</Link></td>
			<td><Link to={'/ifgame/recent/'+section.idsection}>Recent</Link></td>
			<td><Link to={'/ifgame/feedback/'+section.idsection}>Feedback</Link></td>
			<td><Link to={'/ifgame/kcs/'+section.idsection}>Learning</Link></td>
			<td><Link to={'/ifgame/questions/'+section.idsection}>Questions</Link></td>
		</tr>
	));

	return (
		<Card className='mb-4'>
			<Card.Body>
				<Card.Title>Section reports</Card.Title>
				<p className='text-muted' style={{ fontSize: '85%' }}>
					These reports are authorized per section: they only return data for
					sections you are enrolled in as faculty, even as the site administrator.
				</p>
				<Table bordered size='sm' style={{ fontSize: '90%' }}>
					<thead className='thead-dark'>
						<tr>
							<th>Section</th>
							<th>Progress</th>
							<th>Recent</th>
							<th>Feedback</th>
							<th>Learning</th>
							<th>Questions</th>
						</tr>
					</thead>
					<tbody>{ rows }</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
}
