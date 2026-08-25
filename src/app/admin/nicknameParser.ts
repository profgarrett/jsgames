//
// Turn a Blackboard roster export into rows the nickname API accepts.
//
// The file Blackboard hands you is named .xls but is not a spreadsheet: it is
// UTF-16LE text with a byte-order mark, tab separators, and CRLF line endings.
// Opening it in Excel and saving as CSV produces UTF-8, commas, and quoted
// fields instead. Both shapes -- and plain tab-separated UTF-8 -- go through
// here, because asking someone holding a roster to first convert it is exactly
// the step that gets skipped.
//
// Parsing happens in the browser rather than the server so that no multipart
// body parser or encoding-detection library has to exist on the API side; the
// admin screen posts clean JSON. Everything in this file is pure and unit
// tested in test/app_nicknames.test.cjs.
//
// Only Last Name, First Name, Username and Student ID are read. Availability,
// Last Access, Child Course ID and the gradebook columns are ignored.
//

// One student, in the shape POST /api/admin/nicknames expects.
export interface iNicknameUploadRow {
	username: string;
	first_name: string;
	last_name: string;
	student_id: string;
}

export interface iParseResult {
	// Set when nothing usable came out of the file; rows is then empty.
	error: string | null;
	rows: iNicknameUploadRow[];
	// Lines that were dropped, numbered as they appear in the file (the header
	// is line 1), so a problem can be found and fixed in the original.
	skipped: Array<{ line: number, reason: string }>;
	// Which delimiter and encoding were used, shown in the UI so a surprising
	// result is diagnosable without opening devtools.
	delimiter: 'tab' | 'comma';
	encoding: string;
}


/*
	Decode the uploaded bytes to text.

	Byte-order marks are the only reliable signal here, and Blackboard writes
	one. Without a BOM we assume UTF-8, which is right for anything that has
	been through Excel or a text editor. A UTF-16 file whose BOM has been
	stripped would decode as mojibake -- but it would also have to have been
	deliberately mangled to get that way.

	The BOM itself is dropped: TextDecoder leaves U+FEFF at the front of the
	string for UTF-8, which would otherwise become part of the first header
	name and stop 'Last Name' from matching.
*/
export function decode_roster_bytes( buffer: ArrayBuffer ): { text: string, encoding: string } {
	const bytes = new Uint8Array(buffer);

	if( bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE )
		return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: 'UTF-16LE' };

	if( bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF )
		return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: 'UTF-16BE' };

	if( bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF )
		return { text: new TextDecoder('utf-8').decode(bytes.subarray(3)), encoding: 'UTF-8' };

	return { text: new TextDecoder('utf-8').decode(bytes), encoding: 'UTF-8' };
}


/*
	Split one line on a delimiter, honouring double-quoted fields.

	Needed for the Excel-saved-as-CSV case, where a name containing a comma
	("Jones, Jr.") is quoted and a literal quote inside it is doubled. The
	tab-separated original never quotes anything, and this handles that too --
	a field with no quotes is returned unchanged.
*/
export function split_delimited_line( line: string, delimiter: string ): string[] {
	const fields: string[] = [];
	let field = '';
	let in_quotes = false;

	for( let i = 0; i < line.length; i++ ) {
		const c = line[i];

		if( in_quotes ) {
			// A doubled quote inside a quoted field is one literal quote.
			if( c === '"' && line[i + 1] === '"' ) { field += '"'; i++; continue; }
			if( c === '"' ) { in_quotes = false; continue; }
			field += c;
			continue;
		}

		if( c === '"' ) { in_quotes = true; continue; }
		if( c === delimiter ) { fields.push(field); field = ''; continue; }
		field += c;
	}

	fields.push(field);

	return fields.map( f => f.trim() );
}


/*
	Tabs or commas?

	Decided from the header line alone, by simple majority. A comma in a header
	name is far less likely than a tab in one, so ties go to tabs -- which is
	also the untouched Blackboard export.
*/
export function detect_delimiter( header_line: string ): 'tab' | 'comma' {
	const tabs = (header_line.match(/\t/g) || []).length;
	const commas = (header_line.match(/,/g) || []).length;

	return commas > tabs ? 'comma' : 'tab';
}


/*
	Reduce a header cell to something matchable.

	'Last Name' => 'lastname', 'Student ID' => 'studentid', 'First_Name' =>
	'firstname'. Blackboard's capitalization and spacing have changed between
	versions, and an export edited in Excel picks up stray whitespace, so
	nothing here should depend on the exact spelling.
*/
export function normalize_header( header: string ): string {
	return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}


// Accepted spellings for each column we care about, after normalize_header.
const HEADER_ALIASES: { [key: string]: string[] } = {
	last_name: ['lastname', 'last', 'surname', 'familyname'],
	first_name: ['firstname', 'first', 'givenname'],
	username: ['username', 'user', 'userid', 'login', 'email', 'emailaddress'],
	student_id: ['studentid', 'id', 'studentnumber'],
};


/*
	Map the header line to column positions.

	@returns { columns } with a 0-based index per field (student_id may be -1,
	         it is optional), or { error } naming what was missing.
*/
export function map_header_columns( headers: string[] ): {
	error: string | null,
	columns: { last_name: number, first_name: number, username: number, student_id: number },
} {
	const normalized = headers.map(normalize_header);

	const find = (field: string): number => {
		const aliases = HEADER_ALIASES[field];
		for( const alias of aliases ) {
			const i = normalized.indexOf(alias);
			if( i !== -1 ) return i;
		}
		return -1;
	};

	const columns = {
		last_name: find('last_name'),
		first_name: find('first_name'),
		username: find('username'),
		student_id: find('student_id'),
	};

	// Student ID is optional; the other three are what a nickname is made of.
	const missing = (['last_name', 'first_name', 'username'] as const)
		.filter( f => columns[f] === -1 )
		.map( f => f.replace('_', ' ') );

	if( missing.length > 0 ) {
		return {
			error: 'The file is missing a column for: ' + missing.join(', ') +
				'. Found: ' + headers.filter( h => h !== '' ).join(', ') + '.',
			columns,
		};
	}

	return { error: null, columns };
}


/*
	Parse decoded roster text into upload rows.

	Blank lines and rows with no username are dropped quietly-ish -- they are
	reported in `skipped` but do not stop the upload, because a Blackboard
	export routinely ends with a trailing newline and can carry a course-total
	row with no student behind it.
*/
export function parse_roster( text: string ): iParseResult {
	const fail = (error: string, delimiter: 'tab' | 'comma' = 'tab'): iParseResult =>
		({ error, rows: [], skipped: [], delimiter, encoding: '' });

	// Normalize CRLF and lone CR before splitting, so a Windows export does not
	// leave a '\r' on the end of every last field.
	const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

	// Skip any leading blank lines to find the header.
	let header_index = 0;
	while( header_index < lines.length && lines[header_index].trim() === '' ) header_index++;

	if( header_index >= lines.length ) return fail('The file is empty');

	const delimiter_name = detect_delimiter(lines[header_index]);
	const delimiter = delimiter_name === 'tab' ? '\t' : ',';

	const headers = split_delimited_line(lines[header_index], delimiter);

	const { error: header_error, columns } = map_header_columns(headers);
	if( header_error !== null ) return fail(header_error, delimiter_name);

	const rows: iNicknameUploadRow[] = [];
	const skipped: Array<{ line: number, reason: string }> = [];

	for( let i = header_index + 1; i < lines.length; i++ ) {
		const line = lines[i];
		const line_number = i + 1; // 1-based, as a text editor counts.

		if( line.trim() === '' ) continue; // Trailing newlines are not worth reporting.

		const fields = split_delimited_line(line, delimiter);

		const at = (index: number): string =>
			index >= 0 && index < fields.length ? fields[index] : '';

		const username = at(columns.username);
		const first_name = at(columns.first_name);
		const last_name = at(columns.last_name);

		if( username === '' ) { skipped.push({ line: line_number, reason: 'No username' }); continue; }
		if( first_name === '' && last_name === '' ) {
			skipped.push({ line: line_number, reason: 'No name' });
			continue;
		}
		if( first_name === '' ) { skipped.push({ line: line_number, reason: 'No first name' }); continue; }
		if( last_name === '' ) { skipped.push({ line: line_number, reason: 'No last name' }); continue; }

		rows.push({
			username: username.toLowerCase(),
			first_name,
			last_name,
			student_id: at(columns.student_id),
		});
	}

	if( rows.length === 0 ) {
		return {
			error: 'No student rows were found below the header',
			rows: [], skipped, delimiter: delimiter_name, encoding: '',
		};
	}

	return { error: null, rows, skipped, delimiter: delimiter_name, encoding: '' };
}


/*
	Read a File chosen in the browser and parse it.

	Kept apart from parse_roster so the parsing can be tested without a DOM.
*/
export async function parse_roster_file( file: File ): Promise<iParseResult> {
	const buffer = await file.arrayBuffer();
	const { text, encoding } = decode_roster_bytes(buffer);
	const result = parse_roster(text);

	return { ...result, encoding };
}
