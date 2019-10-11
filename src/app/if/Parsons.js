// @flow
import React from 'react';
import PropTypes from 'prop-types';

import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { HtmlSpan } from './../components/Misc';

type PropsType = {
	page: any,
	handleChange: Function,
	editable: boolean
}


// change background colour if dragging
const getItemStyle = (isDragging, draggableStyle) => ({
  background: isDragging ? '#eee' : '#fff',
  margin: 5,
  ...draggableStyle
});


const getListStyle = isDraggingOver => ({
	border: isDraggingOver ? '1px solid #337ab7' : '1px solid #ddd',
	minWidth: 300,
	marginBottom: 20,
	minHeight: 42
});

const make_draggables = (a, clickToMove, listId )=> a.map(
	(item, index) => (
		<Draggable key={item.id} draggableId={item.id} index={index}>
			{(provided, snapshot) => (
				<div>
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						style={getItemStyle(
							snapshot.isDragging,
							provided.draggableProps.style
						)}
					>
					<div className='list-group-item' 
							onDoubleClick={ () => clickToMove(index, listId) }
							dangerouslySetInnerHTML={ { '__html': item.content } } />
					</div>
					
					{	// $FlowFixMe
						provided.placeholder}
				</div>
			)}
		</Draggable>
	)
);



const make_droppable = (title, id, list) => (
	<div>
		<h3>{title}</h3>
		<Droppable droppableId={id}>
			{(provided, snapshot) => (
				<div ref={provided.innerRef} 
					className='list-group' 
					style={getListStyle(snapshot.isDraggingOver)} 
					{...provided.droppableProps} >
					{ list }
					{ provided.placeholder }
				</div>
			)}
		</Droppable>
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
	let unused = [];
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



/**
	A Parsons problem shows a list, allowing a user to drag and drop
	any elements from a potential_items into user_items.
*/
export default class Parsons extends React.Component<PropsType> {
	constructor(props: PropsType) {
		super(props);
		(this: any).onDragEnd = this.onDragEnd.bind(this);
		(this: any).clickToMove = this.clickToMove.bind(this);
	}

	// Finish drag & drop.
	onDragEnd(result: any) {
		let page = this.props.page;
		let unused_items = toObjs(get_unused_items(page.potential_items, page.client_items));
		let client_items = [];

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
		// Note that we don't care are sorting the unused list.  That list is automatically generated
		// each time render() is called.

		//unused_items = (get_unused_items(page.potential_items, client_items));
		//console.log({unused_items: unused_items, 'client_items': client_items });
		this.props.handleChange({ client_items });
	}

	// respond to a double-click by moving the given object to the tail of the other list.
	clickToMove(index: any, listId: any) {
		let page = this.props.page;
		let unused_items = toObjs(get_unused_items(page.potential_items, page.client_items));
		let client_items = [];

		if(listId === 'unused_items') {
			client_items = page.client_items === null ? [] : page.client_items.slice();
			client_items.push(unused_items[index].content);
		} else if (listId === 'client_items') {
			client_items = page.client_items === null ? [] : page.client_items.slice();
			client_items.splice(index, 1);
		} else {
			throw new Error('Invalid listId passed to Parsons.clickToMove '+ listId);
		}

		this.props.handleChange({ client_items });
	}

	// Build out the table 
	render() {
		const page = this.props.page;

		let unused_items = toObjs(get_unused_items(page.potential_items, page.client_items));
		let used_items = toObjs(page.client_items ? page.client_items : []);
		let client_items = null === page.client_items ? [] : page.client_items;

		if(!this.props.editable) {
			return (
				<ListGroup>
					{ client_items.map( (item,i) => <ListGroupItem key={i}><HtmlSpan html={""+item}/></ListGroupItem> ) }
				</ListGroup>
			);
		} else {
			return (
			<DragDropContext onDragEnd={this.onDragEnd}>
				<table style={{ marginBottom: 10 }}><tbody>
					<tr >
						<td style={{verticalAlign: 'top'}}>
							{ make_droppable('Drag from here', 'unused_items', 
								make_draggables(unused_items, this.clickToMove, 'unused_items'))}
						</td>
						<td style={{paddingLeft: 10, verticalAlign: 'top'}}>
							{ make_droppable('To here', 'client_items', 
								make_draggables(used_items, this.clickToMove, 'client_items'))}
						</td>
					</tr>
				</tbody></table>
			</DragDropContext>
			);
		}
	}
}
