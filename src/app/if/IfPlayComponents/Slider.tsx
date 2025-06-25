import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { IfPageSliderSchema } from '../../../shared/IfPageSchemas';
import type { IStringIndexJsonObject } from '../../components/Misc';

interface PropsType {
  page: IfPageSliderSchema;
  editable: boolean;
  readonly: boolean;
  onChange: (json: IStringIndexJsonObject) => void;
};
  
const ID = 'SliderInput';


const sliderStyles = {
  // Container style
  container: {
    padding: 30,
    position: 'relative' as const,
    height: 80,
  },
  // Custom styles for the slider
  slider: {
    marginTop: 35,
    marginBottom: 25,
  }
};

// Custom handle style to match original blue design
const handleStyle = {
  backgroundColor: '#2C4870',
  borderColor: '#2C4870',
  boxShadow: 'none',
  width: 30,
  height: 30,
  marginTop: -10,
  opacity: 1,
};

// Custom track style to match original design
const trackStyle = {
  backgroundColor: '#546C91',
  height: 10,
};

// Custom rail style to match original design  
const railStyle = {
  backgroundColor: 'rgb(187, 187, 187)',
  height: 10,
};

// Custom marks for percentage display (every 10%)
const marks = {
  0: '0%',
  10: '10%',
  20: '20%',
  30: '30%',
  40: '40%',
  50: '50%',
  60: '60%',
  70: '70%',
  80: '80%',
  90: '90%',
  100: '100%',
};

// ************************************************************************


/**
  A page shows an input for a number answer using rc-slider.
*/
export default class NumberSlider extends React.Component<PropsType> {

  componentDidMount = () => {
    // If there is an input field, then set its focus.
    if(this.props.editable) {
      let node = document.getElementById(ID);
      if(node) node.focus();
    }
  }
  
  componentDidUpdate = () => {
    if(this.props.editable) {
      let node = document.getElementById(ID);
      if(node) node.focus();
    }	
  }

  handleChange = (value: number | number[]): void => {
    // rc-slider can return number or number[], we expect single number
    const n = Array.isArray(value) ? value[0] : value;
    
    if (typeof n !== 'number') return;
    if (Number.isNaN(n)) return;

    if (n !== this.props.page.client) {
      this.props.onChange({ client: n });
    }
  }

  // Build out the slider component
  render = (): React.ReactElement => {
    const value = Number.isNaN(this.props.page.client) || 
                  this.props.page.client === null || 
                  typeof this.props.page.client === 'undefined' 
            ? 0 
            : this.props.page.client;
        
    const disabled = this.props.readonly;

    if (!this.props.editable) {
      return (<div>{value}%</div>);
    }

    return (
      <div style={sliderStyles.container}>
        <Slider
          id={ID}
          min={0}
          max={100}
          step={1}
          value={value}
          disabled={disabled}
          onChange={this.handleChange}
          marks={marks}
          included={true}
          handleStyle={handleStyle}
          trackStyle={trackStyle}
          railStyle={railStyle}
          dotStyle={{ display: 'none' }} // Hide dots on marks
          activeDotStyle={{ display: 'none' }} // Hide active dots
        />
        {/* Display current value */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 10, 
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#2C4870'
        }}>
          Current Value: {value}%
        </div>
      </div>
    );
  }
}