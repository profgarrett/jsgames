import React from 'react';
import { getUserFromBrowser } from './Authentication';
import { Modal, Button } from 'react-bootstrap';
import CSS from 'csstype';

const DEBUG = false;

/*
    React has issues sometimes with index.html being cached.  To avoid, this component does a 
    async check on /static/meta.json.  If the returned value doesn't match the document.script
    tag for the build, then it'll prompt the user (if admin) and reload the page.

    Runs the test every hour, based on a local cookie value.
*/

type StateType = {
    localhost: boolean,
	build: string,
    href: string,
};

export default class CacheBuster extends React.Component<unknown, StateType> { 
	constructor(props: any) {
		super(props);

        this.state = { 
            localhost: document.location.href.substr(0, 'http://localhost'.length) ==='http://localhost',
            build: '',
            href: this.get_href(),
        };

        this.load_version();
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
        const url = `/static/meta.json?${new Date().getTime()}`; 

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
                for (let name of names) caches.delete(name);
            });
        }

        // Tell browser to reload from server.
        window.location.reload();
    }



_render_modal() {
    return (<div>
              <Modal>
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
        if(user.username === 'garrettn') {
            return <div onClick={ () => { console.log('click'); this.load_version(); } } style={ divStyle}>{this.state.build}</div>
        }

        return null;
	}
}