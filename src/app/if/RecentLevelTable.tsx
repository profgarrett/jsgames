import React, { ReactElement, useState } from 'react';

import { Button } from 'react-bootstrap';
import { prettyDateAsString } from '../components/Misc';
import { StyledReactTable } from '../components/StyledReactTable';
import { getUserFromBrowser } from '../components/Authentication';
import { LevelModal } from './LevelModal';
import { IfLevelPagelessSchema } from '../../shared/IfLevelSchema';

import { DEMO_MODE } from '../configuration';

import { Link } from 'react-router-dom';


type PropsType = {
	levels: Array<IfLevelPagelessSchema>
};


interface TablePropColumnType {
	id: string;
	Header: string;
	width: number|null; 
	accessor: Function|null;
}



export default function Recent(props: PropsType): ReactElement {
	const [ level_id, setLevel_id ] = useState('');

	/*
	const dateAsString = (d: any): string => {
	};
	*/

	const hide_modal = () => {
		setLevel_id(''); 
	};


	const user = getUserFromBrowser();
	const isAdmin = user.isAdmin;

	// Render
		if(props.levels.length < 1) 
			return <div/>;

		const columns: TablePropColumnType[] = [];
		
		columns.push({
			id: 'username',
			Header: 'Username', 
			accessor: l => DEMO_MODE ? '*****' : l.username,
			width: 200
		});
		columns.push({
			id: 'code',
			Header: 'Code',
			accessor: l => l.code,
			width: 100
		});
		columns.push({
			id: 'pages',
			Header: 'Pages',
			accessor: (l: IfLevelPagelessSchema) => l.props.pages_length,
			width: 100,
		});
		columns.push({
			id: 'created',
			Header: 'Created',
			accessor: (l: IfLevelPagelessSchema) => prettyDateAsString(l.created), 
			width: 100,
		});
		columns.push({
			id: 'updated',
			Header: 'Last Updated',
			accessor: (l: IfLevelPagelessSchema) => prettyDateAsString(l.created), 
			width: 100,
		});
		columns.push({
			id: 'score',
			Header: 'Score',
			accessor: (l: IfLevelPagelessSchema) => l.completed ? l.props.test_score_as_percent : '',
			width: 100,
		});
		columns.push({
			id: 'completed',
			Header: 'Done',
			accessor: l => l.completed ? 'Y' : 'N',
			width: 50,
		});
		columns.push({
			id: 'view',
			Header: 'View',
			accessor: function viewButton(l: IfLevelPagelessSchema): ReactElement {
				return <Button onClick={ () => setLevel_id( l._id ) }>View</Button>;
			},
			width: 50,
		});

		if(isAdmin) {
			columns.push({
				id: 'edit',
				Header: 'Edit',
				accessor: function viewRaw(l: IfLevelPagelessSchema): ReactElement {
					return <Link to={'/ifgame/level/'+l._id+'/raw'}>edit</Link>;
				},
				width: 50,
			});
		}

		// Fixes old bug, where some people's levels didn't have a props value.
		const data = props.levels.filter( l => l.props !== null ); 

		const modal = level_id === '' 
			? <></>
			: <LevelModal level={null} level_id={level_id} hide={ () => hide_modal() } />;
		
		return (<div>
				{ modal }
				<StyledReactTable 
					data={data}
					columns={columns} 
				/>
			</div>
		);
	
}
