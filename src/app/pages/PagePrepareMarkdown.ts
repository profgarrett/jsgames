/*
	Shared helpers for turning a page's raw markdown into markdown safe to
	render: relative image and asset links are rewritten into absolute paths
	resolved against the page's own directory under static/pages.

	Originally lived only in PageView.tsx, for the single page currently being
	read. PagePractice.tsx needs the same resolution when it pulls markdown in
	from *other* pages for a multi-module practice session -- each page's
	assets must resolve against that page's own directory, not whichever page
	the student started from -- so the logic lives here and both import it.
*/

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

/*
	File types that live next to the markdown in static/pages rather than being
	pages in their own right: notebook templates, datafiles, Word exercises, and
	so on. Add to this list when a reading starts linking a new kind of file.

	Images and video are listed too, so that a plain link to one (rather than an
	embed) resolves as well.
*/
export const ASSET_EXTENSIONS = /\.(ipynb|csv|tsv|xlsx?|xlsm|docx?|pptx?|potx|pdf|zip|txt|json|sql|py|r|html?|png|jpe?g|gif|svg|webp|mp4|webm|ogv)$/i;

/*
	Search markdown for links to local files and rewrite them the same way
	images are rewritten.

	Without this, `[template](template.ipynb)` renders as <a href='template.ipynb'>,
	which the browser resolves against the *page route* (/pages/course_model/...)
	rather than against /static/pages. That URL then reaches app_pages.ts, whose
	SLUG_RE rejects any slug containing a '.', so every notebook, datafile and
	Word exercise on the site 404s.

	Example: [template](template.ipynb)
	Output:  [template](/static/pages/course_model/ml01-modeling-gems/template.ipynb)

	Markdown links are deliberately left alone: '.md' is stripped by
	normalize_slug on the server, so page-to-page links already resolve, and
	keeping them relative lets the SPA router handle them.
*/
export const convert_asset_links_by_adding_folder_path = (markdown: string, slug: string): string => {
	// The leading (!?) captures the image marker so that images -- already
	// handled above -- can be passed through untouched. Matching them here
	// rather than excluding them with a lookbehind also keeps back-to-back
	// links, `[a](x.csv)[b](y.csv)`, from swallowing each other.
	return markdown.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g, (match, imageMarker, text, href) => {
		if (imageMarker) return match;
		if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) return match;
		if (!ASSET_EXTENSIONS.test(href)) return match;

		return `[${text}](${getPageAssetPath(slug, href)})`;
	});
};

/*
	Apply both rewrites above, in the order PageView.tsx always applied them.
	The one entry point PagePractice.tsx (and PageView.tsx) should use to turn
	a page's raw markdown into markdown safe to feed to ReactMarkdown, the
	quiz, or the flashcard deck.
*/
export const prepareMarkdownForSlug = (markdown: string, slug: string): string =>
	convert_asset_links_by_adding_folder_path(convert_images_by_adding_folder_path(markdown, slug), slug);
