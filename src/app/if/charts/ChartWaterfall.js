//@ flow
import React from 'react';
import type { Node } from 'react';
import { ResponsiveBar, Bar } from '@nivo/bar'
import { ChartDef } from './../../../shared/ChartDef';

const _default = {
	margin: { top: 50, right: 130, bottom: 70, left: 60 },
	padding: 0.3,
	theme: 'a',
	enableLabel: false,
};

const borderRadius = 4;

const THEMES = {
	a: { 
		color: 'blue',
		borderRadius: 0,
		borderWidth: 0,
	},
	b: { 
		color: '#343a40',
		borderRadius: 0,
		borderWidth: 0,
	},
	c: { 
		color: 'indigo',
		borderRadius: 0,
		borderWidth: 0,
	},
	d: { 
		color: 'cyan',
		borderRadius: 0,
		borderWidth: 0,
	},
	e: { 
		color: '#6c757d',
		borderRadius: 0,
		borderWidth: 0,
	},
	f: {
		color: 'purple',
		borderRadius: 0,
		borderWidth: 0,
	},

	round_a: { 
		color: 'gray',
		borderRadius: borderRadius,
	},
	round_b: { 
		color: 'purple',
		borderRadius: borderRadius,
	},
	round_c: { 
		color: 'blue',
		borderRadius: borderRadius,
	},
	round_d: { 
		color: '#17a2b8',
		borderRadius: borderRadius,
	},
	round_e: { 
		color: 'cyan',
		borderRadius: borderRadius,
	},
	round_f: { 
		color: 'blue',
		borderRadius: borderRadius,
	},

	
}

// Return the correct color.
const getColor = ( obj: any, theme: object): string => {

    if(obj.id === 'Padding') {
        return 'rgba(0, 0, 0, 0)'; // transparent
    } else if (obj.id === 'Positive' ) {
        return theme.color;
	} else if (obj.id === 'Negative' ) {
		return 'orange';
    } else {
        throw new Error('Invalid obj.id in ChartWaterFall');
    }
}


export function ChartWaterfall_Plain(cd_param: ChartDef): Node {
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
			throw new Error('Need keys for StackedChartBar if no year is passed');
		}
	}

	let distortion = typeof cd.distortion !== 'undefined' ? cd.distortion : 0;
	if(distortion !== 0) {
		// If decimal, adjust to the % of first value.
		if(distortion < 1) {
			distortion = distortion * cd.data[0][cd.keys[0]];
		}

		// Create a new data map that adjusts the data to cut off the {distortion} portion.
		cd.data = cd.data.map( d => {
			let new_d = {};
			if(d.Year) new_d.Year = d.Year;
			cd.keys.map( key => new_d[key] = d[key] - distortion);
			return new_d;
		});
	}

	
	const maxValue = cd.maxValue;
	const axisValues = maxValue < 1000 
		? [0, 200, 400, 600, 800, 1000]
		: [0, 500, 1000, 1500, 2000, 2500];
	const gridYValues = axisValues;
    const axisLeft = {
			tickValues: axisValues,
            tickSize: 5,
            tickPadding: 5,
        };


	return <ResponsiveBar
		data={cd.data}
		keys={cd.keys}
		indexBy={cd.indexBy}
		margin={cd.margin}
		padding={cd.padding}
		colors={ o => getColor(o, theme) }
		enableLabel={false}
		borderRadius={ theme.borderRadius}
		borderWidth={ theme.borderWidth }
		borderColor={ theme.borderColor }
		gridYValues={ gridYValues }

		enableGridY={true}
		axisLeft={ axisLeft }
		axisBottom={
			{ 	tickSize: 0,
				fontSize: 30
			}
		}
		theme={{ fontSize: '18px', }}
		isInteractive={false}
		animate={false}
	/>
}
