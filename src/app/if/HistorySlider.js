// @flow
import React from 'react';

// NDG: Fix disabled rc-slider
// import 'rc-slider/assets/index.css';
// import 'rc-tooltip/assets/bootstrap.css';
// import Slider from 'rc-slider';
import { IfPageBaseSchema } from './../../shared/IfPageSchemas';

import type { Node } from 'react';


type HistoryPropsType = {
	page: IfPageBaseSchema,
	handleChange: (string) => void
};
type StateType = {};

// Allows moving forward/backwards through history of a single page.
export default class HistorySlider extends React.Component<HistoryPropsType, StateType> {

	render(): Node {
		return <p></p>;

		const page = this.props.page;
		const style = { marginBottom:5, margin: 5};

		if(page.history.length === 0) throw new Error('HistorySlider needs history.length > 0');

		// Some old errored pages doesn't have a time. Ignore those entries.
		const history = page.history.filter( h => typeof h.dt !== 'undefined'); 
		if(history.length == 0) return null;

		const first = history[0].dt.getTime();
		const last = history[page.history.length-1].dt.getTime();

		// Convert history to an obj keyed by index.
		let i = 0;
		const marks = history.reduce( (marks: any /*, history_item: any*/): any => {
			marks[i] = ''; // history_item.created.toLocaleTimeString();
			i++;
			return marks;
		}, {});

		return (
			<div style={style}>
				<Slider min={0} max={i-1} marks={marks} onChange={this.props.handleChange} defaultValue={last-first} />
			</div>

		);
	}
}