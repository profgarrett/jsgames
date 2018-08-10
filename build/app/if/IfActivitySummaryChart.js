//      
import React from 'react';
import * as d3 from 'd3';

                                                                     
                                  


// Add to existing [] or create a new one at obj[key].
const addTo = ( key        , val          , obj      ) => {
	if(typeof obj[key] == 'undefined') {
		obj[key] = [val];
	} else {
		obj[key].push(val);
	}
};

// Convert a dictionary object to an array.
const toArray = (obj     )             => {
	return Object.keys(obj).map( (key        )             => obj[key] );
};





                  
                         
  

export default class IfActivitySummaryChart extends React.Component            {
	levels_to_pages( levels                   )      {
		const question_pages = {};

		// Add each page to one of hte above..
		levels.forEach( (l           ) => {

			l.pages.forEach( (p          ) => {
				if(p.type === 'IfPageChoiceSchema' ) {
					addTo(p.description, p, question_pages);
				}
			});

		});

		return toArray(question_pages);
	} 

	pages_to_summary( pages                        )      {
		const items = Array.from(pages[0].client_items).map( (s,i) => { return { title: s, n: 0, value: i };});

		pages.forEach( (p                ) => {
			if(typeof items[p.client] === 'undefined') items[p.client] = { n: 0 };
			items[p.client].n++;
		});

		Object.entries(items).forEach( ([key, item]) => {
			item.percent = item.n / pages.length;
			item.title = key;
		});

		debugger;

		return toArray(items);
	}


	render()       {
		const pages = this.levels_to_pages(this.props.levels);
		const summaries = pages.map( p => this.pages_to_summary(pages));

		const trs = []; // summaries.map( s => <tr><td>{s.title}</td><td>{s.n}</td><td>{s.percent}%</td></tr>);

		return (<table>{ trs }</table>);
	}
}


