import React, { ReactElement, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'


import iPage from './iPage';

interface IPageViewProps {
	page: iPage | null;
}


export const getPageAssetPath = (slug: string, imagePath: string): string => {
	if (!imagePath) return imagePath;
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
		return imagePath;
	}
	if (imagePath.startsWith('/')) {
		return imagePath;
	}

	const normalizedSlug = slug.replace(/\.md$/, '');
	const slugParts = normalizedSlug.split('/').filter(Boolean);
	const pageDirectoryParts = normalizedSlug.endsWith('/index')
		? slugParts.slice(0, -1)
		: slugParts.slice(0, -1);
	const assetBase = pageDirectoryParts.length > 0 ? `/static/pages/${pageDirectoryParts.join('/')}` : '/static/pages';

	try {
		return new URL(imagePath, `http://example.com${assetBase}/`).pathname;
	} catch {
		return `${assetBase}/${imagePath}`;
	}
};

/*
	Search markdown for any inline images.
	Example: ![Table example with highlight](table_25_years_oftv.webp)

	Convert into an absolute path for local images, so that they can be loaded correctly in the browser.
	Output: ![Table example with highlight](/static/pages/table_25_years_oftv.webp)
*/
const convert_images_by_adding_folder_path = (markdown: string, slug: string): string => {
	return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
		if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
			return match;
		}
		const resolvedPath = getPageAssetPath(slug, imagePath);
		return `![${altText}](${resolvedPath})`;
	});
};

function PageView({ page }: IPageViewProps): ReactElement {
	if (page === null) return <></>;

	const markdown_content = convert_images_by_adding_folder_path(page.markdown, page.slug);

	return (
		<div className='markdown-page'>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeSanitize]}
				
			>
				{ markdown_content }
			</ReactMarkdown>
		</div>
	);
}

export default PageView;