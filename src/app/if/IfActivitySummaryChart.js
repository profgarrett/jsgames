// @flow
import React from 'react';
import * as d3 from 'd3';

import type { LevelType, PageType, ChoicePageType } from './IfTypes';
import type { Node } from 'react';


// Add to existing [] or create a new one at obj[key].
const addTo = ( key: string, val: PageType, obj: any ) => {
	if(typeof obj[key] == 'undefined') {
		obj[key] = [val];
	} else {
		obj[key].push(val);
	}
};

// Convert a dictionary object to an array.
const toArray = (obj: any): Array<any> => {
	return Object.keys(obj).map( (key: string): Array<any> => obj[key] );
};





type PropsType = {
	levels: Array<LevelType>
};

export default class IfActivitySummaryChart extends React.Component<PropsType> {
	levels_to_pages( levels: Array<LevelType> ): any {
		const question_pages = {};

		// Add each page to one of hte above..
		levels.forEach( (l: LevelType) => {

			l.pages.forEach( (p: PageType) => {
				if(p.type === 'IfPageChoiceSchema' ) {
					addTo(p.description, p, question_pages);
				}
			});

		});

		return toArray(question_pages);
	} 

	pages_to_summary( pages: Array<ChoicePageType> ): any {
		const items = Array.from(pages[0].client_items).map( (s,i) => { return { title: s, n: 0, value: i };});

		pages.forEach( (p: ChoicePageType) => {
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


	render(): Node {
		const pages = this.levels_to_pages(this.props.levels);
		const summaries = pages.map( p => this.pages_to_summary(pages));

		const trs = []; // summaries.map( s => <tr><td>{s.title}</td><td>{s.n}</td><td>{s.percent}%</td></tr>);

		return (<table>{ trs }</table>);
	}
}


