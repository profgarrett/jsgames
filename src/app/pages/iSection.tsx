//
// Sections are loaded from http://localhost:8080/api/sections/
// [
//		{ idsection, code, year, term, opens, closes, levels, role }
// ]
interface iSection {
	idsection: number;
	code: string;
	year: number;
	term: string;
	title: string;
	levels: string;
	opens: string;
	closes: string;
	role: string;
}

export default iSection;