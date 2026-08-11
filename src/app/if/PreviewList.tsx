import React, { ReactElement } from 'react';
import { IfLevels, DEFAULT_TUTORIAL_LEVEL_LIST } from '../../shared/IfLevelSchema';
import { Table, Button } from 'react-bootstrap';
import CSS from 'csstype';


type PropsType = {
	onPreviewLevel: (level_code: string) => void;

	// Which tutorials to list, and the heading above them. Defaulted so the
	// original single-table call site keeps working; the logged-out home passes
	// the Excel and SQL slices to render this component twice.
	codes?: string[];
	title?: string;
};

export default function PreviewList(props: PropsType ) {
	const codes = props.codes || DEFAULT_TUTORIAL_LEVEL_LIST;
	const title = props.title || 'Preview a tutorial';

	const handleShow = (e) => { 
		const level = e.target.getAttribute('data-level');
		props.onPreviewLevel(level);
	};

	/**
		Return a table showing all of the tutorials.
	*/
	const _render_table = (levels_codes: string[]): ReactElement => {
		let counter = 0;

		// Get lists
		const levels = IfLevels.filter( l => levels_codes.includes(l.code) );

		// Style
		const td_l: CSS.Properties = { textAlign: 'left', verticalAlign: 'middle'};

		// Return tds.
		const trs: ReactElement[] = [];


		// Add header row.
		const header_tr = (<tr key={'preview_level_tr'+counter++} >
				<th key={'preview_level_topic'+counter++} style={td_l}>Topic</th>
				<th key={'preview_level_desc'+counter++} style={td_l}>Description</th>
				<th key={'preview_level_preview'+counter++} style={td_l}>Preview Tutorial</th>
			</tr>);


		// Add individual rows for each tutorial.
		for(let i=0; i<levels.length; i++) {

			trs.push(<tr key={'preview_level_tr'+counter++}>
				<td key={'preview_level_td'+counter++} style={td_l}>{ levels[i].title }</td>
				<td key={'preview_level_td'+counter++} style={td_l}>
					{ levels[i].description } 
				</td>
				<td key={'preview_level_td'+counter++} style={td_l}>
					<Button size='sm' variant='outline-info' data-level={levels[i].code} onClick={handleShow}>Open preview</Button>
				</td>
			</tr>);
		}

		return (<Table bordered style={{ fontSize: '80%', marginTop: 15 }}>
					<thead className='thead-dark'>{ header_tr }</thead>
					<tbody>
						{ trs }
					</tbody>
				</Table>);
	}


	const table = _render_table(codes);

	// Return card.
	return (
		<div style={{ marginTop: 50, marginBottom: 40 }}>
			<div className='h5'>{ title }</div>
			<div>
				<span style={{ marginBottom: 10}} /> 
				{ table }
			</div>
		</div>);

}
