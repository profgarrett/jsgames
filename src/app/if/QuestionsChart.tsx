import React, { ReactElement } from 'react';
import { IfPageBaseSchema} from './../../shared/IfPageSchemas';

import { IfLevelSchema } from './../../shared/IfLevelSchema';
import { formatDate, padL } from './../../shared/misc';

type DetailPropsType = {
	levels: Array<IfLevelSchema>
};


/*
    Recursive function that takes in any datatype and returns a nicely formatted string.
*/
const to_string = ( a: any ): string => {
    if(a === null) return '';
    if(typeof a === 'number') return ''+a;
    if(typeof a === 'string') return a;
    if(typeof a === 'object') {
        // Array?
        if(typeof a.map === 'function') {
            return ' [' +a.map( s => to_string(s) ).join(', ') + ']';
        } else {
            return Object.keys(a).map( key => {
                return key+': '+to_string(a[key]);
            }).join(', ');
        }

    }

    throw new Error('Invalud type ' + typeof a + ' passed to to_string in if questions chart');
}

// Test to_string with various inputs. 
if(false) {
    console.log( to_string('a'));
    console.log( to_string(null));
    console.log( to_string(1));
    console.log( to_string([1,2,3]));
    console.log( to_string({ x: 1, y: 2} ));
    console.log( to_string({ x: [1,2,3], y: 'abc2'}));
}



export default class IfQuestionsChart extends React.Component<DetailPropsType> {

    /* 
        Find unique page keys
    */
    get_keys_from_levels(levels: Array<IfLevelSchema>): any {
        const keys = {};

        // Iterate through the entire list, finding unique pages
        levels.forEach( (l: IfLevelSchema) => {
            l.pages.forEach( (p: IfPageBaseSchema) => {
                if(p.template_id !== null) {
                    if(typeof keys[p.template_id] === 'undefined') {
                        keys[p.template_id] = true;
                    }
                }
            })
        });

        return keys;
    }


    /* 
        Bring in data as levels, and turn into a normal table.
        All returned objects should have identical names.

        [
            { _id: 1, username, ... },
            { _id: 2, username, ... },
        ]

    */
    flatten_levels(levels: Array<IfLevelSchema>, oKeys: any): Array<Object> {
        const results: any[] = [];
        const aKeys = Object.keys(oKeys);

        levels.forEach( (l: IfLevelSchema) => {
            // initialize result
            const result = {
                _id: l._id,
                created: formatDate(l.created),
                updated: formatDate(l.updated),
                username: l.username,
            };

            aKeys.forEach( (key: string) => {
                result[key] = null;
            });

            // Update values with the results of each item.
            l.pages.forEach( (p: IfPageBaseSchema) => {
                if(p.template_id !== null) {
                    if(p.time_limit_expired) {
                        // User ran out of time to answer.
                        result[p.template_id] = '';    
                    } else {
                        //result[p.template_id] = p.get_server_time_in_seconds() ;
                        result[p.template_id] = p.toString();
                    }
                }
            });

            results.push(result);
        });

        return results;
    }

    // Return a table showing a list of questions.
    render_questions(oKeys: any, aKeys: Array<Object>, levels: Array<Object>): ReactElement {

		const td_style = {
			'border': 'solid 1px black',
			'padding': 5,
			'textAlign': 'right'
		};
        const th_style = { ...td_style, 'textAlign': 'center' };

        const headers = [
            'template_id',
            'type',
            'data',
            'instruction',
            'description',
            'time_limit',
            'chart_def_type',
            'chart_def_data',
            'solution',

        ];
		// @ts-ignore
        const ths = headers.map( (s,i) => <th style={th_style} key={'th'+i}>{s}</th>);

        const templates = {};

        levels.forEach( (l: any) => {
            l.pages.forEach( p => {
                // Build question information.
                if(p.template_id !== null) {
                    if( typeof templates[p.template_id] === 'undefined') {
                        // We haven't built it yet.
                        templates[p.template_id] = {
                            template_id: p.template_id,
                            type: p.type,
                            chart_def_type: p.chart_def !== null ? p.chart_def.type : '',
                            chart_def_data: p.chart_def !== null ? to_string(p.chart_def.data) : '',
                            instruction: p.instruction,
                            description: p.description,
                            time_limit: p.time_limit,
                            solution: p.solution,
                        };
                    }
                }
            })
        });

        const trs = Object.keys( templates ).map( (key, tr_i) => {
			// @ts-ignore
			const tds = headers.map( (th, th_i) => <td style={td_style} key={'td_'+tr_i+'_'+th_i}>{ templates[key][th] }</td> );
            return <tr key={'tr_'+tr_i}>{ tds }</tr>;
        })

        return (<table>
                <thead><tr>{ ths }</tr></thead>
                <tbody>{ trs }</tbody>
            </table>);
    }

    // return a table of results, with one row per user, showing what they actually answered.
    // Uses aKeys to figure out with properties to include as columns.
	render_results(oKeys: any, aKeys: Array<any>, levels: Array<any>): ReactElement {

		const td_style = {
			'border': 'solid 1px black',
			'padding': 5,
			'textAlign': 'right'
		};


		// @ts-ignore
        const ths = aKeys.map( (key,i) => <th key={'chart_ths_'+i} style={td_style}>{key}</th>);

        const trs = levels.map( (l, i) => {
            
            return (<tr key={'chart_tr_'+i}>{
				// @ts-ignore
				aKeys.map( (key,i) => <td key={'chart_td_'+i} style={td_style}>{l[key]}</td> )
            }</tr>);
        })

		// If empty, return a div.
		if(levels.length < 1) return <table/>;

		return (<table>
				<thead><tr>{ ths }</tr></thead>
				<tbody>{ trs }</tbody>
				</table>);
	}

    render = (): ReactElement => {
        const oKeys = this.get_keys_from_levels(this.props.levels);
        const aKeys = Object.keys(oKeys).sort( (a, b) => a>b ? 1 : 0 );
		const flat_levels = this.flatten_levels(this.props.levels, oKeys);

        // Add a couple of additional columns to aKeys in the correct positions.
        aKeys.push( '_id' );
        aKeys.push('created');
        aKeys.push('updated');
        aKeys.push('username');

        /*
        console.log({
            props: this.props.levels,
            keys: oKeys,
            levels: levels
        });
        */

        return (<div>
            <h3>Chart Def</h3>
            { this.render_questions(oKeys, aKeys, this.props.levels) }
            <h3>Chart Results</h3>
            { this.render_results(oKeys, aKeys, flat_levels ) }
        </div>);
    }
}

