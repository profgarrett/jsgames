// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import { PrettyDate } from './../components/Misc';

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

export default class Recent extends React.Component<PropsType,StateType> {
	constructor(props: any) {
		super(props);

		this.state = {
			level_id: null
		};

		//(this: any).show = this.show.bind(this);
		(this: any).hide = this.hide_modal.bind(this);
	}

	dateAsString(d: Object): string {
		return d.getFullYear()+'/'+(d.getMonth()+1) +'/'+d.getDate() +
				' ' + d.getHours()+':'+ (d.getMinutes()<10 ? '0': '') + d.getMinutes();
	}

	hide_modal() {
		this.setState({ level_id: null });
	}

	render(): Node {
		if(this.props.levels.length < 1) 
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
					this.setState({ level_id: l._id }) 
				}
				} >View</Button>
		}];

		// Fixes old bug, where some people's levels didn't have a props value.
		const data = this.props.levels.filter( l => l.props !== null ); 

		const modal = this.state.level_id === null 
			? null
			: <LevelModal level={null} level_id={this.state.level_id} hide={ () => this.hide_modal() } />
		
		return (<div>
				{ modal }
				<ReactTable 
					data={data}

					filterable={true}
					columns={columns} 
				/>
			</div>
		);
	}
}
