/*
	Loads the course hub page (course_dv/index, course_ais/index, ...) for
	whichever page is being read, and parses it into a table of contents with
	parseBookHub (see PageBookHub.ts).

	Used by PageView.tsx (left-hand contents panel, module name, previous /
	next chapter) and SiteHeader.tsx (book title). Hubs are cached for the
	life of the browser tab, so moving between chapters -- or rendering the
	header and the page at the same time -- costs one request per course.
*/

import { useEffect, useMemo, useState } from 'react';

import { requestPage } from './PageViewContainer';
import { getModuleScope } from './PageModuleLinks';
import { IBookHub, parseBookHub } from './PageBookHub';

const hubCache = new Map<string, Promise<IBookHub | null>>();

export const loadBookHub = (rootSlug: string, pathPrefix: string): Promise<IBookHub | null> => {
	const cached = hubCache.get(rootSlug);
	if (cached) return cached;

	const request = requestPage(rootSlug)
		.then((page) => parseBookHub(page.markdown, rootSlug, pathPrefix))
		.catch(() => {
			// Not logged in yet, or no hub page: try again next time.
			hubCache.delete(rootSlug);
			return null;
		});

	hubCache.set(rootSlug, request);
	return request;
};

/*
	Returns the parsed hub for `slug`'s course, or null while it loads, when
	it cannot be fetched, or when the page sits outside any course folder.
	Pass '' to opt out (hooks cannot be called conditionally).
*/
export default function useBookHub(slug: string): IBookHub | null {
	const { rootSlug, pathPrefix } = useMemo(() => getModuleScope(slug || ''), [slug]);
	const enabled = Boolean(slug) && pathPrefix !== '';
	const [loaded, setLoaded] = useState<{ rootSlug: string; hub: IBookHub | null } | null>(null);

	useEffect(() => {
		if (!enabled) return;

		let ignore = false;
		void loadBookHub(rootSlug, pathPrefix).then((hub) => {
			if (!ignore) setLoaded({ rootSlug, hub });
		});

		return () => {
			ignore = true;
		};
	}, [enabled, rootSlug, pathPrefix]);

	if (!enabled || !loaded || loaded.rootSlug !== rootSlug) return null;
	return loaded.hub;
}
