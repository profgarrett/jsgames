// @flow
import React, { useState } from 'react';


import { Table, Button, Modal } from 'react-bootstrap';

import { PrettyDate } from './../components/Misc';
import { StyledReactTable } from './../components/StyledReactTable';

import { LevelModal } from './LevelModal';
import { IfLevelPagelessSchema } from './../../shared/IfLevelSchema';
import type { Node } from 'react';
import { DEMO_MODE } from './../../server/secret';


type StateType = {
	level_id: ?string, // should we show a modal box?
};

type PropsType = {
	levels: Array<IfLevelPagelessSchema>
};

export default function Recent(props: PropsType) {
	const [ level_id, setLevel_id ] = useState(null);

	const dateAsString = (d: Object): string => {
		return d.getFullYear()+'/'+(d.getMonth()+1) +'/'+d.getDate() +
				' ' + d.getHours()+':'+ (d.getMinutes()<10 ? '0': '') + d.getMinutes();
	};

	const hide_modal = () => {
		setLevel_id(null); 
	};


	// Render
		if(props.levels.length < 1) 
			return <div/>;

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => DEMO_MODE ? '*****' : l.username,
			width: 200
		}, {
			id: 'code',
			Header: 'Code',
			accessor: l => l.code,
			width: 100
		}, {
			id: 'pages',
			Header: 'Pages',
			accessor: (l: IfLevelPagelessSchema) => l.props.pages_length,
			width: 100
		}, {
			id: 'created',
			Header: 'Created',
			accessor: l => <PrettyDate date={l.created} /> 
		}, {
			id: 'updated',
			Header: 'Last Updated',
			accessor: l => <PrettyDate date={l.updated} />
		}, {
			id: 'score',
			Header: 'Score',
			accessor: (l: IfLevelPagelessSchema) => l.completed ? l.props.test_score_as_percent : ''
		}, {
			id: 'completed',
			Header: 'Done',
			accessor: l => l.completed ? 'Y' : 'N'
		}, {
			id: 'view',
			Header: 'View',
			accessor: (l: IfLevelPagelessSchema) => <Button onClick={ 
				() => {
					setLevel_id( l._id ); 
				}
				} >View</Button>
		}];

		// Fixes old bug, where some people's levels didn't have a props value.
		const data = props.levels.filter( l => l.props !== null ); 

		const modal = level_id === null 
			? null
			: <LevelModal level={null} level_id={level_id} hide={ () => hide_modal() } />
		
		return (<div>
				{ modal }
				<StyledReactTable 
					data={data}
					filterable={true}
					columns={columns} 
				/>
			</div>
		);
	
}
