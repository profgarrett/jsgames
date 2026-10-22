/*
	Helpers for the book-style reading layout (see PageView.tsx and
	PageBookContents.tsx).

	Every course has a hub page (course_dv/index, course_ais/index, ...) that
	lists its lessons as bulleted links grouped under "## Module ..." and
	"### Week ..." headings. The reading view treats that hub as the book's
	table of contents: the left-hand panel lists every chapter, the chapter
	opener names the module a page belongs to, and the foot of each page
	links to the previous and next chapters.

	Everything here is pure and synchronous so it can be unit tested; the
	fetching and caching live in useBookHub.ts.
*/

import { resolvePageLinkSlug } from './PageModuleLinks';

export interface IBookChapter {
	slug: string;
	// Short code from the lesson's folder name ("dv40", "excel01", "ais08"),
	// or null for pages that do not follow the convention (e.g. "okta").
	code: string | null;
	// The description after the link when the hub gives one
	// ("[excel01](...): Inputting data"), otherwise the link text with any
	// leading code removed ("[dv40. Colors](...)" -> "Colors").
	title: string;
	// The "### Week ..." heading the link sits under, without its date
	// ("Week 3"), or '' when there is none.
	group: string;
}

export interface IBookSection {
	// "Module 1" from "## Module 1: Data Visualization"; '' when the heading has no colon.
	kicker: string;
	// "Data Visualization"; the whole heading when it has no colon.
	name: string;
	chapters: IBookChapter[];
}

export interface IBookHub {
	rootSlug: string;
	// The hub page's H1, e.g. "Business Analytics Textbook"; '' if it has none.
	title: string;
	sections: IBookSection[];
}

export interface IChapterContext {
	sectionIndex: number;
	section: IBookSection;
	previous: IBookChapter | null;
	next: IBookChapter | null;
}

export interface IChapterCode {
	// "dv40"
	code: string;
	// "40" -- leading zeros dropped, so "ais08" numbers its sections 8.1, 8.2, ...
	number: string;
}

const LINK_RE = /(!?)\[([^\]]*)\]\(([^)\s]+)\)/g;
const LIST_ITEM_RE = /^\s*(?:[-*+]|\d+[.)])\s+/;
const FENCE_RE = /^\s*(```|~~~)/;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const CHAPTER_FOLDER_RE = /^([a-z]+)(\d+)(?=-|$)/i;
const LEADING_CODE_RE = /^[a-z]+\d+[a-z]*\s*[.:\-–—]?\s*/i;

// Lesson and hub slugs are written both with and without a trailing /index.
export const normalizeSlug = (slug: string): string => (slug ?? '').replace(/\/index$/, '').replace(/\/+$/, '');

export const sameSlug = (a: string, b: string): boolean => normalizeSlug(a) === normalizeSlug(b);

/*
	Chapter code for a lesson, taken from the folder directly under the course:
	course_dv/dv40-colors/index -> { code: 'dv40', number: '40' }. Hub pages,
	exam pages and anything else without a letters-then-digits folder name
	return null, so they are left unnumbered.
*/
export const getChapterCode = (slug: string): IChapterCode | null => {
	const parts = (slug ?? '').split('/').filter(Boolean);
	if (parts.length < 2) return null;

	const match = parts[1].match(CHAPTER_FOLDER_RE);
	if (!match) return null;

	return { code: `${match[1]}${match[2]}`, number: String(parseInt(match[2], 10)) };
};

const stripHtmlComments = (markdown: string): string => markdown.replace(/<!--[\s\S]*?-->/g, '');

// Drops simple inline markdown so link text and descriptions read as plain text.
const plainText = (text: string): string => text
	.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
	.replace(/[*_`]/g, '')
	.replace(/\s+/g, ' ')
	.trim();

// A trailing date on a week heading: "- August 17, 2026", ", Aug. 17",
// "(8/17/2026)", or a bare year.
const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const TRAILING_DATE_RE = new RegExp(
	`\\s*[-–—,:·(]?\\s*(?:(?:${MONTHS})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s*\\d{4})?|\\d{1,2}/\\d{1,2}(?:/\\d{2,4})?|\\d{4})\\)?\\s*$`,
	'i',
);

// The contents panel shows week headings without their dates:
// "Week 1 - August 17, 2026" -> "Week 1". A heading that is nothing but a
// date is kept as written.
const shortenGroup = (heading: string): string => {
	const text = plainText(heading);
	return text.replace(TRAILING_DATE_RE, '').trim() || text;
};

const makeSection = (heading: string): IBookSection => {
	const text = plainText(heading);
	const match = text.match(/^(.+?):\s*(.+)$/);
	return match
		? { kicker: match[1].trim(), name: match[2].trim(), chapters: [] }
		: { kicker: '', name: text, chapters: [] };
};

const chapterTitle = (linkText: string, rest: string): string => {
	const description = plainText(rest.replace(/^\s*[:\-–—]\s*/, ''));
	if (description) return description;

	const text = plainText(linkText);
	return text.replace(LEADING_CODE_RE, '').trim() || text;
};

/*
	Turn a hub page's markdown into a table of contents.

	Only bulleted (or numbered) list items are read, so a link mentioned in
	passing in a paragraph does not become a chapter. Links must point at a
	page under `pathPrefix` (the course folder); external sites, assets and
	pages in other courses (such as the shared Okta page) are skipped, as are
	repeats. HTML comments and fenced code are ignored. A "## " heading with
	no chapter links under it (e.g. "Further Resources") is dropped.
*/
export const parseBookHub = (markdown: string, rootSlug: string, pathPrefix: string): IBookHub => {
	const hub: IBookHub = { rootSlug, title: '', sections: [] };
	if (!markdown) return hub;

	const seen = new Set<string>();
	let sectionHeading = '';
	let section: IBookSection | null = null;
	let group = '';
	let inFence = false;

	for (const line of stripHtmlComments(markdown).split(/\r?\n/)) {
		if (FENCE_RE.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;

		const heading = line.match(HEADING_RE);
		if (heading) {
			const level = heading[1].length;
			if (level === 1) {
				if (!hub.title) hub.title = plainText(heading[2]);
			} else if (level === 2) {
				sectionHeading = heading[2];
				section = null;
				group = '';
			} else {
				group = shortenGroup(heading[2]);
			}
			continue;
		}

		if (!pathPrefix || !LIST_ITEM_RE.test(line)) continue;

		LINK_RE.lastIndex = 0;
		for (let match = LINK_RE.exec(line); match !== null; match = LINK_RE.exec(line)) {
			const [whole, imageMarker, text, href] = match;
			if (imageMarker) continue;

			const slug = resolvePageLinkSlug(rootSlug, href);
			if (!slug || sameSlug(slug, rootSlug)) continue;
			if (!(slug === pathPrefix || slug.startsWith(`${pathPrefix}/`))) continue;

			const key = normalizeSlug(slug);
			if (seen.has(key)) continue;
			seen.add(key);

			if (!section) {
				section = makeSection(sectionHeading);
				hub.sections.push(section);
			}

			const rest = line.slice(match.index + whole.length).split(/\[[^\]]*\]\(/)[0];
			section.chapters.push({
				slug,
				code: getChapterCode(slug)?.code ?? null,
				title: chapterTitle(text, rest),
				group,
			});
		}
	}

	return hub;
};

/*
	Where `slug` sits in the hub: the section (module) it belongs to and the
	chapters before and after it in reading order. Previous/next run across
	module boundaries. Returns null when the page is not listed in the hub.
*/
export const findChapterContext = (hub: IBookHub | null, slug: string): IChapterContext | null => {
	if (!hub || !slug) return null;

	const flat: IBookChapter[] = [];
	let found = -1;
	let sectionIndex = -1;

	hub.sections.forEach((section, index) => {
		for (const chapter of section.chapters) {
			if (found < 0 && sameSlug(chapter.slug, slug)) {
				found = flat.length;
				sectionIndex = index;
			}
			flat.push(chapter);
		}
	});

	if (found < 0) return null;

	return {
		sectionIndex,
		section: hub.sections[sectionIndex],
		previous: found > 0 ? flat[found - 1] : null,
		next: found < flat.length - 1 ? flat[found + 1] : null,
	};
};

/*
	Split a page's first level-1 heading off its markdown, so the reading view
	can set it as the chapter title. Headings inside fenced code (Python
	comments) and HTML comments are skipped. Returns the markdown unchanged,
	with a null title, when there is no H1.
*/
export const extractTitle = (markdown: string): { title: string | null; body: string } => {
	if (!markdown) return { title: null, body: markdown };

	const lines = markdown.split(/\r?\n/);
	let inFence = false;
	let inComment = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (inComment) {
			if (line.includes('-->')) inComment = false;
			continue;
		}
		if (FENCE_RE.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		if (line.includes('<!--') && !line.slice(line.indexOf('<!--')).includes('-->')) {
			inComment = true;
			continue;
		}

		const match = line.match(/^#\s+(.+?)\s*#*\s*$/);
		if (match) {
			return {
				title: match[1].trim(),
				body: [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n'),
			};
		}
	}

	return { title: null, body: markdown };
};
