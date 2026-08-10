//
// Types for the admin module.
//
// Loaded from /api/admin/users and /api/admin/sections. See src/server/app_admin.ts.
//

// One of a user's section memberships, as returned inside iAdminUser.
export interface iAdminUserSection {
	idsection: number;
	code: string;
	title: string;
	year: number;
	term: string;
	role: string;
}

// A user plus every section they belong to. Never carries password or
// identity columns -- the server selects an explicit column list.
export interface iAdminUser {
	iduser: number;
	username: string;
	sections: iAdminUserSection[];
}

// A section as the admin sees it (unscoped, unlike GET /api/sections).
export interface iAdminSection {
	idsection: number;
	code: string;
	title: string;
	year: number;
	term: string;
	opens: string;
	closes: string;
	levels: string | null;
}

// Roles a user may hold in a section. Mirrors VALID_ROLES in app_admin.ts.
export const ADMIN_ROLES = ['student', 'faculty', 'admin'];

// The sentinel stored in sections.levels meaning "use the default tutorial list".
export const DEFAULT_LEVELS = '?';
