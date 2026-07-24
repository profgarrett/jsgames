import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';

// Google Identity Services attaches itself to window.google (loaded in index.html).
declare global {
	interface Window { google?: any; }
}

interface PropsType {
	disabled: boolean,
	// Called with the Google ID token ("credential") and an optional course join code.
	submit: (credential: string, section_code: string) => void,
}

/*
	"Sign in with Google" button.

	Fetches the public client id from /api/users/config, initializes Google Identity
	Services, and renders the official button. On success, hands the ID token up to the
	parent, which posts it to /api/users/google_login for server-side verification.

	The optional course-join-code field is only used the first time a new student signs
	in; existing users already belong to their sections and can leave it blank.
*/
export default function LoginGoogle({ submit, disabled }: PropsType) {
	const divRef = useRef<HTMLDivElement>(null);
	const sectionCodeRef = useRef('');
	const [clientId, setClientId] = useState('');
	const [sectionCode, setSectionCode] = useState('');
	const [error, setError] = useState('');

	// Keep the latest join code reachable from the GIS callback (which closes over
	// this component once at init time).
	useEffect(() => { sectionCodeRef.current = sectionCode; }, [sectionCode]);

	// Load the public Google client id.
	useEffect(() => {
		fetch('/api/users/config', { credentials: 'include' })
			.then(r => r.json())
			.then(j => {
				if (j.google_client_id) setClientId(j.google_client_id);
				else setError('Google sign-in is not configured.');
			})
			.catch(() => setError('Could not load Google sign-in.'));
	}, []);

	// Once we have the client id and the GIS script is ready, render the button.
	useEffect(() => {
		if (!clientId) return;
		let cancelled = false;

		const init = () => {
			if (cancelled || !window.google || !divRef.current) return;
			window.google.accounts.id.initialize({
				client_id: clientId,
				callback: (resp: any) => submit(resp.credential, sectionCodeRef.current),
			});
			window.google.accounts.id.renderButton(divRef.current, {
				theme: 'outline', size: 'large', text: 'signin_with', width: 260,
			});
		};

		// The GIS script loads async; poll briefly until window.google is available.
		if (window.google) {
			init();
		} else {
			const timer = setInterval(() => {
				if (window.google) { clearInterval(timer); init(); }
			}, 100);
			const stop = setTimeout(() => clearInterval(timer), 5000);
			return () => { cancelled = true; clearInterval(timer); clearTimeout(stop); };
		}

		return () => { cancelled = true; };
	}, [clientId]);

	return (
		<div>
			<Form.Group className='mb-2'>
				<Form.Label>Course join code (optional)</Form.Label>
				<Form.Control
					type='text'
					value={sectionCode}
					disabled={disabled}
					onChange={e => setSectionCode(e.target.value)}
					placeholder='Enter only if joining a class'
				/>
			</Form.Group>
			<div ref={divRef} />
			{error ? <div className='text-danger mt-2'>{error}</div> : null}
		</div>
	);
}
