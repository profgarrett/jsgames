import React, { ReactElement, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

import iPage from './iPage';

interface IPageViewProps {
	page: iPage | null;
}

function PageView({ page }: IPageViewProps): ReactElement {
	if (page === null) return <></>;

	return (
		<div className='markdown-page'>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeSanitize]}
			>
				{ page.markdown }
			</ReactMarkdown>
		</div>
	);
}

export default PageView;