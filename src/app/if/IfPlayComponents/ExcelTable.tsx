import React, { ReactElement } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { IfPageFormulaSchema } from './../../../shared/IfPageSchemas';

import ExcelFormulaTable from './ExcelFormulaTable';

import type { IStringIndexJsonObject } from '../../components/Misc';


type PropsType = {
	page: IfPageFormulaSchema ,
	editable: boolean,
	readonly: boolean,
	onChange: (json: IStringIndexJsonObject) => void;
	onEnter: () => void;
	onValidate: () => void;
};



// This is a standard table for showing excel stuff.
export default class ExcelTable extends React.Component<PropsType> {


	render = (): ReactElement => {
		const page = this.props.page;
		const excelTable = <ExcelFormulaTable 
				page={this.props.page} 
				editable={this.props.editable} 
				readonly={this.props.readonly} 
				onChange={this.props.onChange}
				onValidate={this.props.onValidate}
				onEnter={this.props.onEnter} />;


		return excelTable;

	}
}