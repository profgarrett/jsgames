import React from 'react';
import { Table, Badge } from 'react-bootstrap';

import { HtmlDiv } from '../../components/Misc';
import type { IfPageChatSchema, ChatTabView } from '../../../shared/IfPageSchemas';

/*
	Read-only log of one attempt at a chat page (IfPageChatSchema), for the score, debug and
	preview views. Merges the page's start/completion, every chat message, every fact-tab
	open, and changes to the embedded question's answer into one list in time order.

	Participant and AI text is rendered as plain React text (escaped), never as HTML.
*/

export type ChatLogRow = {
	dt: Date|null,
	kind: 'start' | 'user' | 'assistant' | 'tab' | 'answer' | 'end',
	label: string,
	text: string,
};

const to_date = (d: any): Date|null => {
	if(d === null || typeof d === 'undefined') return null;
	const x = d instanceof Date ? d : new Date(d);
	return isNaN(x.getTime()) ? null : x;
};

export function build_chat_log(page: IfPageChatSchema): Array<ChatLogRow> {
	const rows: Array<ChatLogRow> = [];
	const history: Array<any> = page.history || [];

	const start = history.find( h => h && h.code === 'server_create' ) || history.find( h => h && h.code === 'server_initialized' );
	if(start) rows.push({ dt: to_date(start.dt), kind: 'start', label: 'Page shown', text: '' });

	(page.client_messages || []).forEach( m => {
		const is_ai = m.role === 'assistant';
		rows.push({ dt: to_date(m.dt), kind: is_ai ? 'assistant' : 'user', label: is_ai ? 'AI' : 'Participant', text: ''+m.text });
	});

	(page.client_tab_views || []).forEach( (v: ChatTabView) => {
		const seconds = v.seconds === null || typeof v.seconds === 'undefined' ? 'still open' : v.seconds + 's';
		rows.push({ dt: to_date(v.dt_opened), kind: 'tab', label: 'Tab opened', text: v.title + ' (' + seconds + ')' });
	});

	// Changes to the embedded question's answer (recorded by the browser on each edit, and by
	// the server when the answer is sent along with a chat message).
	history
		.filter( h => h && Object.prototype.hasOwnProperty.call(h, 'client_answer') )
		.forEach( h => rows.push({
			dt: to_date(h.dt), kind: 'answer', label: 'Answer',
			text: h.client_answer === null || typeof h.client_answer === 'undefined' ? '(cleared)' : ''+h.client_answer,
		}));

	const end = history.find( h => h && h.code === 'server_page_completed' );
	if(end) rows.push({ dt: to_date(end.dt), kind: 'end', label: 'Page completed', text: '' });

	// Time order; rows without a time go last, and ties keep their original order.
	const sorted = rows
		.map( (r, i) => ({ r, i }) )
		.sort( (a, b) => {
			const ta = a.r.dt ? a.r.dt.getTime() : Number.MAX_SAFE_INTEGER;
			const tb = b.r.dt ? b.r.dt.getTime() : Number.MAX_SAFE_INTEGER;
			return ta !== tb ? ta - tb : a.i - b.i;
		})
		.map( x => x.r );

	// The browser records every keystroke; keep only the last of each run of answer edits.
	return sorted.filter( (r, i) => !(r.kind === 'answer' && sorted[i+1] && sorted[i+1].kind === 'answer') );
}

const pad2 = (n: number): string => (n < 10 ? '0' : '') + n;
const clock = (d: Date|null): string => d === null ? '' : pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
const elapsed = (d: Date|null, from: Date|null): string => {
	if(d === null || from === null) return '';
	const s = Math.max(0, Math.round((d.getTime() - from.getTime()) / 1000));
	return '+' + Math.floor(s / 60) + ':' + pad2(s % 60);
};

const ROW_COLORS: { [kind: string]: string } = {
	start: '#6c757d',
	end: '#6c757d',
	user: '#0d6efd',
	assistant: '#212529',
	tab: '#6f42c1',
	answer: '#198754',
};

interface PropsType {
	page: IfPageChatSchema;
}

export default function ChatLog(props: PropsType): React.ReactElement {
	const page = props.page;
	const rows = build_chat_log(page);
	const first = rows.find( r => r.dt !== null );
	const t0 = first ? first.dt : null;

	const is_static = typeof page.static_html === 'string' && page.static_html.trim() !== '';
	const messages_sent = (page.client_messages || []).filter( m => m.role === 'user' ).length;
	const tab_views = page.client_tab_views || [];
	const tab_seconds = Math.round(tab_views.reduce( (sum, v) => sum + (typeof v.seconds === 'number' ? v.seconds : 0), 0 ) * 10) / 10;
	const conditions = (page.tags || []).filter( (t: any) => typeof t === 'string' && t.indexOf('condition_') === 0 );
	const tabs = page.tabs || [];
	const has_question = typeof page.question === 'string' && page.question.trim() !== '';

	return (
		<div>
			<div style={{ marginBottom: '8px' }}>
				<b>{ is_static ? 'Static advisor (no chat)' : 'AI chat' }</b>
				{ !is_static && <span> · { messages_sent } of { page.max_turns } messages sent</span> }
				<span> · { tab_views.length } tab opens ({ tab_seconds }s)</span>
				{ has_question
					? <span> · answer: <b>{ page.client_answer === null || typeof page.client_answer === 'undefined' ? '(none)' : page.client_answer }</b></span>
					: <span> · { page.client_ready_to_advance ? 'marked ready' : 'not marked ready' }</span>
				}
				{ conditions.map( c => <Badge key={c} bg='secondary' style={{ marginLeft: '6px' }}>{ c }</Badge> ) }
			</div>

			{ tabs.length > 0 &&
				<div style={{ marginBottom: '8px', fontSize: '0.9em', color: '#6c757d' }}>
					Tabs available: { tabs.map( t => t.title ).join(', ') }
				</div>
			}

			{ has_question &&
				<div style={{ marginBottom: '8px', fontSize: '0.9em' }}>
					Question{ page.question_id ? ' (' + page.question_id + ')' : '' }: <HtmlDiv html={ page.question } />
				</div>
			}

			{ is_static &&
				<details style={{ marginBottom: '8px' }}>
					<summary>Advisor content shown</summary>
					<HtmlDiv html={ page.static_html } />
				</details>
			}

			{ rows.filter( r => r.kind !== 'start' && r.kind !== 'end' ).length === 0
				? <div style={{ color: '#6c757d' }}>No messages or tab opens recorded.</div>
				: null
			}

			<Table size='sm' bordered style={{ fontSize: '0.9em' }}>
				<thead>
					<tr><th>Time</th><th>Elapsed</th><th>Event</th><th>Detail</th></tr>
				</thead>
				<tbody>
					{ rows.map( (r, i) => (
						<tr key={i}>
							<td style={{ whiteSpace: 'nowrap' }}>{ clock(r.dt) }</td>
							<td style={{ whiteSpace: 'nowrap' }}>{ elapsed(r.dt, t0) }</td>
							<td style={{ whiteSpace: 'nowrap', color: ROW_COLORS[r.kind] }}>{ r.label }</td>
							<td style={{ whiteSpace: 'pre-wrap' }}>{ r.text }</td>
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}
