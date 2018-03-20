import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';



/**
	Useful shortcut for creating components
	https://react-bootstrap.github.io/components.html#forms
*/
export default function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}
FieldGroup.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	help: PropTypes.string
};
