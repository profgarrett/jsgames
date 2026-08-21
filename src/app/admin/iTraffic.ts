//
// Types for the admin traffic report.
//
// Loaded from /api/admin/traffic/pages and /api/admin/traffic/users.
// See src/server/app_traffic.ts.
//

// Which way round the report is read. The two views are the same data grouped
// by opposite keys, and each one's drill-down is the other one scoped to a
// single row.
export type iTrafficView = 'pages' | 'users';

// One page's totals for the current filter.
//
// active_seconds is engaged time with idle gaps excluded; open_seconds is
// wall-clock time the page was open. The two answer different questions and
// both are shown, since a large gap between them means a page was left sitting
// in a background tab.
export interface iTrafficPage {
	page: string;
	views: number;
	users: number;
	active_seconds: number;
	open_seconds: number;
	last_datetime: string | null;
}

// One user's totals. `pages` (how many distinct pages they touched) is present
// in the by-user view and absent in the drill-down under a single page, where
// it would be a column of 1s.
export interface iTrafficUser {
	username: string;
	views: number;
	pages?: number;
	active_seconds: number;
	open_seconds: number;
	last_datetime: string | null;
}

// The filter the server actually applied, including any dates it defaulted.
export interface iTrafficFilter {
	start: string;
	end: string;
	idsection: number | null;
	students_only: boolean;
	page: string | null;
	username: string | null;
}

/**
	A row of the table, whichever way the report is grouped.

	The two views differ only in what the first column names and what `breadth`
	counts, so one shape drives one table rather than two near-identical ones
	drifting apart.

	@prop key      page path or username; identifies the row for drill-down
	@prop breadth  distinct users (pages view) or distinct pages (users view),
	               and null in a drill-down where the count is always 1
*/
export interface iTrafficRow {
	key: string;
	views: number;
	breadth: number | null;
	active_seconds: number;
	open_seconds: number;
	last_datetime: string | null;
}

export function page_to_row( page: iTrafficPage ): iTrafficRow {
	return {
		key: page.page,
		views: page.views,
		breadth: page.users,
		active_seconds: page.active_seconds,
		open_seconds: page.open_seconds,
		last_datetime: page.last_datetime,
	};
}

export function user_to_row( user: iTrafficUser ): iTrafficRow {
	return {
		key: user.username,
		views: user.views,
		breadth: typeof user.pages === 'undefined' ? null : user.pages,
		active_seconds: user.active_seconds,
		open_seconds: user.open_seconds,
		last_datetime: user.last_datetime,
	};
}

// Sortable columns. 'label' and 'average' are derived; the rest are columns on
// iTrafficRow.
export const TRAFFIC_SORTS = [
	'label', 'views', 'breadth', 'active_seconds', 'average', 'open_seconds', 'last_datetime',
] as const;

export type iTrafficSort = typeof TRAFFIC_SORTS[number];
