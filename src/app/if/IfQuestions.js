// @flow
import React from 'react';

import { IfLevelSchema } from './../../shared/IfLevel';
import type { Node } from 'react';

import { create_summary } from './IfQuestionsData';
import IfQuestionsExcelChoice from './IfQuestionsExcelChoice';
import IfQuestionsExcelNumberAnswer from './IfQuestionsExcelNumberAnswer';
import IfQuestionsExcelFormulas from './IfQuestionsExcelFormulas';
import IfQuestionsTable from './IfQuestionsTable';
import IfQuestionsTags from './IfQuestionsTags';


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
			return <IfQuestionsTags levels={levels} />;

		if(this.props.output === 'table')
			return <IfQuestionsTable levels={levels} />;

		if(this.props.output === 'excel') {
			return <div>
				<IfQuestionsExcelChoice levels={levels} />
				<IfQuestionsExcelNumberAnswer levels={levels} />
				<IfQuestionsExcelFormulas levels={levels} />
			</div>;
		}

		throw new Error('Invalid output type passed to IfQuestions');
	}



}
