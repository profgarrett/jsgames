import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { get_health, HealthStatus } from './Api';

/*
	Tell the student the site is broken *before* they type a password into a form that
	cannot possibly work.

	Used on the login and password pages. The check is a single /api/health call on
	mount, plus a slow re-check so the banner clears itself once the database comes
	back and the student does not have to guess when to reload.
*/

const RECHECK_MS = 30 * 1000;

export function useServiceHealth(recheck_ms: number = RECHECK_MS): HealthStatus | null {
	// null = not checked yet. Render nothing rather than flashing a scary banner.
	const [health, setHealth] = useState<HealthStatus | null>(null);

	useEffect(() => {
		let cancelled = false;

		const check = async () => {
			const result = await get_health();
			if(!cancelled) setHealth(result);
		};

		check();
		const timer = setInterval(check, recheck_ms);

		return () => { cancelled = true; clearInterval(timer); };
	}, [recheck_ms]);

	return health;
}


/*
	Renders nothing at all when everything is fine (the normal case), so it is safe to
	drop into the top of any page.
*/
export default function ServiceHealthBanner({ action = 'sign in' }: { action?: string }) {
	const health = useServiceHealth();

	if(health === null) return null;
	if(health.state === 'ok') return null;

	/*
		'unknown' means the probe could not answer the question -- the health route 404'd,
		a proxy returned HTML, the body did not parse. Say nothing rather than guessing.

		A false "the database is down" on the login page is worse than no banner at all:
		the student stops trying and emails, while the site works fine. If something
		really is broken, the login POST itself still produces an accurate message.
	*/
	if(health.state === 'unknown') return null;

	if(health.state === 'unreachable') {
		return (
			<Alert variant='warning'>
				<strong>We can&apos;t reach Excel.fun right now.</strong>{' '}
				Check your internet connection. If you are online, the site may be restarting &mdash;
				please try again in a few minutes.
			</Alert>
		);
	}

	return (
		<Alert variant='warning'>
			<strong>The site&apos;s database is down, so you can&apos;t {action} right now.</strong>{' '}
			This is a problem on our end, not with anything you typed. This message will clear
			itself as soon as the database is back &mdash; usually a few minutes. If it is still
			here after 15 minutes, email <a href='mailto:profgarrett@gmail.com'>profgarrett@gmail.com</a>{' '}
			and mention error code <code>DB_UNAVAILABLE</code>.
		</Alert>
	);
}
