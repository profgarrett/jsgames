import React, { ReactElement } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { IfPageFormulaSchema, IfPagePredictFormulaSchema } from './../../../shared/IfPageSchemas';

import ExcelFormulaTable from './ExcelFormulaTable';
import ExcelPredictTable from './ExcelPredictTable';

import type { IStringIndexJsonObject } from '../../components/Misc';


type PropsType = {
	page: IfPageFormulaSchema | IfPagePredictFormulaSchema,
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

		// If we are a PredictFormula, then look to see if the predictions are correct.
		if(page.type === 'IfPagePredictFormulaSchema' && this.props.editable ) {
			const p = page.toIfPagePredictFormulaSchema();
			const correct = p.predictions_correct();
			// Test correctness.
				
			return ( 
				<Tabs style={{ marginTop: 30}} activeKey={ correct ? 'formula' : 'predict' } id='tab1'>
					<Tab eventKey='predict' disabled={correct} title='Step 1: Drag each answer into the right row'>
						<ExcelPredictTable page={p}
							editable={this.props.editable} 
							readonly={this.props.readonly} 
							onChange={this.props.onChange}/>
					</Tab>
					<Tab eventKey='formula' disabled={!correct} title='Step 2: Write the formula'>
						{ excelTable }
					</Tab>
				</Tabs>
				);

		} else {
			return excelTable;
		}

	}
}