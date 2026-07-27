/**
	Server-side routes for the markdown Pages module.

	Reads in-repo markdown files from static/pages and serves them to
	logged-in users. Markdown is returned raw; the client renders it to HTML.

	The markdown files live in the public static asset tree so they resolve in
	both development and production without special branching.
*/
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

import { user_require_logged_in, nocache, log_error } from './network';

import type { Request, Response, NextFunction } from 'express';


// Resolve the markdown content directory from the available static asset paths.
const PAGES_DIR = [
	path.resolve(__dirname, '../../static/pages'),
	path.resolve(__dirname, '../public/static/pages'),
	path.resolve(__dirname, '../content/pages'),
].find((candidate) => fs.existsSync(candidate)) ?? path.resolve(__dirname, '../../static/pages');

// Slugs map 1:1 to filenames (minus the .md extension). Restrict to a safe
// charset so a slug can never escape PAGES_DIR via traversal or absolute paths.
const SLUG_RE = /^[a-z0-9_/-]+$/;

const normalize_slug = (slug: string): string => slug.endsWith('.md') ? slug.slice(0, -3) : slug;

const is_valid_slug = (slug: string): boolean => {
	if (!SLUG_RE.test(slug)) return false;
	if (slug.startsWith('/') || slug.endsWith('/')) return false;
	if (slug.includes('//')) return false;
	return !slug.split('/').includes('..');
};

// Derive a display title from the first markdown H1 (`# Title`), falling back
// to the slug if none is present.
const extract_title = (markdown: string, slug: string): string => {
	const lines = markdown.split('\n');
	for (const line of lines) {
		const m = line.match(/^#\s+(.+?)\s*$/);
		if (m) return m[1];
	}
	return slug;
};

// List available pages as [{ slug, title }], sorted by title.
const list_pages = (): { slug: string; title: string }[] => {
	const files: string[] = [];

	const walk = (dir: string, rel: string): void => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			if (entry.name.startsWith('.')) continue;
			const entryPath = path.join(dir, entry.name);
			const entryRel = rel ? `${rel}/${entry.name}` : entry.name;

			if (entry.isDirectory()) {
				walk(entryPath, entryRel);
			} else if (entry.isFile() && entry.name.endsWith('.md')) {
				files.push(entryRel);
			}
		}
	};

	walk(PAGES_DIR, '');

	const pages = files.map((file) => {
		const slug = file.replace(/\.md$/, '');
		const markdown = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
		return { slug, title: extract_title(markdown, slug) };
	});

	pages.sort((a, b) => a.title.localeCompare(b.title));
	return pages;
};

// Read a single page by slug, or return null if the slug is invalid or the
// file does not exist. Re-resolves and confirms the path stays within
// PAGES_DIR as defense in depth on top of the slug charset check.
const read_page = (slug: string): { slug: string; title: string; markdown: string } | null => {
	const normalizedSlug = normalize_slug(slug);
	if (!is_valid_slug(normalizedSlug)) return null;

	const file = path.resolve(PAGES_DIR, normalizedSlug + '.md');
	if (!file.startsWith(PAGES_DIR + path.sep)) return null;
	if (!fs.existsSync(file)) return null;

	const markdown = fs.readFileSync(file, 'utf8');
	return { slug: normalizedSlug, title: extract_title(markdown, normalizedSlug), markdown };
};


////////////////////////////////////////////////////////////////////////
//  Routes
////////////////////////////////////////////////////////////////////////


// List all available pages.
router.get('/',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		res.json(list_pages());
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Return a single page's raw markdown.
router.get(/^\/(.+)$/, 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const rawSlug = (req.params as any)[0];
		const slug = normalize_slug(typeof rawSlug === 'string' ? rawSlug : '');
		const page = read_page(slug);

		if (page === null) {
			return res.sendStatus(404);
		}

		res.json(page);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


const app_pages = router;

// Helpers exported for unit testing.
export { app_pages, is_valid_slug, extract_title, list_pages, read_page, PAGES_DIR };
