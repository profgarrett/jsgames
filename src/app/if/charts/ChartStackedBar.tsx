// @ts-nocheck

import React, { ReactElement } from 'react';
import { ResponsiveBar } from '@nivo/bar'
import { ChartDef } from '../../../shared/ChartDef';

const _default = {
	margin: { top: 50, right: 130, bottom: 70, left: 60 },
	padding: 0.3,
	theme: 'a',
	enableLabel: false,
    axisLeft: {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
        },
	legends: [{
                dataFrom: 'keys',
                anchor: 'top',
                direction: 'row',
                justify: false,
                translateX: 30,
                translateY: -30,
                itemsSpacing: 10,
                itemWidth: 150,
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
        }]
};


const THEMES = {
	a: { 
		colors: { scheme: 'nivo' },
	},
	b: { 
		colors: { scheme: 'accent' },
	},
	c: { 
		colors: { scheme: 'set2' },
	},
	d: { 
		colors: { scheme: 'paired' },
	},
	e: { 
		colors: { scheme: 'category10' },
	},
}

export function ChartStackedBar_Plain(cd_param: ChartDef): ReactElement {
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

	return <ResponsiveBar
		data={cd.data}
		keys={cd.keys}
		indexBy={cd.indexBy}
		margin={cd.margin}
		padding={cd.padding}
		colors={theme.colors}
		enableLabel={true}
        labelFormat={'$'}
		//labelFormat={ d => <tspan style={{  marginBottom: 10, fontSize: 24 }} y={ -20 }>${ d+distortion }</tspan> }
		enableGridY={true}
		
        legends={ cd.legends }
		axisLeft={ cd.axisLeft }
		axisBottom={
			{ 	tickSize: 0,
				fontSize: 30
			}
		}
		theme={{ fontSize: '18px', }}
		isInteractive={false}
		animate={false} 
	/>;
}
