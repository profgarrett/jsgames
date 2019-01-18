// @flow
import React from 'react';
import { HelpBlock, FormControl } from 'react-bootstrap';
import { HtmlSpan } from './../components/Misc';
import BlocklyFactory from './../../shared/BlocklyFactory';

import ExcelTable from './ExcelTable';

import type { HarsonsPageType } from './IfTypes';
import type { Node } from 'react';



type HarsonsPropsType = {
	page: HarsonsPageType,
	editable: boolean,
	readonly: boolean,
	handleChange: (string) => void
};
type HarsonsStateType = {
	// Workspace is used to access blockly during transitions to tear and
	// and restore blocks.
	workspace: any,

	// Handle used to remove the onresize event handler on tear-down.
	onresize_handler: any  
};

// This is a standard table for showing excel stuff.
export default class Harsons extends React.Component<HarsonsPropsType, HarsonsStateType> {

	componentDidMount() {
		var that = this,
			page = this.props.page;

		// Don't show complex blockly interface if this is not editable.
		if(!this.props.editable) {
			return;
		}

		// Setup blocks used by this page.
		const toolbox_xml = BlocklyFactory.get_toolbox_xml(page);

		const options = { 
			toolbox : toolbox_xml, 
			grid: {
				spacing: 30,
				length: 3,
				colour: '#ccc',
				snap: false
			},
			zoom: {
				controls: false,
				wheel: false,
				startScale: 1.5,
				maxScale: 1.5,
				minScale: 1.5
			},
			collapse : false, 
			comments : false, 
			disable : false, 
			maxBlocks : 15, 
			trashcan : false, // it'd be nice to add, but long formulas may go over the top of this. 
			horizontalLayout : true, 
			toolboxPosition : 'start', 
			css : true, 
			media : '/static/blockly_2018_08_23/media/', 
			rtl : false, 
			scrollbars : false, 
			sounds : false, 
			oneBasedIndex : true
		};


		const blocklyDiv = document.getElementById('blocklyDiv');
		const blocklyArea = document.getElementById('blocklyArea');

		var workspace = Blockly.inject('blocklyDiv', options);

		const onresize = function(e) {
			// Compute the absolute coordinates and dimensions of blocklyArea.
			// Note that we have to look for the #iflevelplay field, as it
			// has some positioning.  We are positioning relative to it, and 
			// not the overall screen.
			const offset = blocklyArea.getBoundingClientRect();
			const o2 = document.getElementById('iflevelplay').getBoundingClientRect();
			const x = offset.left - o2.left;
			const y = offset.top - o2.top;

			// Position blocklyDiv over blocklyArea.
			blocklyDiv.style.left = x + 'px';
			blocklyDiv.style.top = y + 'px';
			blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
			blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
			Blockly.svgResize(workspace);
		};

		// Add event handler.  Save a reference so we can umount it.
		this.setState({onresize_handler: onresize});
		window.addEventListener('resize', onresize, false);

		// Fix size.
		onresize();
		Blockly.svgResize(workspace);

		// Add change listener to blockly.  As changes happen in blockly,
		// this will fire the event to update the solution.
		workspace.addChangeListener( event => {

			// we are still drag+dropping.
			if(workspace.isDragging()) return;
			
			// Look to see if this change puts a new block as a top-level item.
			// Only allow = as top-level items.
			if(event.type === Blockly.Events.BLOCK_MOVE) {
				const workspace = Blockly.Workspace.getById(event.workspaceId);
				const block = workspace.getBlockById(event.blockId);


				//console.log({ block, event});
				// Make sure that we still have a block (ie, it hasnt' been deleted)
				// and that it isn't the equal (root of the tree)
				if(block !== null && block.type !== 'equal') {
					// If not an equal, then we should disable any nodes.
					if(typeof event.newParentId === 'undefined') {
						block.setDisabled(true);
					} else {
						block.setDisabled(false);
					}
				}
			}
			const code = Blockly.JavaScript.workspaceToCode(workspace);

			if(code !== this.props.client_f) {
				that.props.handleChange({ client_f: code });
			}

		});

		this.setState({ workspace });

	}

	// Prop updates?
	componentDidUpdate(prevProps: HarsonsPropsType) {
		// Don't do this unless we have a workspace.
		if(typeof this.state.workspace === 'undefined') return;

		if(prevProps.page.description !== this.props.page.description ||
			prevProps.page.instruction !== this.props.page.instruction ) {
			// We have a new page. Clear old toolbox and solution and reload toolbox with
			// current solution.
			this.state.workspace.clear();
			const toolbox_xml = BlocklyFactory.get_toolbox_xml(this.props.page);
			this.state.workspace.updateToolbox(toolbox_xml);
			this.state.onresize_handler();
		}
	}

	// Clean-up.
	compomentWillUnmount() {
		window.removeEventListener('resize', this.state.onresize_handler, false);
	}

	// Build out the input box.
	_render_field(page: HarsonsPageType): Node {

		let helpblock = page.helpblock ? <HelpBlock style={helpblockStyle}><HtmlSpan html={ page.helpblock } /></HelpBlock> : '';
	
		return (
			<div>
				<FormControl 
					id='BlocklyRenderFieldInput'
					type='text'
					value={ page.client_f==null ? '' : page.client_f }
					disabled={ true }
				/>
				{ helpblock }		
			</div>
			);
	}


	// Build out the table 
	render(): Node {
		const page = this.props.page;
		// Set columns to [null] for cases where we don't have any tests.
		// Need to have something for the for loop, but null won't be displayed.
		if(page.tests.length === 0) throw new Error('Invalid length of tests for '+page.code);

		const blocklyAreaStyle = {
			height: 175,
			//position: 'absolute',
			backgroundColor: 'red'
		};

		// Don't show complex blockly interface if this is not editable.
		if(!this.props.editable) {
			return <p>{ this.props.page.client_f }</p>;
		}

		const helpblockStyle = {
			color: 'white',
			backgroundColor: '#337ab7',
			marginBottom: 5,
			padding: 7
		};
		const helpblock = page.helpblock ? <HelpBlock style={helpblockStyle}>Hint: <HtmlSpan html={ page.helpblock } /></HelpBlock> : '';

		// Return full interface.
		return (
			<div>
				<div id='blocklyArea' style={blocklyAreaStyle}></div>
				<div id='blocklyDiv' style={{'position': 'absolute'}}></div>
				{ helpblock }
				<ExcelTable page={page} 
						readonly={ true }
						editable={ false } 
						handleChange={ () => {} } />
			</div>
			);
	}
}
