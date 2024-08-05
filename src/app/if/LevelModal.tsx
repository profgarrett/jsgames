import React, {ReactElement} from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import { LevelScore, LevelScorePage } from './LevelScore';
import { Loading } from '../components/Misc';

import { IfLevelSchema } from '../../shared/IfLevelSchema';


import { IfLevels } from '../../shared/IfLevelSchema';
import { DEMO_MODE } from '../configuration';


interface PropsType {
	level: IfLevelSchema|null,
	level_id: string,
    hide: Function,
	sequence_in_level: number|null,
}

interface StateType {
	modal_level: IfLevelSchema|null,
	modal_level_loading: boolean,
}

export class LevelModal extends React.Component<PropsType, StateType> {
	static defaultProps = {
		level: null,
		level_id: null,
		sequence_in_level: null,
	};

	constructor(props: any) {
		super(props);
        this.state = {
			modal_level: (this.props.level === null) ? null : this.props.level,
			modal_level_loading: (this.props.level === null ),
		};

		this.load_data();
	}

    // Send a sigal to hide the modal.
    _on_click_to_hide_modal = () => {
		this.setState({ modal_level: null, modal_level_loading: false });
		this.props.hide();
    }

	/*
		Load a level to view as a modal box.
	*/
	load_data = () => {
		const level_id = typeof this.props.level_id === 'undefined' || this.props.level_id === null
			? ''
			: this.props.level_id;
		
		if(this.state.modal_level !== null) return;
		if(level_id.length < 1) return;

		fetch('/api/levels/level/'+level_id, {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				this.setState({
					modal_level: ifLevel,
					modal_level_loading: false,
				});
			})
			.catch( error => {
				this.setState({ 
					modal_level: null,
					modal_level_loading: false
				});
			});
	}
    
    // Show a modal pop up if the state requires it.
    render_modal = () => {
		// Are we still loading?
		if(this.state.modal_level_loading || this.state.modal_level === null || typeof this.state.modal_level === 'undefined') {
			return <div>Loading...<Loading loading={true } /></div>
					
		} else {
			let level = this.state.modal_level;
			let page = this.props.sequence_in_level === null || typeof this.props.sequence_in_level === 'undefined'
				? null
				: level.pages[this.props.sequence_in_level];
			
			if(page === null) {
				return <LevelScore level={this.state.modal_level} />
			} else {
				return <LevelScorePage level={level} page={ page } i={0} key={0} />
			}
		}
	}

	render(): ReactElement {
		const view_results = this.render_modal();
		const id = <i style={{ fontSize: 8}}>{this.props.level_id}</i>;

		return (<div id='modal'>
				
				<Modal show={true} onHide={ () => this._on_click_to_hide_modal() }  dialogClassName="modal-90w" size='lg' centered>
					<Modal.Header closeButton>
						<Modal.Title>Review Level { id }</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{ view_results }
					</Modal.Body>
					<Modal.Footer>
						<Button variant='primary' onClick={ () => this._on_click_to_hide_modal() }>Close</Button>
					</Modal.Footer>
				</Modal>
			</div>);
    }
}
