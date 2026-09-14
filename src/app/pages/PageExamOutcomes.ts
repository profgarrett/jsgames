/*
	Exam review pages (any page whose title starts with the word "Exam", e.g.
	"Exam 1 Review") support a shorthand for pulling in the Outcomes from the
	lessons being tested, instead of an author copy-pasting them by hand (the
	way static/pages/course_dv/exams/exam2.md currently does it manually).

	Authors write:

		{{dv00-files}}

	on its own line. The reading view (see PageView.tsx) turns that into:

		### dv00-files

		- Organize your files into folders
		- Avoid problems with OneDrive
		  ...

		[Working with files ->](/pages/course_dv/dv00-files/index)

	The bullet list is read from the referenced page's own "**Outcomes**:"
	block (see static/pages/course_dv/dv00-files/index.md), so the exam review
	can never drift out of sync with the lesson it is testing.

	Everything here is pure/synchronous and unit-testable; PageView.tsx does
	the actual fetching (via requestPage) and feeds the results back in
	through substituteExamOutcomeRefs.
*/

import { getModuleScope } from './PageModuleLinks';

// A page qualifies as an "exam review" page purely by its title -- matched as
// a whole leading word so "Exam 1 Review" qualifies but "Example" does not.
export const isExamReviewPage = (title: string): boolean => /^exam\b/i.test((title ?? '').trim());

/*
	Find every {{name}} reference in a page's markdown, in the order first
	seen, with duplicates removed (a name referenced twice only needs to be
	fetched once).
*/
export const extractExamOutcomeRefs = (markdown: string): string[] => {
	if (!markdown) return [];

	const refs: string[] = [];
	const seen = new Set<string>();
	const REF_RE = /\{\{([^{}]+)\}\}/g;

	for (let match = REF_RE.exec(markdown); match !== null; match = REF_RE.exec(markdown)) {
		const ref = match[1].trim();
		if (!ref || seen.has(ref)) continue;
		seen.add(ref);
		refs.push(ref);
	}

	return refs;
};

/*
	Resolve a {{ref}} written on an exam page into the page slug it names.

	The normal case is a bare lesson name -- {{dv00-files}} -- which is
	resolved relative to the exam's own course, the same "course root" used
	for multi-module practice (see getModuleScope/pathPrefix in
	PageModuleLinks.ts): an exam living at course_dv/exams/exam1 resolves
	{{dv00-files}} to course_dv/dv00-files/index.

	A ref that already contains a '/' is treated as an explicit slug (e.g.
	{{course_ais/excel01-input-formats}}), letting an exam pull in a lesson
	from outside its own course. Either way, a bare directory-style reference
	gets '/index' appended, since every lesson lives at
	<course>/<lesson>/index.md.
*/
export const resolveExamOutcomeSlug = (pageSlug: string, ref: string): string => {
	const trimmedRef = ref.trim();
	if (!trimmedRef) return trimmedRef;

	const { pathPrefix } = getModuleScope(pageSlug);
	const base = trimmedRef.includes('/') || !pathPrefix ? trimmedRef : `${pathPrefix}/${trimmedRef}`;

	return base.endsWith('/index') ? base : `${base}/index`;
};

/*
	True when `line` is (once markdown bold markers and a trailing colon are
	stripped) exactly the word "Outcomes" -- matches "**Outcomes**:",
	"**Outcomes:**", "Outcomes:", etc.
*/
const isOutcomesHeaderLine = (line: string): boolean => {
	const stripped = line.trim().replace(/\*\*/g, '').replace(/:\s*$/, '').trim();
	return /^outcomes$/i.test(stripped);
};

const BULLET_RE = /^\s*[-*+]\s+(.+?)\s*$/;
const HEADING_RE = /^(#{1,6})\s+/;

/*
	Pull the bullet list out of a lesson page's "**Outcomes**:" block, e.g.

		**Outcomes**:

		- Organize your files into folders
		- Avoid problems with OneDrive

	Some pages put a line of intro prose between the marker and the list
	instead of going straight to the bullets, e.g. (see
	static/pages/course_dv/dv20-data/index.md):

		**Outcomes**

		After completing this module, you should be able to:

		* Identify a field's storage type, ...

	so any blank or prose lines after the marker are skipped in search of the
	first bullet. Returns [] if the page has no Outcomes block, or if a new
	heading is reached before any bullet is found. Only the first Outcomes
	block is read; the list itself ends at the first blank line (or the end of
	the file).
*/
export const extractOutcomesBullets = (markdown: string): string[] => {
	if (!markdown) return [];

	const lines = markdown.split(/\r?\n/);
	let i = 0;
	while (i < lines.length && !isOutcomesHeaderLine(lines[i])) i++;
	if (i >= lines.length) return [];
	i++; // move past the "Outcomes" line itself

	// Skip blank lines and any intro prose in search of the bullet list,
	// stopping if a heading is reached first -- that means this page has no
	// actual list under its Outcomes marker.
	while (i < lines.length && !BULLET_RE.test(lines[i])) {
		if (HEADING_RE.test(lines[i])) return [];
		i++;
	}
	if (i >= lines.length) return [];

	const bullets: string[] = [];
	while (i < lines.length) {
		const line = lines[i];
		if (line.trim() === '') break;
		const match = line.match(BULLET_RE);
		if (!match) break;
		bullets.push(match[1].trim());
		i++;
	}

	return bullets;
};

// One resolved {{ref}}, once PageView.tsx has (tried to) fetch it.
export interface IExamOutcomeResult {
	// Resolved page slug -- known as soon as the ref is seen, before the
	// fetch even starts.
	slug: string;
	// The referenced page's title, once fetched. null if the fetch failed.
	title: string | null;
	// Bullets from that page's Outcomes block. Empty if the page loaded but
	// had no such block.
	outcomes: string[];
	// True if the page could not be loaded at all (bad reference, page
	// removed, etc.).
	notFound: boolean;
}

/*
	Render the markdown for a single {{ref}}, in whatever state it is
	currently in:
	  - not yet resolved (still fetching, or fetch not started): heading only,
	    with a loading note.
	  - resolved but not found: heading, with an error note.
	  - resolved: heading, the Outcomes bullets (if any), and a link to the
	    full page.
	Exported for unit testing; substituteExamOutcomeRefs is the entry point
	PageView.tsx actually uses.
*/
export const buildExamOutcomeMarkdown = (ref: string, result?: IExamOutcomeResult): string => {
	const heading = `### ${ref}`;

	if (!result) return `${heading}\n\n*Loading outcomes...*`;
	if (result.notFound) return `${heading}\n\n*Could not load "${ref}".*`;

	const linkLine = `[${result.title ?? ref} →](/pages/${result.slug})`;
	if (result.outcomes.length === 0) return `${heading}\n\n${linkLine}`;

	const bulletList = result.outcomes.map((outcome) => `- ${outcome}`).join('\n');
	return `${heading}\n\n${bulletList}\n\n${linkLine}`;
};

/*
	Replace every {{ref}} in an exam review page's markdown with its rendered
	block, using whatever results have come back so far (see
	buildExamOutcomeMarkdown for the per-state rendering). Refs with no entry
	in `resultsByRef` yet just render as loading.
*/
export const substituteExamOutcomeRefs = (markdown: string, resultsByRef: Map<string, IExamOutcomeResult>): string =>
	markdown.replace(/\{\{([^{}]+)\}\}/g, (_match, rawRef: string) => {
		const ref = rawRef.trim();
		return buildExamOutcomeMarkdown(ref, resultsByRef.get(ref));
	});
