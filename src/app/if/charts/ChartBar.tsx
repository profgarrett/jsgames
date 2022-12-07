// @ts-nocheck
import React, { ReactElement } from 'react';
import { ResponsiveBar, Bar } from '@nivo/bar'
import { ChartDef } from '../../../shared/ChartDef';


const _default = {
	margin: { top: 50, right: 130, bottom: 70, left: 60 },
	padding: 0.3,
	theme: 'a',
	enableLabel: false,
	legends: [
		{
			dataFrom: 'keys',
			anchor: 'right',
			direction: 'column',
			justify: false,
			translateX: 120,
			translateY: 0,
			itemsSpacing: 2,
			itemWidth: 100,
			itemHeight: 20,
			itemDirection: 'left-to-right',
			itemOpacity: 0.85,
			symbolSize: 20,
			effects: [
				{
					on: 'hover',
					style: {
						itemOpacity: 1
					}
				}
			]
		}
	]
};


const THEMES = {
	a: { 
		colors: { scheme: 'nivo' },
	},
	b: { 
		colors: { scheme: 'brown_blueGreen' },
	},
	c: { 
		colors: { scheme: 'purple_orange' },
	},
	d: { 
		colors: { scheme: 'paired' },
	},
	e: { 
		colors: { scheme: 'category10' },
	},
}

export function ChartBar_TopLabelNoAxis(cd_param: ChartDef): ReactElement {
	//const data = cd.data;
	let cd = { ..._default, ...cd_param };
	const theme = THEMES[cd.theme];
	
	// If Keys aren't defined, then go ahead and dynamically pull them out of the passed data.
	// If "Year is present, guess that it would be the indexBy.
	if(typeof cd.keys === 'undefined') {
		if(typeof cd_param.data[0].Year !== 'undefined') {
			cd.indexBy = 'Year';
			cd.keys = [];
			for(let key in cd_param.data[0]) {
				if(cd_param.data[0].hasOwnProperty(key) && key !== 'Year') {
					cd.keys.push(key);
				}
			}
		} else {
			throw new Error('Need keys for ChartBar_TopLabelNoAxis if no year is passed');
		}
	}

	let distortion = typeof cd.distortion !== 'undefined' ? cd.distortion : 0;

	// Find the biggest data value in the chart definition.
	// We will use this to scale the distortion, using
	// value - MaxValue*Distortion, where distortion is a number like .3 or .6
	// This simulated cutting off the bottom of the chart by setting the min
	// axis value to MaxValue*Distortion.  Each chart automatically sets the max
	// axis value to the max data value.
	const min_value = cd.data.reduce( (accum, d) => {
		let keys = Object.keys(d).filter( d => d !== 'Year'); // look in all values but the year
		let new_min = accum;

		keys.forEach( key => {
			if(d[key] < new_min) new_min = d[key];
		})
		return new_min;
	}, 99999);

	const sum_value = cd.data.reduce( (accum, d) => {
		let keys = Object.keys(d).filter( d => d !== 'Year'); // look in all values but the year

		return d[keys[0]] + accum;
	}, 0);

	const avg_value = Math.round(sum_value / cd.data.length);

	if(distortion !== 0) {
		// If decimal, adjust to the % of min value.
		if(distortion < 1) {
			distortion = Math.round(distortion * min_value);
		}
		// Create a new data map that adjusts the data to cut off the {distortion} portion.
		cd.data = cd.data.map( d => {
			let new_d = {};
			if(d.Year) new_d.Year = d.Year;
			// Calculate, maxing sure that we don't end up with negative numbers.  Set to 0 instead.
			cd.keys.map( key => new_d[key] = Math.max(0, d[key] - distortion));
			return new_d;
		});
	}

	return <ResponsiveBar
		data={cd.data}
		keys={cd.keys}
		indexBy={cd.indexBy}
		margin={cd.margin}
		padding={cd.padding}
		colors={theme.colors}
		enableLabel={true}
		labelFormat={ d => <tspan style={{  marginBottom: 10, fontSize: 24 }} y={ -20 }>${ d+distortion }</tspan> }
		enableGridY={false}
		axisLeft={ null }
		axisBottom={
			{ 	tickSize: 0,
				fontSize: 30
			}
		}
		theme={{ fontSize: '24px', }}
		isInteractive={false}
		animate={false}
	/>
}
