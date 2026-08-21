import React, { ReactElement } from 'react';
import { Table } from 'react-bootstrap';

import { iTrafficRow, iTrafficSort, iTrafficView } from './iTraffic';


/**
	Seconds as a short human duration.

	Rounds to minutes above an hour and to whole minutes above one, because a
	report of "how long did they spend here" is never accurate to the second --
	active_seconds is a sum of client-reported intervals (see app_pageviews.ts).
*/
export function format_duration( seconds: number ): string {
	if( !isFinite(seconds) || seconds <= 0 ) return '0m';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds - hours * 3600) / 60);

	// Rounding can carry the minutes to 60; roll it into the hour rather than
	// printing "2h 60m".
	if( minutes === 60 ) return (hours + 1) + 'h 0m';
	if( hours > 0 ) return hours + 'h ' + minutes + 'm';
	if( seconds < 60 ) return seconds + 's';

	return minutes + 'm';
}


// Average engaged time per visit. Zero visits gives zero rather than NaN.
export function average_seconds( total: number, views: number ): number {
	if( !views ) return 0;
	return Math.round(total / views);
}


// The UTC string the server sends ('2026-08-21T14:03:00Z') in the reader's own
// timezone. Empty for a row with no visits in range.
export function format_datetime( value: string | null ): string {
	if( !value ) return '';
	const d = new Date(value);
	if( isNaN(d.getTime()) ) return '';
	return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}


/**
	What each view calls its columns.

	The by-user view is the same query grouped the other way, so the only real
	differences are the first column's name and what the breadth column counts.
*/
export const VIEW_LABELS: { [key in iTrafficView]: { label: string, breadth: string, detail: string } } = {
	pages: { label: 'Page', breadth: 'Users', detail: 'User' },
	users: { label: 'User', breadth: 'Pages', detail: 'Page' },
};


/**
	Sort rows client-side.

	The server returns a capped, already-ordered set, so re-sorting here costs
	nothing and saves a round trip. The label sorts ascending (a path or a
	username reads as a name); every number sorts descending, since "which one
	got the most" is the question being asked.
*/
export function sort_rows( rows: iTrafficRow[], sort: iTrafficSort ): iTrafficRow[] {
	const sorted = [...rows];

	if( sort === 'label' ) {
		sorted.sort( (a, b) => a.key.localeCompare(b.key) );
		return sorted;
	}

	if( sort === 'average' ) {
		sorted.sort( (a, b) =>
			average_seconds(b.active_seconds, b.views) - average_seconds(a.active_seconds, a.views) );
		return sorted;
	}

	if( sort === 'last_datetime' ) {
		sorted.sort( (a, b) => String(b.last_datetime).localeCompare(String(a.last_datetime)) );
		return sorted;
	}

	// breadth is null in a drill-down; treat it as zero rather than letting the
	// subtraction produce NaN and leave the order undefined.
	if( sort === 'breadth' ) {
		sorted.sort( (a, b) => (b.breadth ?? 0) - (a.breadth ?? 0) );
		return sorted;
	}

	sorted.sort( (a, b) => (b as any)[sort] - (a as any)[sort] );
	return sorted;
}


interface AdminTrafficTablePropsType {
	view: iTrafficView;
	rows: iTrafficRow[];
	sort: iTrafficSort;
	onSort: (sort: iTrafficSort) => void;
	expanded: string | null;
	detail: iTrafficRow[];
	detailLoading: boolean;
	onExpand: (key: string) => void;
}


const NUMBER_CELL = { textAlign: 'right' as const, whiteSpace: 'nowrap' as const };


// A sortable column heading. Marks the active column with an arrow so the
// table says what it is sorted by without a legend.
function SortHeader( props: {
			label: string, sort: iTrafficSort, active: iTrafficSort,
			onSort: (s: iTrafficSort) => void, align?: string } ): ReactElement {

	const is_active = props.active === props.sort;

	return (
		<th style={{ textAlign: props.align ?? 'left', cursor: 'pointer', whiteSpace: 'nowrap' }}
			onClick={ () => props.onSort(props.sort) }>
			{ props.label }{ is_active ? ' ▾' : '' }
		</th>
	);
}


/**
	One row per page or per user, with the opposite breakdown under whichever
	row is open.

	Totals are the summed columns rather than a separate query, so the footer
	can never disagree with the rows above it. The breadth column is deliberately
	absent from the footer: summing per-row distinct counts would double-count
	anyone who visited two pages.
*/
export default function AdminTrafficTable( props: AdminTrafficTablePropsType ): ReactElement {

	const labels = VIEW_LABELS[props.view];

	if( props.rows.length === 0 ) {
		return <p className='mb-0'>No traffic recorded for this filter.</p>;
	}

	const total_views = props.rows.reduce( (sum, r) => sum + r.views, 0 );
	const total_active = props.rows.reduce( (sum, r) => sum + r.active_seconds, 0 );
	const total_open = props.rows.reduce( (sum, r) => sum + r.open_seconds, 0 );

	const rows: ReactElement[] = [];

	sort_rows(props.rows, props.sort).forEach( row => {
		const is_open = props.expanded === row.key;

		rows.push(
			<tr key={ row.key } onClick={ () => props.onExpand(row.key) }
					style={{ cursor: 'pointer' }}>
				<td style={{ wordBreak: 'break-all' }}>
					<span className='text-muted'>{ is_open ? '▾ ' : '▸ ' }</span>
					{ row.key }
				</td>
				<td style={ NUMBER_CELL }>{ row.views }</td>
				<td style={ NUMBER_CELL }>{ row.breadth }</td>
				<td style={ NUMBER_CELL }>{ format_duration(row.active_seconds) }</td>
				<td style={ NUMBER_CELL }>{ format_duration(average_seconds(row.active_seconds, row.views)) }</td>
				<td style={ NUMBER_CELL }>{ format_duration(row.open_seconds) }</td>
				<td style={{ whiteSpace: 'nowrap' }}>{ format_datetime(row.last_datetime) }</td>
			</tr>
		);

		if( !is_open ) return;

		rows.push(
			<tr key={ row.key + '_detail' }>
				<td colSpan={7} style={{ background: '#f7f7f7' }}>
					{ props.detailLoading
						? <span className='text-muted'>Loading&hellip;</span>
						: <Breakdown rows={ props.detail } label={ labels.detail } /> }
				</td>
			</tr>
		);
	});

	return (
		<Table bordered hover size='sm' style={{ fontSize: '90%' }}>
			<thead className='thead-dark'>
				<tr>
					<SortHeader label={ labels.label } sort='label' active={props.sort} onSort={props.onSort} />
					<SortHeader label='Visits' sort='views' active={props.sort} onSort={props.onSort} align='right' />
					<SortHeader label={ labels.breadth } sort='breadth' active={props.sort} onSort={props.onSort} align='right' />
					<SortHeader label='Active time' sort='active_seconds' active={props.sort} onSort={props.onSort} align='right' />
					<SortHeader label='Avg / visit' sort='average' active={props.sort} onSort={props.onSort} align='right' />
					<SortHeader label='Open time' sort='open_seconds' active={props.sort} onSort={props.onSort} align='right' />
					<SortHeader label='Last visit' sort='last_datetime' active={props.sort} onSort={props.onSort} />
				</tr>
			</thead>
			<tbody>{ rows }</tbody>
			<tfoot>
				<tr style={{ fontWeight: 'bold' }}>
					<td>{ props.rows.length } { props.view === 'pages' ? 'pages' : 'users' }</td>
					<td style={ NUMBER_CELL }>{ total_views }</td>
					<td style={ NUMBER_CELL }></td>
					<td style={ NUMBER_CELL }>{ format_duration(total_active) }</td>
					<td style={ NUMBER_CELL }></td>
					<td style={ NUMBER_CELL }>{ format_duration(total_open) }</td>
					<td></td>
				</tr>
			</tfoot>
		</Table>
	);
}


// The breakdown shown under an expanded row: the other view, scoped to it.
function Breakdown( props: { rows: iTrafficRow[], label: string } ): ReactElement {
	if( props.rows.length === 0 ) {
		return <span className='text-muted'>No visits for this filter.</span>;
	}

	return (
		<Table size='sm' borderless className='mb-0' style={{ background: 'transparent' }}>
			<thead>
				<tr style={{ fontSize: '85%' }}>
					<th>{ props.label }</th>
					<th style={ NUMBER_CELL }>Visits</th>
					<th style={ NUMBER_CELL }>Active time</th>
					<th style={ NUMBER_CELL }>Avg / visit</th>
					<th style={ NUMBER_CELL }>Open time</th>
					<th>Last visit</th>
				</tr>
			</thead>
			<tbody>
				{ props.rows.map( row => (
					<tr key={ row.key }>
						<td style={{ wordBreak: 'break-all' }}>{ row.key }</td>
						<td style={ NUMBER_CELL }>{ row.views }</td>
						<td style={ NUMBER_CELL }>{ format_duration(row.active_seconds) }</td>
						<td style={ NUMBER_CELL }>{ format_duration(average_seconds(row.active_seconds, row.views)) }</td>
						<td style={ NUMBER_CELL }>{ format_duration(row.open_seconds) }</td>
						<td style={{ whiteSpace: 'nowrap' }}>{ format_datetime(row.last_datetime) }</td>
					</tr>
				)) }
			</tbody>
		</Table>
	);
}
