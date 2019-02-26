// @flow
import React from 'react';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';

import { create_summary } from './IfQuestionsData';
import IfQuestionsExcel from './IfQuestionsExcel';
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

		//console.log(levels);

		if(this.props.output === 'table')
			return <IfQuestionsTable levels={levels} />;

		if(this.props.output === 'excel')
			return <IfQuestionsExcel levels={levels} />;

		throw new Error('Invalid output type passed to IfQuestions');
	}



}
