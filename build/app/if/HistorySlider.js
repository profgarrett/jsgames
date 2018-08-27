//      
import React from 'react';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';

                                          
                                  


                         
                
                               
  
                    

// Allows moving forward/backwards through history of a single page.
export default class HistorySlider extends React.Component                              {

	render()       {
		const page = this.props.page;
		const style = { marginBottom:5, margin: 5};

		if(page.history.length === 0) throw new Error('HistorySlider needs history.length > 0');

		const first = page.history[0].dt.getTime();
		const last = page.history[page.history.length-1].dt.getTime();

		// Convert history to an obj keyed by index.
		let i = 0;
		const marks = page.history.reduce( (marks         /*, history_item: Object*/)      => {
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