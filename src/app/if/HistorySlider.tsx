import React from 'react';

//import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { IfPageBaseSchema } from '../../shared/IfPageSchemas';

import { formattedDateAsString } from './../components/Misc';


type HistoryPropsType = {
	history: any[],
	onChange: (arg0: number) => void
};


// Allows moving forward/backwards through history of a single page.
export default class HistorySlider extends React.Component<HistoryPropsType> {

	handleOnChange = (i_or_array: number|number[]) => {
		if(Array.isArray(i_or_array) ) {
			this.props.onChange(i_or_array[0]);
		} else {
			this.props.onChange(i_or_array);
		}
		return false;
	}

	render = (): React.ReactElement => {
		const style = { marginBottom:5, margin: 5};

		if(this.props.history.length === 0) return <></>;

		// Some old errored pages doesn't have a time. Ignore those entries.
		// @ts-ignore
		//const history = page.history.filter( h => typeof h.dt !== 'undefined'); 


		// @ts-ignore
		//const first = history[0].dt.getTime();
		// @ts-ignore
		//const last = history[page.history.length-1].dt.getTime();

		return (
			<div style={style}>
				<Slider min={1} max={this.props.history.length-1} 
						dots 
						onChange={ (i: number|number[]) => this.handleOnChange(i) } 
						defaultValue={this.props.history.length-1} />
			</div>

		);
	}
}