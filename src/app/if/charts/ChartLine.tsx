// @ts-nocheck
import React from 'react';
import { ResponsiveLine } from '@nivo/line'
import { ChartDef } from '../../../shared/ChartDef';

const _default = {
	margin: { top: 50, right: 80, bottom: 100, left: 80 },
	padding: 0.3,
	curve: 'natural',
	lineWidth: 6,
	theme: 'a',
	enableLabel: false,
	pointSize: 14,
	legends: [
		{
				anchor: 'top',
				direction: 'row',
				justify: false,
				translateX: -50,
				translateY: -20,
				itemsSpacing: 0,
				itemDirection: 'left-to-right',
				itemWidth: 140,
				itemHeight: 30,
				itemOpacity: 0.75,
				symbolSize: 15,
				symbolShape: 'circle',
				symbolBorderColor: 'rgba(0, 0, 0, .5)',
				effects: [
					{
						on: 'hover',
						style: {
							itemBackground: 'rgba(0, 0, 0, .03)',
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

export function ChartLine_StockDollar(cd_param: ChartDef): ReactElement {
	let cd = { ..._default, ...cd_param };
	const theme = THEMES[cd.theme];

	let distortion = typeof cd.distortion !== 'undefined' ? cd.distortion : 0;
	if(distortion < 1 && distortion > 0) distortion = distortion * 100;

	// setup chart min/max/interval.
	const min = distortion;
	const maxValues = cd.data.map( d => Math.max( ...( d.data.map( values => values.y ) ) ) )
	const maxValueFound = Math.max( ...maxValues);
	/*
		cd.data[0].data.reduce( (accum, item) => Math.max(item.y,accum), 0),
		cd.data[1].data.reduce( (accum, item) => Math.max(item.y,accum), 0)
	);
	*/
	const max = Math.ceil(maxValueFound/50)*50;
	const tickValues = [];
	for(let i=min; i<= max; i=i+50) {
		tickValues.push(i);
	}



	return <ResponsiveLine
		data={cd.data}
		keys={cd.keys}
		indexBy={cd.indexBy}
		margin={cd.margin}
		padding={cd.padding}
		colors={theme.colors}
		yScale={{ type: 'linear', min: min, max: max }}
		curve={cd.cardinal}
		lineWidth={cd.lineWidth}
		pointSize={cd.pointSize}
		legends={ cd.legends }
		axisLeft={{ tickValues: tickValues, tickPadding: 12, format: v=> `$${v}`}}
		axisBottom={{ tickPadding: 12 }}
		theme={{ fontSize: 20, }}
		animate={ false }
		
		interactive={ true }
	/>;
}

