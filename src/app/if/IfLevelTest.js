import React from 'react';
import PropTypes from 'prop-types';
import { SuccessGlyphicon, FailureGlyphicon, ProgressGlyphicon } from './../components/Misc';


export default class IfLevelTest extends React.Component {

	render() {
		const table_style = { border: '2px solid black', borderCollapse: 'collapse' };

		const glyph = g => (g===true) ? <SuccessGlyphicon/> : ( g===false ? <FailureGlyphicon/> : <ProgressGlyphicon/> );

		const tests = this.props.tests;
		const tests_html = tests.map( (t,i) => <tr style={table_style} key={i}><td>{t.title}</td><td>{glyph(t.result)}</td></tr> );

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
