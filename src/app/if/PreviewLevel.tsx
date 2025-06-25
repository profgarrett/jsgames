import React, { ReactElement } from 'react';
import { Modal, Card, Button  } from 'react-bootstrap';

import { HtmlDiv } from '../components/Misc';
import { fill_template } from '../../shared/template';

import ExcelTable from './IfPlayComponents/ExcelTable';
import Text from './IfPlayComponents/Text';
import Choice from './IfPlayComponents/Choice';
import Slider from './IfPlayComponents/Slider';
import ShortTextAnswer from './IfPlayComponents/ShortTextAnswer';
import LongTextAnswer  from './IfPlayComponents/LongTextAnswer';
import SqlQuery from './IfPlayComponents/SqlQuery';


import { IfLevelSchema } from '../../shared/IfLevelSchema';
import type { IStringIndexJsonObject } from '../components/Misc';



type PreviewLevelPropsType = {
	level: null|IfLevelSchema,
	close: any,
};



const PreviewPage = (props: any ): ReactElement => {

	const page = props.page;
	const noop_json = (s:IStringIndexJsonObject): void => { return };
	const noop = (): void => { return };
	const t = (s: string) => fill_template(s, page.template_values);
	const desc = t(page.description);
	const inst = t(page.instruction);

	// Figure out which control to use for the page.
	let problem, solution;

	if(page.type === 'IfPageFormulaSchema' ) {

		let page2 = page.toIfPageFormulaSchema();

		problem = (
			<Card >
				<Card.Body>
					<ExcelTable page={page2} readonly={true} editable={false}  onChange={ noop_json } onEnter={noop} onValidate={noop}  />
					<div style={{ textAlign:  'right', fontSize: 8, color: 'gray' }}>{ page.type }</div>
				</Card.Body>
			</Card>
		);

	} else if(page.type === 'IfPageTextSchema') {
		problem = <Text page={page.toIfPageTextSchema()} readonly={true} editable={false}  onChange={ noop }/>;

	} else if(page.type === 'IfPageSliderSchema') {
		problem = <Slider page={page.toIfPageSliderSchema()} readonly={false} editable={false}  onChange={ noop } />;

	} else if(page.type === 'IfPageShortTextAnswerSchema') {
		problem = <ShortTextAnswer page={page.toIfPageShortTextAnswerSchema()} readonly={true} editable={false} onChange={noop} onSubmit={noop }/>;

	} else if(page.type === 'IfPageLongTextAnswerSchema') {
		problem = <LongTextAnswer page={page.toIfPageLongTextAnswerSchema()} readonly={true} editable={false} onChange={noop} onSubmit={noop }/>;

	} else if(page.type === 'IfPageNumberAnswerSchema') {
		problem =<ShortTextAnswer page={page.toIfPageNumberAnswerSchema()} readonly={true} editable={false} onChange={noop} onSubmit={noop }/>;

	} else if(page.type === 'IfPageSqlSchema') {
		problem = <SqlQuery page={page.toIfPageSqlSchema()} readonly={true} editable={true} onChange={noop} onSubmit={noop} onValidate={noop} />;

	} else if(page.type === 'IfPageChoiceSchema') {
		problem = <Choice page={page.toIfPageChoiceSchema()} show_solution={false} readonly={true} editable={false}  onChange={ noop }  />;

	} else {
		console.log( page );
		throw new Error('Invalid type in IfLevelPreview '+page.type);
		
	}

	return (<Card bg='Success'>
			<Card.Body style={{ fontSize: 12}} >
				<HtmlDiv className='lead' html={ ''+desc } />
				<HtmlDiv className='lead' html={ ''+inst } />
				{ problem }
				{ solution }
			</Card.Body>
		</Card>);
}



export default function PreviewLevel(props: PreviewLevelPropsType): ReactElement {

	const _render_modal = (): ReactElement => {
		let pages, body;

		// If loading,
		if(typeof(props.level) == 'undefined' || props.level == null ) {
				
			return <Modal show={true} onHide={props.close} dialogClassName="modal-90w" centered={true} keyboard={true} animation={true}>
				<Modal.Header closeButton>
					<Modal.Title>Loading preview</Modal.Title>
				</Modal.Header>
					<Modal.Body>Please wait while the preview is loaded</Modal.Body>
				<Modal.Footer>
					<Button variant="primary" onClick={props.close}>Close</Button>
				</Modal.Footer>
			</Modal>;
		}

		pages = props.level.pages.map( (p: any,i: number) => <PreviewPage page={p} i={i} key={'PreviewPage'+i} />);
		
		const m = <Modal show={true} onHide={props.close} size='xl' centered={true} keyboard={true} animation={false}>
			<Modal.Header closeButton>
				<Modal.Title>Previewing {props.level.code}</Modal.Title>
			</Modal.Header>
				<Modal.Body>
					{pages}
				</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" onClick={props.close}>Close</Button>
			</Modal.Footer>
		</Modal>;
	
		return m;
	}

	return _render_modal();
};

