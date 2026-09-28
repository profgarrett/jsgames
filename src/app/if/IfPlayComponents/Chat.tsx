import React from 'react';
import { Button, FormControl, Card, Accordion, Row, Col } from 'react-bootstrap';

import { IfPageChatSchema } from '../../../shared/IfPageSchemas';
import type { ChatTabView } from '../../../shared/IfPageSchemas';
import { HtmlDiv } from '../../components/Misc';
import type { IStringIndexJsonObject } from '../../components/Misc';

interface PropsType {
	page: IfPageChatSchema;
	level_id: string;
	editable: boolean;
	readonly: boolean;
	// Updates local, client-only fields (currently just client_ready_to_advance) the same way
	// every other page type does, so the "Next page" button's gating logic sees the change.
	onChange: (json: IStringIndexJsonObject) => void;
	// Called with the full, fresh level JSON returned by the server after a chat exchange, so
	// that the authoritative (server-saved) transcript replaces local state. Chat messages are
	// intentionally *not* routed through onChange -- see IfPageChatSchema.updateUserFields.
	onChatUpdate: (level_json: any) => void;
}

interface StateType {
	draft: string;
	isSending: boolean;
	error: string;
}

const INPUT_ID = 'ChatMessageInput';

/**
	Renders an embedded AI chat conversation: the transcript so far, a text box + Send button
	for the student's next message, and (once at least one exchange has happened) a button to
	mark the student ready to move on.

	If the page has info tabs (page.tabs), they're shown as an accordion to the left of the
	chat, with only one open at a time. Each expand/collapse is recorded in
	page.client_tab_views (sent through onChange, and also along with each chat message).
*/
export default class Chat extends React.Component<PropsType, StateType> {

	constructor(props: PropsType) {
		super(props);
		this.state = { draft: '', isSending: false, error: '' };
	}

	handleSend = (): void => {
		const text = this.state.draft.trim();
		if(text === '' || this.state.isSending || this.props.readonly) return;

		this.setState({ isSending: true, error: '' });

		fetch('/api/levels/level/' + this.props.level_id + '/chat', {
			method: 'post',
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text, client_tab_views: this.props.page.client_tab_views || [] })
		})
			.then( (response: any) => response.json() )
			.then( (json: any) => {
				if(json._error) throw new Error(json._error);

				this.setState({ draft: '', isSending: false });
				this.props.onChatUpdate(json);
			})
			.catch( (err: any) => {
				this.setState({ isSending: false, error: err.message || 'Something went wrong sending that message.' });
			});
	}

	handleKeyDown = (e: React.KeyboardEvent): void => {
		if(e.key === 'Enter' && !e.shiftKey) {
			// Prevent this Enter from bubbling up to the level's <form onSubmit=...>, which
			// would otherwise try to advance to the next page.
			e.preventDefault();
			e.stopPropagation();
			this.handleSend();
		}
	}

	handleReady = (): void => {
		// Also close any open info tab, so its duration ends when the participant finishes.
		this.props.onChange({ client_ready_to_advance: true, client_tab_views: this.close_open_views(new Date()) });
	}

	// Copy of the current tab views, with any still-open view closed at `now`.
	close_open_views = (now: Date): Array<ChatTabView> => {
		return (this.props.page.client_tab_views || []).map( (v: ChatTabView) => {
			if(v.dt_closed !== null && typeof v.dt_closed !== 'undefined') return v;
			const seconds = Math.max(0, Math.round((now.getTime() - new Date(v.dt_opened).getTime()) / 100) / 10);
			return { ...v, dt_closed: now, seconds };
		});
	}

	// Index of the currently open tab, or null. The open tab is the last view without a close time.
	open_tab_i = (): number|null => {
		const views = this.props.page.client_tab_views || [];
		const last = views[views.length - 1];
		return last && (last.dt_closed === null || typeof last.dt_closed === 'undefined') ? last.tab_i : null;
	}

	// Accordion click: close whatever was open, then (unless this click collapsed it) open the new tab.
	handleTabSelect = (eventKey: any): void => {
		if(this.props.readonly) return;

		const now = new Date();
		const was_open = this.open_tab_i();
		const views = this.close_open_views(now);
		const tab_i = (eventKey === null || typeof eventKey === 'undefined') ? null : Number(eventKey);

		if(tab_i !== null && tab_i !== was_open && tab_i >= 0 && tab_i < this.props.page.tabs.length) {
			views.push({ tab_i, title: this.props.page.tabs[tab_i].title, dt_opened: now, dt_closed: null, seconds: null });
		}

		this.props.onChange({ client_tab_views: views });
	}

	render(): React.ReactElement {
		const page = this.props.page;
		const messages = page.client_messages || [];
		const turns_used = messages.filter( m => m.role === 'user').length;
		const turns_left = Math.max(0, page.max_turns - turns_used);
		const can_advance = turns_used > 0;
		const at_limit = turns_left <= 0;

		const chat_card = (
			<Card style={{ marginTop: '1rem' }}>
				<Card.Body>
					<div
						style={{
							maxHeight: '320px',
							overflowY: 'auto',
							border: '1px solid #dee2e6',
							borderRadius: '4px',
							padding: '10px',
							marginBottom: '10px',
							background: '#f8f9fa'
						}}
					>
						{ messages.length === 0
							? <div style={{ color: '#6c757d' }}>No messages yet. Say hello to get started.</div>
							: messages.map( (m, i) => (
								<div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left', marginBottom: '8px' }}>
									<span
										style={{
											display: 'inline-block',
											padding: '6px 12px',
											borderRadius: '14px',
											maxWidth: '80%',
											background: m.role === 'user' ? '#0d6efd' : '#e9ecef',
											color: m.role === 'user' ? 'white' : 'black'
										}}
									>
										{ m.text }
									</span>
								</div>
							))
						}
					</div>

					{ this.state.error !== '' && <div style={{ color: '#dc3545', marginBottom: '8px' }}>{ this.state.error }</div> }

					<div style={{ display: 'flex', gap: '8px' }}>
						<FormControl
							id={INPUT_ID}
							as='textarea'
							rows={2}
							autoComplete='off'
							value={ this.state.draft }
							disabled={ this.props.readonly || this.state.isSending || at_limit }
							placeholder={ at_limit ? 'You have reached the message limit for this chat.' : 'Type a message...' }
							onChange={ (e: any) => this.setState({ draft: e.target.value }) }
							onKeyDown={ this.handleKeyDown }
						/>
						<Button
							variant='primary'
							disabled={ this.props.readonly || this.state.isSending || at_limit || this.state.draft.trim() === '' }
							onClick={ (e) => { e.preventDefault(); this.handleSend(); } }
						>
							{ this.state.isSending ? 'Sending...' : 'Send' }
						</Button>
					</div>

					<div style={{ marginTop: '8px', color: '#6c757d', fontSize: '0.9em' }}>
						{ turns_left } of { page.max_turns } messages remaining.
					</div>

					<div style={{ marginTop: '10px' }}>
						<Button
							variant={ page.client_ready_to_advance ? 'success' : 'secondary' }
							disabled={ this.props.readonly || !can_advance || page.client_ready_to_advance }
							onClick={ (e) => { e.preventDefault(); this.handleReady(); } }
						>
							{ page.client_ready_to_advance ? "Ready -- click Next page below" : "I'm ready to continue" }
						</Button>
					</div>
				</Card.Body>
			</Card>
		);

		const tabs = page.tabs || [];
		if(tabs.length === 0) return chat_card;

		const open_i = this.open_tab_i();

		return (
			<Row>
				<Col md={5} style={{ marginTop: '1rem' }}>
					<Accordion
						activeKey={ open_i === null ? null : String(open_i) }
						onSelect={ this.handleTabSelect }
					>
						{ tabs.map( (t, i) => (
							<Accordion.Item eventKey={ String(i) } key={ i }>
								<Accordion.Header>{ t.title }</Accordion.Header>
								<Accordion.Body><HtmlDiv html={ t.body } /></Accordion.Body>
							</Accordion.Item>
						))}
					</Accordion>
				</Col>
				<Col md={7}>
					{ chat_card }
				</Col>
			</Row>
		);
	}
}
