import React from 'react';
import { getUserFromBrowser } from './Authentication';
import { Modal, Button } from 'react-bootstrap';
import CSS from 'csstype';

const DEBUG = false;

// How often to re-check while a tab stays on one screen. A deploy can land at any point
// during a student's session, and this component used to check only once, at mount --
// a student sitting on one screen (e.g. mid-level) longer than that never saw the
// reload prompt, no matter how long they sat there.
const RECHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/*
    React has issues sometimes with index.html being cached.  To avoid, this component does a 
    async check on /meta.json.  If the returned value doesn't match the document.script
    tag for the build, then it'll prompt the user to reload.

    Re-checks every RECHECK_INTERVAL_MS while mounted, and immediately when the tab regains
    focus/visibility -- a student who alt-tabs back after a deploy shouldn't have to wait
    out the full interval.
*/

type StateType = {
    localhost: boolean,
	build: string | null,
    href: string,
};

export default class CacheBuster extends React.Component<unknown, StateType> {
    interval: ReturnType<typeof setInterval> | null = null;

	constructor(props: any) {
		super(props);

        this.state = { 
            localhost: document.location.href.substr(0, 'http://localhost'.length) ==='http://localhost',
            build: null,
            href: this.get_href(),
        };
	}

    componentDidMount() {
        this.load_version();

        // Don't schedule anything in dev mode.
        if(this.state.localhost) return;

        this.interval = setInterval(this.load_version, RECHECK_INTERVAL_MS);
        document.addEventListener('visibilitychange', this.handle_visibility);
    }

    componentWillUnmount() {
        if(this.interval) clearInterval(this.interval);
        document.removeEventListener('visibilitychange', this.handle_visibility);
    }

    // Re-check as soon as the student comes back to this tab, rather than waiting for
    // the interval -- covers the common case of alt-tabbing away and back later.
    handle_visibility = () => {
        if(document.visibilityState === 'visible') this.load_version();
    }

    // Pull the href for the main script from the document.scripts collection.
    get_href() {
        const reg = /main.*js/;
        let href = '';
        for(let i=0; i<document.scripts.length; i++) {
            if(reg.test(document.scripts[i].src)) href = document.scripts[i].src;
        }
        if(DEBUG) console.log('CacheBuster found ref: ' + href);

        return href;
    }

    // Ping the server to find the most recent posted version.
	load_version = () => {
        if (DEBUG) console.log('CacheBuster: Loading Version from Server');
        const url = `/meta.json?${new Date().getTime()}`; 

        // Don't load anything if this is on the localhost (i.e., developing)
        if(this.state.localhost) return;

		// Fire AJAX.
		fetch(url, { cache: 'no-cache' })
			.then( response => response.json() )
			.then( json => {
                this.setState({ build: json.build});
			})
			.catch( error => {
                throw error;
		});
	}

    // Trigger a hard refresh for the page.
    reload(): any {
        if (caches) {
            // Service worker cache should be cleared with caches.delete()
            caches.keys().then(function(names) {
                for (const name of names) caches.delete(name);
            });
        }

        // Tell browser to reload from server.
        window.location.reload();
    }



_render_modal() {
    return (<div>
              {/*
                react-bootstrap's Modal defaults `show` to false and will not render into
                its portal without it. This component previously omitted `show` entirely,
                so this branch was reached (render() returned the Modal JSX) but nothing
                ever appeared on screen -- the mismatch was detected and silently dropped.

                backdrop='static' and keyboard={false} keep a student from clicking outside
                or pressing Escape to dismiss it: this prompt exists to force a reload of a
                stale bundle, not to be brushed past.
              */}
              <Modal show={true} onHide={() => {}} backdrop='static' keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Program</Modal.Title>
                </Modal.Header>
                    <Modal.Body>
                        The website has been updated, and your browser has cached an older copy. 
                        Please click the button below to refresh.
                        <br/><br/>
                        If you keep getting these messages, please press the refresh button on your browser.
                    </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={ () => this.reload() }>Reload website</Button>
                </Modal.Footer>
            </Modal>
        </div>);
        
    }


	render() {
		const user = getUserFromBrowser();
		const divStyle: CSS.Properties = { 
			position: 'fixed',
			right: '2px',
			bottom: '2px',
			color: 'lightgray'
		};

        // Don't have information on the local build, probably because we are in dev mode.  Don't do anything!
        if(this.state.href === '' ) return null;

        // If we are in localhost mode, then don't do anything. Dev mode.
        if(this.state.localhost) return null;

        // Don't have information yet from the server.
        if(this.state.build === null) {
            return <div style={ divStyle}>Loading version</div>
        }

        // Look to see if the server version matches the client version.
        if(this.state.href.indexOf(this.state.build) === -1) {
            if (DEBUG) console.log('CacheBuster: Found an older version loaded. Reloading');
            return this._render_modal();
        }

        // We're good!
        // If admin, then show build on bottom-right corner. If clicked, force reload.
        if(user.username === 'profgarrett') {
            return <div onClick={ () => { console.log('click'); this.load_version(); } } style={ divStyle}>{this.state.build}</div>
        }

        return null;
	}
}
