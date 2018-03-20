import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'react-bootstrap';

import FieldGroup from './../components/FieldGroup';

import * as d3 from 'd3';


/*
	Data

	Assumes that data fits the following pattern.
	
	[
		{ title: '', values: [ 1,2,3 ] },
		...
	]
*/
export default class CgBarChart extends React.Component {
	constructor(props) {
		super(props);
		this.createChart = this.createChart.bind(this);
	}

	componentDidMount() {
		this.createChart();
	}

	componentDidUpdate() {
		this.createChart();
	}

	createChart() {
		// append elements
		const data = this.props.item.data;

		const width = 300, 
			height = 300;

		const x = d3.scaleBand()
			.domain(data.map( d => d.title ))
			.rangeRound([ 50, width-50])
			.padding(0.1);

		const y = d3.scaleLinear()
			.domain([0, 12])
			.range([width-50, 0]);

		const xAxis = d3.axisBottom().scale(x);
		const yAxis = d3.axisLeft().scale(y);


		const chart = d3.select(this.node);

		chart.attr('width', width).attr('height', height);

		// New
		chart.append('g')
			.attr('class', 'axis')
			.attr('class', 'xaxis')
			.attr('transform', 'translate(0, 250)')
			.call(xAxis);

		chart.append('g')
			.attr('class', 'axis')
			.attr('class', 'yxis')
			.attr('transform', 'translate(50, 0)')
			.call(yAxis);


		chart.selectAll('rect')
			.data(data)
			.enter()
			.append('rect');

		chart.selectAll('rect')
			.data(data)
			.exit()
			.remove();

		chart.selectAll('rect')
			.attr('class', 'bar')
			.attr('x', d=> x(d.title))
			.attr('y', d=> y(d.value))
			.attr('width', 10)
			.attr('height', d => width-50-y(d.value))
			.style('background-color', () => 'blue')
			.style('fill', 'steelBlue');


	}

	render() {
		let style = {
			font: '10px sans-serif',
			textAlign: 'left',
			padding: 5,
			margin: 1,
			color: 'white'
		};

		let chartstyle = {
			width: 300,
			height: 300,
			margins: { left: 10, right: 10, top: 10, bottom: 10},
			title: "Sample",
			chartSeries: [{
				field: 'value',
				name: 'title',
				color: '#ff7f0e'
			}],
			x: x => x.index
		};

		//this._chart = <div style={style} ref={ c => { this._chart = c; }}></div>;
		
		/*
		// For refreshing.
		if(typeof this._d3 !== 'undefined') {
			console.log(this.props.item.data);
			d3.select('svg').remove();
			this.componentDidMount();
		}
		*/

		return (
			<div>
				<svg ref={node => this.node = node } width={300} heigh={300}></svg>
			</div>
		);

	}
}
CgBarChart.propTypes = {
	item: PropTypes.any.isRequired
};