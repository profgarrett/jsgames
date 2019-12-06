// @flow
import React from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import IfLevelScore from './IfLevelScore';

import { IfLevelSchema } from './../../shared/IfLevelSchema';

import type { Node } from 'react';

import { IfLevels } from './../../shared/IfLevelSchema';
import { DEMO_MODE } from './../../server/secret';

type PropsType = {
	level: IfLevelSchema,
    hide: function,
};

export class ClassProgressModal extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
        
        (this: any)._on_click_to_hide_modal = this._on_click_to_hide_modal.bind(this);
	}

    // Send a sigal to hide the modal.
    _on_click_to_hide_modal() {
        this.props.hide();
    }
    
    // Show a modal pop up if the state requires it.
    render() {
        if(typeof this.props.level === 'undefined' || this.props.level === null) return null;

		const level = <IfLevelScore level={this.props.level} />;
		const id = <i style={{ fontSize: 8}}>{this.props.level._id}</i>;

		return (<div id='modal'><h3>asdf</h3>
				<Modal show={true} onHide={ this._on_click_to_hide_modal }  dialogClassName="modal-90w" size='lg' centered>
					<Modal.Header closeButton>
						<Modal.Title>Review Level</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<h1>Completed Page { id }</h1>
                        { level }
					</Modal.Body>
					<Modal.Footer>
						<Button variant='primary' onClick={this._on_click_to_hide_modal}>Close</Button>
					</Modal.Footer>
				</Modal>
			</div>);
    }
}