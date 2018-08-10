//      
import React from 'react';
import * as d3 from 'd3';

                                                     
                                  



                  
                         
  

export default class IfActivityMistakesChart extends React.Component            {

	build_data( levels                   )      {
		const tutorial_pages = {},
			test_pages = {};

		// Add to existing [] or create a new one at obj[key].
		const addTo = ( key        , val          , obj      ) => {
			if(typeof obj[key] == 'undefined') {
				obj[key] = [val];
			} else {
				obj[key].push(val);
			}
		};

		// Add each page to one of hte above..
		levels.forEach( (l           ) => {

			l.pages.forEach( (p          ) => {
				
				// @TODO: Add here to track history of when page was updated/submitted/correct/incorrect.
				//p.username = l.username;

				if(p.code === 'test' ) {
					addTo(p.description, p, test_pages);
				} else if(p.code === 'tutorial') {
					addTo(p.description, p, tutorial_pages);
				} else {
					// Don't add ending questions with null types.
				}
			});

		});

		// Convert a dictionary object to an array.
		const toArray = (obj     )             => {
			return Object.keys(obj).map( (key        )             => obj[key] );
		};

		return [toArray(tutorial_pages), toArray(test_pages)];
	} 


	render()       {
		const [tutorial_pages, test_pages] = this.build_data(this.props.levels);
		const divs = [];
		const height_per_revision = 4;

/*
		const maxPages = levels.reduce( 
			(max: number, l: LevelType): number => Math.max(l.pages.length, max)
			,0
			);


		// Count the max # of revisions for the standardized charts.
		const max = this.props.levels.reduce( 
			(max: number, l: LevelType): number => 
				l.pages.reduce(
					(max: number, p: PageType): number => Math.max(p.history.length, max)
					,0
				)
			,0
			);	
*/

		let max_revisions = 0;

		tutorial_pages.forEach( (Ap                 , i        ) => {
			max_revisions = Ap.reduce( (max        , p          )         => Math.max(max, p.history.length), 0);
			divs.push(<div key={i}><IfActivityLevelChartPage pages={Ap} width={600} height={max_revisions*height_per_revision} /></div>);
		});
		
		test_pages.forEach( (Ap                 , i        ) => {
			max_revisions = Ap.reduce( (max        , p          )         => Math.max(max, p.history.length), 0);
			divs.push(<div key={i}><IfActivityLevelChartPage pages={Ap} width={600} height={max_revisions*height_per_revision} /></div>);
		});

		return divs;
	}
}



                      
                        
               
               
  

class IfActivityLevelChartPage extends React.Component                {
	constructor(props     ) {
		super(props);
		(this     ).createChart = this.createChart.bind(this);
	}

	componentDidMount() {
		this.createChart();
	}

	componentDidUpdate() {
		this.createChart();
	}

	createChart() {
		const dirty_data = this.props.pages;

		const isin = (a, b) => a.client_f.indexOf(b.client_f);

		// Return a clone of page with a pruned history collection.
		// That means that in progress items, such as [=, =A, =A1] turns into [=A1]
		const enhance_history = (p          )           => {

			if(p.history.length === 0) return p;

			let previous = p.history[0];

			// Ensure only history items with a client_f are processed.
			p.history = p.history.filter( h => typeof p.client_f !== 'undefined' );

			p.history.forEach( (h     ) => {
				if( h.client_f.length < previous.client_f.length) {
					h.deleting = true;
				} else {
					h.deleting = false;
				}

				// Hide last if h can fully contain it's client_f.
				if( !h.deleting && isin(previous, h) ) {
					// =isin( '=', '=a) ==> true!
					// =isin( '=a', '=a1') ==> true!
					// =isin( '=a1', '=a1 +') ==> true!
					previous.show = false;
				}
				// Show previous if we changed from shrinking to growing
				if( !h.deleting && previous.deleting) {
					previous.show = true;
				}
				// Show current if !deleting, and set to previous.
				h.show = !h.deleting;
				previous = h;
			});

			// If the last was shrinking, then show it.
			if(p.history.length > 0 && p.history[p.history.length-1].deleting ) {
				p.history[p.history.length-1].show = true;
			}

			return p;
		};


		// Add an index to each value.
		const data = dirty_data.map( (p          , i        )      => 
			{ return { 'i': i, ...enhance_history(p) }; });

		const maxRevisions = data.reduce( 
			(max        , p          )         => Math.max(p.history.length, max)
			,0 
			);

		const width = this.props.width, 
			height = this.props.height,
			margin = { t: 10, l: 20, r: 10, b: 50 },
			bar_width = 20;

		const xScale = d3.scaleBand()
			.domain(data.map( (p          , i        )         => i ))
			.rangeRound([ 0, width-margin.l-margin.r ])
			.padding(0.1);

		const yScale = d3.scaleLinear()
			.domain([0, maxRevisions])
			.range([0, height-margin.t-margin.b ]);

		/*
		const xAxis = d3.axisBottom()
			.scale(xScale)
			.ticks(1);
		*/
		const yAxis = d3.axisLeft()
			.scale(yScale)
			.ticks(5);

		const chart = d3.select(this.node);
		chart.attr('width', width).attr('height', height);



		/*
		chart.append('g')
			.attr('transform', 'translate(' + bar_width/2 + ', ' +(height-margin.t-margin.b) + ')')
			.attr('class', 'axis')
			.call(xAxis)
		.selectAll('text')
			.attr('y', 0)
			.attr('x', 9)
			.attr('dy', '.35em')
			.attr('transform', 'rotate(90)')
			.style('text-anchor', 'start');
		*/

		chart.append('g')
			.attr('transform', 'translate(' + margin.l + ', ' + margin.t + ')')
			.attr('class', 'axis')
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
			.attr('x', (p          )         => xScale(p.i)+margin.l)
			.attr('y', (p          )         => yScale(0)+margin.t)
			.attr('width', bar_width)
			.attr('height', (p          )         => yScale(p.history.length))
			.style('background-color', () => 'blue')
			.style('fill', 'steelBlue');

		chart.selectAll('rect')
			.on('mouseover', function(d) {
				const t = d3.select('#tooltip');

				const histories = [];

				d.history.filter( h => h.show).forEach( (h     , i        ) => {
					let t = 
						(i+1) < d.history.length ? 
						Math.round((d.history[i+1].created - h.created)/100)/10  : 
						0;

					histories.push('<tr><td width="70%">'+h.client_f+ 
						'</td><td style="text-align: right">' + t + '</td><tr>');
				});

				t.transition()
					.duration(200)
					.style('opacity', .9);
				t.html('<table style="width: 100%">'+histories.join('') + '</table>');
					//.style('left', d3.event.pageX + 'px')
					//.style('top', d3.event.pageY + 'px');
			})
			.on('mouseout', function(d) {
				const t = d3.select('#tooltip');

				t.transition()
					.duration(500)
					.style('opacity', 0);

			});

	}

	render()       {
		let style = {
			font: '10px sans-serif',
			textAlign: 'left',
			padding: 5,
			margin: 1,
			color: 'white'
		};
		const tooltipStyle = {	
			position: 'fixed',
			textAlign: 'left',
			right: 0,
			top: 0,
			width: 350,		
			height: 400,
			padding: 2,
			font: '12px sans-serif',
			background: 'lightsteelblue',
			border: 0,
			borderRadius: 8,
			pointerEvents: 'none',
			opacity: 0
		};



		let chartstyle = {
			width: this.props.width,
			height: this.props.height,
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
				<div id='tooltip' style={tooltipStyle} />
				<svg ref={node => this.node = node } width={this.props.width} heigh={this.props.height}></svg>
			</div>
		);

	}
}
