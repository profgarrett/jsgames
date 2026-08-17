import React, { ReactElement, ReactNode, isValidElement, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import r from 'react-syntax-highlighter/dist/esm/languages/prism/r';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';

import './PageCodeBlock.css';

/*
	Syntax highlighting for fenced code blocks in page markdown.

	Only the languages used in the readings are registered, since the full
	react-syntax-highlighter build pulls in ~200 grammars and refractor's
	entire language set. Adding a language means adding two lines here.

	Aliases are registered against the same grammar so that an author can
	write ```sh or ```py without the block silently falling back to plain
	text.
*/
const LANGUAGES: Record<string, unknown> = {
	bash,
	javascript,
	json,
	python,
	r,
	sql,
};

const ALIASES: Record<string, string> = {
	js: 'javascript',
	jsonc: 'json',
	console: 'bash',
	py: 'python',
	sh: 'bash',
	shell: 'bash',
	postgres: 'sql',
	mysql: 'sql',
};

Object.entries(LANGUAGES).forEach(([name, grammar]) => {
	SyntaxHighlighter.registerLanguage(name, grammar);
});

Object.entries(ALIASES).forEach(([alias, target]) => {
	SyntaxHighlighter.registerLanguage(alias, LANGUAGES[target]);
});

const isSupportedLanguage = (language: string): boolean =>
	Object.prototype.hasOwnProperty.call(LANGUAGES, language) ||
	Object.prototype.hasOwnProperty.call(ALIASES, language);

/*
	Pull the plain text out of the <code> element react-markdown hands us.

	The child is normally a single string, but rehype can split it when the
	fence contains characters that get their own text nodes, so walk the tree
	rather than assuming String(children) is enough.
*/
const getCodeText = (node: ReactNode): string => {
	if (typeof node === 'string' || typeof node === 'number') return String(node);
	if (Array.isArray(node)) return node.map(getCodeText).join('');
	if (isValidElement(node)) {
		return getCodeText((node.props as { children?: ReactNode }).children);
	}
	return '';
};

/*
	rehype-sanitize only keeps classNames on <code> that match /^language-./,
	so this is the one attribute an author can influence from markdown.
*/
const getLanguage = (className?: string): string => {
	const match = /language-([\w-]+)/.exec(className || '');
	return match ? match[1].toLowerCase() : '';
};

interface ICodeElementProps {
	className?: string;
	children?: ReactNode;
}

const CopyButton = ({ code }: { code: string }): ReactElement => {
	const [copied, setCopied] = useState(false);

	const onCopy = (): void => {
		// navigator.clipboard is undefined on http:// origins other than
		// localhost, so failure here is expected in some dev setups.
		if (!navigator.clipboard) return;

		navigator.clipboard.writeText(code).then(
			() => {
				setCopied(true);
				window.setTimeout(() => setCopied(false), 1500);
			},
			() => setCopied(false),
		);
	};

	return (
		<button type='button' className='markdown-code-copy' onClick={onCopy}>
			{copied ? 'Copied' : 'Copy'}
		</button>
	);
};

/*
	Markdown component for a fenced code block.

	Registered as the `pre` renderer rather than `code`: react-markdown v9
	dropped the `inline` prop, and going through `pre` is the remaining
	reliable way to tell a fenced block from inline `code`, since inline code
	is never wrapped in a <pre>.
*/
export const CustomPre: React.FC<{ children?: ReactNode; node?: unknown }> = ({ children }) => {
	const child = React.Children.toArray(children)[0];
	const props: ICodeElementProps = isValidElement(child) ? (child.props as ICodeElementProps) : {};

	const language = getLanguage(props.className);
	// Fences trail a newline that Prism would render as a blank final row.
	const code = getCodeText(props.children).replace(/\n$/, '');

	return (
		<div className='markdown-code' data-language={language || undefined}>
			<div className='markdown-code-header'>
				<span className='markdown-code-language'>{language || 'text'}</span>
				<CopyButton code={code} />
			</div>
			<SyntaxHighlighter
				// An unregistered name makes react-syntax-highlighter log a
				// warning on every render, so pass nothing instead.
				language={isSupportedLanguage(language) ? language : undefined}
				style={oneLight}
				PreTag='div'
				className='markdown-code-body'
			>
				{code}
			</SyntaxHighlighter>
		</div>
	);
};

/*
	Markdown component for inline `code`.

	Fenced blocks reach CustomPre above and render their own <code>, so this
	only needs to style the inline case.
*/
export const CustomCode: React.FC<ICodeElementProps & { node?: unknown }> = ({
	className,
	children,
	// react-markdown passes the hast node to every custom component; it must
	// not be spread onto the DOM element. Same pattern as PageView.tsx.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	node: _node,
	...props
}) => (
	<code className={['markdown-inline-code', className].filter(Boolean).join(' ')} {...props}>
		{children}
	</code>
);

export default CustomPre;
