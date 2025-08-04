import React, { ReactElement } from 'react';

import { IfLevelSchema } from '../../shared/IfLevelSchema';

import { create_summary } from './QuestionsData';
import QuestionsExcelChoice from './QuestionsExcelChoice';
//import QuestionsExcelNumberAnswer from './QuestionsExcelNumberAnswer';
import QuestionsExcelFormulas from './QuestionsExcelFormulas';
import QuestionsExcelSql from './QuestionsExcelSql';
import QuestionsTable from './QuestionsTable';
import QuestionsTags from './QuestionsTags';
import QuestionsChart from './QuestionsChart';

type PropsType = {
	levels: Array<IfLevelSchema>,
	output: string
};

const SHOW_FORMULA_INSTEAD_OF_CHOICE = false;

export default class IfQuestions extends React.Component<PropsType> {

	render = (): ReactElement=> {
		if(this.props.levels.length < 1) 
			return <div/>;

		const levels = create_summary(this.props.levels);

		if(this.props.output === 'tags')
			return <QuestionsTags levels={levels} />;

		if(this.props.output === 'table')
			return <QuestionsTable levels={levels} />;

		if(this.props.output === 'chart')
			return <QuestionsChart levels={this.props.levels} />;

		if(this.props.output === 'excel') {
			
			//return <div><QuestionsExcelSql levels={levels} /></div>;

			// GOOD, just don't currently need both options.
			//if( SHOW_FORMULA_INSTEAD_OF_CHOICE ) 
			//	return <div>hey</div>;
			//else 
			//	return <div><QuestionsExcelChoice levels={levels} /></div>;
			return <QuestionsExcelFormulas levels={levels} />
		}
		console.log(this.props.output);
		
		throw new Error('Invalid output type passed to IfQuestions');
	}



}
