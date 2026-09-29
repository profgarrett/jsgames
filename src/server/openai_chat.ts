/*
	OpenAI settings and helpers for the chat page route (app_levels.ts POST /level/:id/chat).

	Uses the Responses API, which OpenAI recommends for reasoning models such as gpt-6.1-sol.
	The model and reasoning effort apply to every chat page (taxstudy, testprolificstudy, ...).
*/

export const CHAT_MODEL = 'gpt-6.1-sol';
export const CHAT_REASONING_EFFORT = 'low';

export type ChatTurn = { role: string, text: string };

// Request body for POST https://api.openai.com/v1/responses.
export function build_chat_request(system_prompt: string, messages: Array<ChatTurn>, max_output_tokens: number): any {
	return {
		model: CHAT_MODEL,
		instructions: system_prompt || 'You are a helpful assistant.',
		input: messages.map( m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }) ),
		reasoning: { effort: CHAT_REASONING_EFFORT },
		// Counts reasoning tokens as well as the visible reply. If the model runs out while
		// still reasoning, the reply comes back empty, so leave generous headroom.
		max_output_tokens: max_output_tokens,
		// Don't keep a copy of the conversation on OpenAI's side (it's saved in our DB).
		store: false,
	};
}

// The visible reply text in a Responses API result, or '' if there is none.
export function get_response_text(json: any): string {
	if(!json || !Array.isArray(json.output)) return '';
	return json.output
		.filter( (o: any) => o && o.type === 'message' && Array.isArray(o.content) )
		.flatMap( (o: any) => o.content )
		.filter( (c: any) => c && c.type === 'output_text' && typeof c.text === 'string' )
		.map( (c: any) => c.text )
		.join('')
		.trim();
}
