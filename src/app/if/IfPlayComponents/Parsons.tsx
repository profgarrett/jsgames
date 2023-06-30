import React, { ReactElement } from 'react';

import { ListGroup, ListGroupItem, Button, Form } from 'react-bootstrap';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';
import { HtmlSpan } from '../../components/Misc';
import type { IStringIndexJsonObject } from '../../components/Misc';

import CSS from 'csstype';

interface PropsType {
	page: any;
	onChange: (json: IStringIndexJsonObject) => void;
	editable: boolean;
	readonly: boolean;
	show_solution?: boolean;
}


// change background colour if dragging
const getItemStyle = (isDragging: boolean, draggableStyle: CSS.Properties): CSS.Properties => ({
  background: isDragging ? '#eee' : '#fff',
  margin: '5px',
  ...draggableStyle
});


const getListStyle = (isDraggingOver: boolean): CSS.Properties => ({
	border: isDraggingOver ? '1px solid #337ab7' : '1px solid #ddd',
	minWidth: '300px',
	marginBottom: '20px',
	minHeight: '42px',
});

const make_draggables = (a, clickToMove, listId )=> a.map(
	(item, index) => (
		<Draggable key={'ParsonsDraggable'+item.id} draggableId={'ParsonsDraggable'+item.id} index={index}>
			{(provided, snapshot) => (
				<div>
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						style={getItemStyle(
							snapshot.isDragging,
							// @ts-ignore
							provided.draggableProps.style
						)}
					>
					<div className='list-group-item' 
							onDoubleClick={ () => clickToMove(index, listId) }
							dangerouslySetInnerHTML={ { '__html': item.content } } />
					</div>
					
					{	// @ts-ignore
						provided.placeholder}
				</div>
			)}
		</Draggable>
	)
);



const make_droppable = (title, id, list) => (
	<div>
		<h3>{title}</h3>
		<StrictModeDroppable droppableId={id}>
			{(provided, snapshot) => (
				<div ref={provided.innerRef} 
					className='list-group' 
					style={getListStyle(snapshot.isDraggingOver)} 
					{...provided.droppableProps} >
					{ list }
					{ provided.placeholder }
				</div>
			)}
		</StrictModeDroppable>
	</div>
);



// Reorder the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};


// Convert the simple array into actual objects.
const toObjs = a => a.map( item => { return { id: item, content: item }; } );
const fromObjs = a => a.map( item => item.content );

// Return a filter lists of potential item, removing any that are also in used.
const get_unused_items = (potential, used) => {
	let unused: any[] = [];
	let found = false;

	// Shortcut. Dont' bother checking individual items if no used.
	if(used === null || used.length === 0) return potential; 

	for(let i=0; i<potential.length; i++) {
		found = false;

		for(let j=0; j<used.length && !found; j++) {
			if(potential[i] === used[j]) found = true;
		}
		if(!found) unused.push(potential[i]);
	}

	// Return sorted library
	if(unused.length === 0) return unused;
	if(typeof unused[0] === 'string') return unused.sort();
	if(typeof unused[0] === 'number') return unused.sort( (a,b) => a-b);

	throw new Error('Parsons does not know how to sort objects');
};

interface StateType {
	keyboard_entry_mode: boolean;
};



/**
	A Parsons problem shows a list, allowing a user to drag and drop
	any elements from a potential_items into user_items.

	Can be toggled into keyboard mode, which shows a numbered list of items
	and a text field.
*/
export default class Parsons extends React.Component<PropsType, StateType> {
	constructor(props: any) {
		super(props);
		this.state = { keyboard_entry_mode: false };
	}

	// Finish drag & drop.
	onDragEnd = (result: any) => {
		let page = this.props.page;
		let unused_items = toObjs(get_unused_items(page.potential_items, page.client_items));
		let client_items: any[] = [];

		// No updates if this is readonly.
		if(this.props.readonly) return;

		// Outside list.
		if (!result.destination) return;

		if(result.destination.droppableId === 'unused_items' && result.source.droppableId === 'unused_items') {
			// Re-order of unused list. Don't bother with saving.
			return;

		} else if(result.destination.droppableId === 'client_items' && result.source.droppableId === 'client_items') {
			// Change order in client_items
			client_items = reorder(page.client_items, result.source.index, result.destination.index);

		} else if( result.destination.droppableId === 'client_items' && result.source.droppableId === 'unused_items') {
			// Insert into list 
			client_items = page.client_items === null ? [] : page.client_items.slice(); //(null means that no user input has been set yet)
			client_items.splice(result.destination.index, 0, unused_items[result.source.index].content);

		} else if (result.destination.droppableId === 'unused_items' && result.source.droppableId === 'client_items') {
			// Remove.
			client_items = page.client_items.slice();
			client_items.splice(result.source.index, 1);

		}
		// Note that we don't care about sorting the unused list.  That list is automatically generated
		// each time render() is called.

		//unused_items = (get_unused_items(page.potential_items, client_items));
		//console.log({unused_items: unused_items, 'client_items': client_items });
		this.props.onChange({ client_items });
	}

	// respond to a double-click by moving the given object to the tail of the other list.
	clickToMove = (index: any, listId: any) => {
		let page = this.props.page;
		let unused_items = toObjs(get_unused_items(page.potential_items, page.client_items));
		let client_items: any[] = [];

		if(listId === 'unused_items') {
			client_items = page.client_items === null ? [] : page.client_items.slice();
			client_items.push(unused_items[index].content);
		} else if (listId === 'client_items') {
			client_items = page.client_items === null ? [] : page.client_items.slice();
			client_items.splice(index, 1);
		} else {
			throw new Error('Invalid listId passed to Parsons.clickToMove '+ listId);
		}

		this.props.onChange({ client_items });
	}

	switchMode = () => {
		this.setState((prevState) => { return { keyboard_entry_mode: !prevState.keyboard_entry_mode}; });
	}

	render = (): ReactElement => {
		const page = this.props.page;
		let client_items = null === page.client_items ? [] : page.client_items;

		if(!this.props.editable) {
			if(typeof this.props.show_solution != 'undefined' && this.props.show_solution === true && typeof page.solution != 'undefined') {
				return (
					<ListGroup>
						{ client_items.map( (item,i) => <ListGroupItem key={i}><HtmlSpan html={""+item}/></ListGroupItem> ) }
						Correct answer { page.solution }
					</ListGroup>
				);
			} else {
				return (
					<ListGroup>
						{ client_items.map( (item,i) => <ListGroupItem key={i}><HtmlSpan html={""+item}/></ListGroupItem> ) }
					</ListGroup>
				);
			}
		}

		return (<div>
			{ this.state.keyboard_entry_mode ? this.render_keyboard() : this.render_mouse() }
			<Button variant='outline-info' onClick={this.switchMode}>Switch to { this.state.keyboard_entry_mode ? 'mouse' : 'keyboard' } mode</Button>
		</div>);
	}

	// Update the value of the client items
	onKeyboardChange = (): void => {
		const id = 'inputOrder';
		const orderEl: null | HTMLElement = document.getElementById(id);
		if(orderEl == null) {
			throw new Error('Did not find item in ParsonsText');
		}
		const max_answer_id = this.props.page.potential_items.length-1;
		const newOrderAsString = (orderEl as HTMLInputElement).value;
		const dirty_newOrderArray = newOrderAsString.trim().replaceAll( ' ', '').split(',');
		let clean_newOrderArray = dirty_newOrderArray
				.map( old => parseInt(old, 10) )
				.filter( i_or_na => !isNaN(i_or_na) );
		clean_newOrderArray = clean_newOrderArray.filter( i => i > 0 && (i-1) <= max_answer_id);
		const newOrderValues: any[] = [];

		clean_newOrderArray.forEach(i => {
			newOrderValues.push( this.props.page.potential_items[(i-1)] );
		});

		this.props.onChange({ client_items: newOrderValues });
	}

	render_keyboard = (): ReactElement => {
		const page = this.props.page;
		//let unused_items = toObjs(get_unused_items(page.potential_items, page.client_items));
		//let used_items = toObjs(page.client_items ? page.client_items : []);
		let client_items = null === page.client_items ? [] : page.client_items;


		return (<div>
			<h3>Potential Items</h3>
			<ListGroup as='ol' numbered>
				{ page.potential_items.map( (item,i) => <ListGroupItem as='li' key={i}><HtmlSpan html={"" + item}/></ListGroupItem> ) }
			</ListGroup>
			<Form.Label htmlFor="inputOrder">Item Order</Form.Label>
				<Form.Control
					id="inputOrder"
					aria-describedby="inputHelpBlock"
					onChange={this.onKeyboardChange}
				/>
				<Form.Text id="inputHelpBlock" muted>
					Type the item number of each entry, in the order you want (separated by commas). For example, if you want three items to be in reverse 
					order, you would input "3,2,1". Do not type the values of each item, but their number in the list above.
				</Form.Text>
			<h3>Selected Items</h3>
			<ListGroup as='ol' numbered>
				{ client_items.map( (item,i) => <ListGroupItem as='li' key={i}><HtmlSpan html={"" + item}/></ListGroupItem> ) }
			</ListGroup>
		</div>);
	}

	// Build out the table 
	render_mouse = (): ReactElement => {
		const page = this.props.page;

		let unused_items = toObjs(get_unused_items(page.potential_items, page.client_items));
		let used_items = toObjs(page.client_items ? page.client_items : []);
		let client_items = null === page.client_items ? [] : page.client_items;

		return (
			<DragDropContext onDragEnd={this.onDragEnd}>
				<table style={{ marginBottom: 10 }}><tbody>
					<tr >
						<td style={{verticalAlign: 'top', padding: '10px'}}>
							{ make_droppable('Drag from here', 'unused_items', 
								make_draggables(unused_items, this.clickToMove, 'unused_items'))}
						</td>
						<td style={{paddingLeft: 10, verticalAlign: 'top', padding: '10px'}}>
							{ make_droppable('To here', 'client_items', 
								make_draggables(used_items, this.clickToMove, 'client_items'))}
						</td>
					</tr>
				</tbody></table>
			</DragDropContext>
			);
	}
}
