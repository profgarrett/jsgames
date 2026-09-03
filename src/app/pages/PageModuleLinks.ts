/*
	Helpers for the multi-module practice flow (see PagePractice.tsx).

	A page's quiz/flashcard content used to come from that single page's
	markdown only. To let a student practice across a whole unit -- e.g. every
	Excel lesson in course_ais, not just the one they happen to be reading --
	we need to find the other pages that belong with the current one.

	The convention used across the course content is a "hub" page (an
	index.md at the top of a course, such as course_ais/index or
	course_dv/index) that links out to every lesson underneath it, often
	grouped under week-by-week headings.

	Multi-module selection is only offered when a student is looking at a hub
	page directly (IModuleScope.isHub) -- e.g. course_dv/index, which links to
	every course_dv lesson. An ordinary lesson page below the hub (dv20-data,
	excel01-input-formats, or something nested even deeper) only ever
	practices itself: a course like course_dv covers several distinct tools
	(Data Viz, Tableau, PowerBI, SQL, Python), so scoping a single lesson's
	practice session to "everything linked from the hub above it" pulled in
	unrelated material -- see PagePractice.tsx.
*/

import { getParentPageSlugs } from './PageViewContainer';
import { ASSET_EXTENSIONS } from './PagePrepareMarkdown';

export interface IModuleLink {
	slug: string;
	// The link's markdown text, e.g. "excel01" or "Okta" -- shown as-is on the
	// module-selection screen rather than fetching each page just to read its
	// title, so that screen appears without waiting on a round trip per link.
	title: string;
}

export interface IModuleScope {
	// The hub page whose links define the set of candidate modules -- either
	// the topmost ancestor index page of the current page, or the current
	// page itself when it has no ancestor (it may already be the hub, or it
	// may be a standalone page with nothing to scope against).
	rootSlug: string;
	// Directory prefix a linked page's slug must fall under to count as
	// "under its path". Empty when there is no meaningful scope to search
	// (e.g. a standalone top-level page).
	pathPrefix: string;
	// True when the page this scope was computed for *is* the hub itself
	// (rootSlug === that page's slug, and there is a real path to scope to).
	// Multi-module selection is only offered when this is true -- see
	// PagePractice.tsx.
	isHub: boolean;
}

/*
	Resolve the scope used to look for sibling modules of `currentSlug`.
	Exported for unit testing.
*/
export const getModuleScope = (currentSlug: string): IModuleScope => {
	const parentSlugs = getParentPageSlugs(currentSlug);
	const rootSlug = parentSlugs.length > 0 ? parentSlugs[0] : currentSlug;

	const rootParts = rootSlug.split('/').filter(Boolean);
	const pathPrefix = rootParts.slice(0, -1).join('/');
	const isHub = rootSlug === currentSlug && pathPrefix !== '';

	return { rootSlug, pathPrefix, isHub };
};

/*
	Resolve a markdown link's href, written on `sourceSlug`, into the page
	slug it points at -- or null if it is not a link to another page on this
	site (an external site, an in-page anchor, or a link to a non-page asset
	such as a datafile or image).

	Relative hrefs (the normal case, e.g. `excel01-input-formats/index`) are
	resolved the same way a browser resolves a relative <a href> against the
	current page's route: relative to the source page's directory. Absolute
	`/pages/...` links (used occasionally to link across courses, e.g. the
	Okta setup page) are also supported. Exported for unit testing.
*/
export const resolvePageLinkSlug = (sourceSlug: string, href: string): string | null => {
	if (!href) return null;
	// External protocol (http:, mailto:, etc.) or an in-page anchor.
	if (/^([a-z][a-z0-9+.-]*:|#)/i.test(href)) return null;

	const withoutHash = href.split(/[?#]/)[0];
	if (ASSET_EXTENSIONS.test(withoutHash)) return null;

	let resolvedPath: string;

	if (href.startsWith('/pages/')) {
		resolvedPath = href.slice('/pages/'.length);
	} else if (href.startsWith('/')) {
		// Some other absolute route (e.g. /static/pages/...) -- not a page slug.
		return null;
	} else {
		const normalizedSlug = sourceSlug.replace(/\.md$/, '');
		const slugParts = normalizedSlug.split('/').filter(Boolean);
		const dirParts = slugParts.slice(0, -1);
		const base = dirParts.length > 0 ? `${dirParts.join('/')}/` : '';

		try {
			resolvedPath = new URL(href, `http://example.com/${base}`).pathname.replace(/^\//, '');
		} catch {
			return null;
		}
	}

	resolvedPath = resolvedPath.split(/[?#]/)[0].replace(/\.md$/, '').replace(/\/+$/, '');
	return resolvedPath || null;
};

/*
	Find every page `rootSlug`'s markdown links to that falls under
	`pathPrefix`, in the order first linked. Image embeds, external links,
	anchors, and asset links (datafiles, notebooks, etc.) are ignored. A link
	back to `rootSlug` itself and duplicate links are dropped.

	Exported for unit testing.
*/
export const extractModuleLinks = (markdown: string, rootSlug: string, pathPrefix: string): IModuleLink[] => {
	if (!markdown || !pathPrefix) return [];

	const found: IModuleLink[] = [];
	const seen = new Set<string>();
	// The leading (!?) captures the image marker, same convention used by
	// convert_asset_links_by_adding_folder_path in PageView.tsx.
	const LINK_RE = /(!?)\[([^\]]*)\]\(([^)\s]+)\)/g;

	for (let match = LINK_RE.exec(markdown); match !== null; match = LINK_RE.exec(markdown)) {
		const [, imageMarker, text, href] = match;
		if (imageMarker) continue;

		const slug = resolvePageLinkSlug(rootSlug, href);
		if (!slug || slug === rootSlug) continue;
		if (!(slug === pathPrefix || slug.startsWith(`${pathPrefix}/`))) continue;
		if (seen.has(slug)) continue;

		seen.add(slug);
		found.push({ slug, title: text.trim() || slug });
	}

	return found;
};

/*
	Combine the current page with the modules linked from its hub into one
	list for the module-selection screen, with the current page first and no
	duplicates (a link back to the current page keeps the current page's own
	title rather than its link text). Exported for unit testing.
*/
export const buildModuleLinkList = (current: IModuleLink, links: IModuleLink[]): IModuleLink[] => {
	const seen = new Set<string>([current.slug]);
	const result: IModuleLink[] = [current];

	for (const link of links) {
		if (seen.has(link.slug)) continue;
		seen.add(link.slug);
		result.push(link);
	}

	return result;
};
