// @flow
import React from 'react';
import type { Node } from 'react';

import type { TextPageType } from './IfTypes';

type PropsType = {
	page: TextPageType,
	editable: boolean,
	handleChange: (Object) => void
};


/**
	A Html page  shows general input.
*/
export default class Text extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
		(this: any).state = {};
	}

	// After props are updated, send a signal to show that it's been read.
	static getDerivedStateFromProps(nextProps: PropsType /*, prevState*/): any {
		if(!nextProps.page.client_read) {
			nextProps.handleChange({ client_read: true });	
		}
		return {};
	}

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render(): Node {
		return '';

	}
}
