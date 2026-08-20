import React, { ReactElement, useEffect, useState } from 'react';

import iSection from '../pages/iSection';
import { sort_sections_for_reports } from '../admin/AdminSectionReports';

/*
	A thin strip across the top of the home page showing the sections the
	logged-in user belongs to. Data comes from GET /api/sections, which is
	already scoped to the caller (see src/server/app_sections.ts).
*/

// 'Business Analytics (fall 2026)' -- reads the same way as sections do in the
// admin screens. Falls back to the join code when a section has no title, and
// drops the parenthetical when there is no term or year to show.
export function format_section_label(section: iSection): string {
	const title = String(section.title || section.code || '').trim();
	const term = String(section.term || '').trim();
	const year = section.year ? String(section.year) : '';
	const when = [term, year].filter(s => s !== '').join(' ');

	return when === '' ? title : title + ' (' + when + ')';
}

// Labels for every section, newest term first.
export function format_enrolled_sections(sections: iSection[]): string[] {
	return sort_sections_for_reports(sections).map(format_section_label);
}


export default function EnrolledSectionsBanner(): ReactElement | null {
	const [sections, setSections] = useState<iSection[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasFailed, setHasFailed] = useState(false);

	useEffect(() => {
		fetch('/api/sections', {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				setSections( Array.isArray(json) ? json : [] );
				setIsLoading(false);
			})
			.catch( () => {
				setHasFailed(true);
				setIsLoading(false);
			});
		}, [] );

	// The banner is informational, so it stays silent while loading and also
	// when the fetch fails -- no reason to put an error on the home page.
	if(isLoading || hasFailed) return null;

	const labels = format_enrolled_sections(sections);

	const text = labels.length === 0
		? 'You are not enrolled in any section.'
		: 'Enrolled in ' + labels.join(', ');

	return (
		<div className='text-muted small border-bottom'
			style={{ paddingTop: 4, paddingBottom: 4 }}>
			{ text }
		</div>
	);
}
