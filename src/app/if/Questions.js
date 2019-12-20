// @flow
import React from 'react';

import { IfLevelSchema } from './../../shared/IfLevelSchema';
import type { Node } from 'react';

import { create_summary } from './QuestionsData';
import QuestionsExcelChoice from './QuestionsExcelChoice';
import QuestionsExcelNumberAnswer from './QuestionsExcelNumberAnswer';
import QuestionsExcelFormulas from './QuestionsExcelFormulas';
import QuestionsTable from './QuestionsTable';
import QuestionsTags from './QuestionsTags';
import QuestionsChart from './QuestionsChart';

type PropsType = {
	levels: Array<IfLevelSchema>,
	output: string
};

export default class IfQuestions extends React.Component<PropsType> {

	render(): Node {
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
			//<IfQuestionsExcelChoice levels={levels} />
			//<IfQuestionsExcelNumberAnswer levels={levels} />
			return <div>
				
				<QuestionsExcelFormulas levels={levels} />
			</div>;
		}

		throw new Error('Invalid output type passed to IfQuestions');
	}



}
