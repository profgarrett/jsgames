//      
import React from 'react';

                                           
                                  

import { create_summary } from './IfQuestionsData';
import IfQuestionsExcel from './IfQuestionsExcel';
import IfQuestionsTable from './IfQuestionsTable';


                  
                          
               
  

export default class IfQuestions extends React.Component            {

	render()       {
		if(this.props.levels.length < 1) 
			return <div/>;

		const levels = create_summary(this.props.levels);

		//console.log(levels);

		if(this.props.output === 'table')
			return <IfQuestionsTable levels={levels} />;

		if(this.props.output === 'excel')
			return <IfQuestionsExcel levels={levels} />;

		throw new Error('Invalid output type passed to IfQuestions');
	}



}
