import React from 'react';
import PropTypes from 'prop-types';
import { CompletedGlyphicon, ProgressGlyphicon, IncorrectGlyphicon } from './../components/Misc';


export default class IfLevelTest extends React.Component {

	render() {
		const table_style = { border: '2px solid black', borderCollapse: 'collapse' };

		const glyph = g => (g===true) ? <CompletedGlyphicon/> : ( g===false ? <IncorrectGlyphicon/> : <ProgressGlyphicon/> );

		const tests = this.props.tests;
		const tests_html = tests.map( (t,i) => {
			let g = glyph(t.result);
			return (
			<tr style={table_style} key={i}><td>{t.title}</td><td>{g}</td></tr> 
			);
		});

		return (
			<table style={table_style}>
				<tbody>
				<tr style={table_style}><th>Test</th><th>Result</th></tr>
				{ tests_html }
				</tbody>
			</table>
		);
	}
}
IfLevelTest.propTypes = {
	tests: PropTypes.array.isRequired
};
