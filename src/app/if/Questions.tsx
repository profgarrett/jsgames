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

			// Pick the exporter automatically from the page types actually loaded,
			// rather than a hardcoded choice: formula-based tutorials (the original,
			// still-default use of this page) get the Formulas export, while a level
			// made of choice/free-text/chat pages (e.g. a survey or Prolific study)
			// gets the Choice/survey exporter, which now also flattens those types.
			const has_formula_pages = this.props.levels.some( 
				(level: IfLevelSchema) => level.pages.some( (p: any) => p.type === 'IfPageFormulaSchema') );

			if( has_formula_pages ) return <QuestionsExcelFormulas levels={levels} />;

			return <QuestionsExcelChoice levels={levels} />;
		}
		console.log(this.props.output);
		
		throw new Error('Invalid output type passed to IfQuestions');
	}



}
