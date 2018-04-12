// @flow
import React from 'react';
import type { Node } from 'react';

import type { TextPageType } from './IfTypes';
import { HtmlDiv } from './../components/Misc';

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
	}

	componentDidMount() {
		if(!this.props.page.client_read) {
			this.props.handleChange({ client_read: true });	
		}
	}

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render(): Node {
		//const page = this.props.page;

		// Use dangerouslySetInnerHtml so that the description can use html characters.
		//let desc = <HtmlDiv className='lead1' html={ page.description } />;

		return '';

	}
}
