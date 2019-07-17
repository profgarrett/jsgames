// @flow
import React from 'react';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';

import { create_summary } from './IfQuestionsData';
import IfQuestionsExcelChoice from './IfQuestionsExcelChoice';
import IfQuestionsExcelFormulas from './IfQuestionsExcelFormulas';
import IfQuestionsTable from './IfQuestionsTable';


type PropsType = {
	levels: Array<LevelType>,
	output: string
};

export default class IfQuestions extends React.Component<PropsType> {

	render(): Node {
		if(this.props.levels.length < 1) 
			return <div/>;

		const levels = create_summary(this.props.levels);

		if(this.props.output === 'table')
			return <IfQuestionsTable levels={levels} />;

		if(this.props.output === 'excel') {
			return <div>
				<IfQuestionsExcelChoice levels={levels} />
				<IfQuestionsExcelFormulas levels={levels} />
			</div>;
		}

		throw new Error('Invalid output type passed to IfQuestions');
	}



}
