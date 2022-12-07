import React, {ReactElement} from 'react';
import type { IfPageTextSchema } from '../../../shared/IfPageSchemas';

interface PropsType {
	page: IfPageTextSchema;
	editable: boolean;
	handleChange: (Object) => void;
	handleSubmit: Function;
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
			if(typeof nextProps.handleChange !== 'undefined') {
				nextProps.handleChange({ client_read: true });	
			}
		}
		return {};
	}

	
	componentDidMount() {
		document.addEventListener('keypress', this.handleEnter);
	}

	componentWillUnmount() {
		document.removeEventListener('keypress', this.handleEnter);
	}

	handleEnter = (event: any): any => {
		if(event.key === 'Enter' ) {
			this.props.handleSubmit();
		}
		event.preventDefault(); // cancel any keypress.
	}
	

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render = (): ReactElement => {
		return <></>;
	}
}
