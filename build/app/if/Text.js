//      
import React from 'react';
                                  

                                              

                  
                    
                   
                               
  


/**
	A Html page  shows general input.
*/
export default class Text extends React.Component            {
	constructor(props     ) {
		super(props);
		(this     ).state = {};
	}

	// After props are updated, send a signal to show that it's been read.
	static getDerivedStateFromProps(nextProps            /*, prevState*/)      {
		if(!nextProps.page.client_read) {
			nextProps.handleChange({ client_read: true });	
		}
		return {};
	}

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render()       {
		return '';

	}
}
