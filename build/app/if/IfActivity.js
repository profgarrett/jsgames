//      
import React from 'react';
//import { Panel, Popover, OverlayTrigger, Well } from 'react-bootstrap';

//import { HtmlDiv } from './../components/Misc';

                                           
                                  
import IfActivitySummaryChart from './IfActivitySummaryChart';
import IfActivityMistakesChart from './IfActivityMistakesChart';


                  
                         
  

export default class IfActivity extends React.Component            {
	constructor(props     ) {
		super(props);
	}

	render()       {
		if(this.props.levels.length < 1) 
			return <div/>;

		const levelDict = {};

		// Organize by level.code
		this.props.levels.map( (level            ) => {
			if(!levelDict.hasOwnProperty(level.code)) {
				levelDict[level.code] = [];
			}
			levelDict[level.code].push(level);
		});

		// Sort each level by username
		Object.keys(levelDict).forEach( 
			(key        )      => levelDict[key] = levelDict[key].sort( 
				(a           , b           )          => a.username > b.username 
			)
		);


		// Make a unique row for each distinct level
		const rows = [];
		Object.keys(levelDict).forEach( 
			(key        )       => {

				rows.push((<div key={ key }>
					<h1>{ levelDict[key][0].code }</h1>
					<b>Items: { levelDict[key].length }</b>
					<IfActivitySummaryChart levels={levelDict[key]} />
					</div>
				));
			}
		);




/*
		const data = 
			this.props.levels.reduce(
				(accumLevels, level) => accumLevels.concat( 
					level.pages.reduce(
						(accumPages, page) => accumPages.concat(
							page.history.map(
								(history, history_i) => {
										return {
											username: level.username, 
											code: level.code,
											page: 0,
											created: history.created.toString(),
											value: history.client_f ? history.client_f : '?'+page.toString() 
										}; 
									}
							)
						)
					,[])
				),[]);
*/
		return (<div>
				{ rows }
			</div>
		);

	}

}
