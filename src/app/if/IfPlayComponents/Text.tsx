import React, {ReactElement} from 'react';
import type { IfPageTextSchema } from '../../../shared/IfPageSchemas';
import type { IStringIndexJsonObject } from '../../components/Misc';

interface PropsType {
	page: IfPageTextSchema;
	readonly: boolean;
	editable: boolean;
	onChange: (json: IStringIndexJsonObject) => void;
}
interface StateType {

}

/**
	A Html page  shows general input.
*/
export default class Text extends React.Component<PropsType, StateType> {
	constructor(props: any) {
		super(props);
		this.state = {}
	}

	// After props are updated, send a signal to show that it's been read.
	static getDerivedStateFromProps(nextProps: PropsType /*, prevState*/): any {
		if(!nextProps.page.client_read) {
			if(typeof nextProps.onChange !== 'undefined') {
				nextProps.onChange({ client_read: true });	
			}
		}
		return {};
	}

	// Set focus on the submit button (if present)
	componentDidMount(): void {
		let btn = document.getElementById('_render_page_submit_button');
		if(this.props.editable && btn) btn.focus();
	}

	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render = (): ReactElement => {
		return <></>;
	}
}
