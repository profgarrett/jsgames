// @flow
import React from 'react';
import { FormControl } from 'react-bootstrap';
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider'

import type { Node } from 'react';
import { IfPageSliderSchema } from './../../shared/IfPageSchemas';

type PropsType = {
  page: IfPageSliderSchema,
  editable: boolean,
  readonly: boolean,
  handleChange: (Object) => void,
  handleSubmit: (void) => void
};
  
const ID = 'SliderInput';

// ************************************************************************
// Code for Slider Component
// ************************************************************************

const sliderStyle = { // Give the slider some width
  position: 'relative',
  width: '100%',
  height: 80,
  border: '0px',
}

const railStyle = { 
  position: 'absolute',
  width: '100%',
  height: 10,
  marginTop: 35,
  borderRadius: 5,
  backgroundColor: 'rgb(187, 187, 187)',
}


export function Handle({
    handle: { id, value, percent }, 
    getHandleProps
}: any) {
    return (
        <div
        style={{
        left: `${percent}%`,
        position: 'absolute',
        marginLeft: -15,
        marginTop: 25,
        zIndex: 2,
        width: 30,
        height: 30,
        border: 0,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: '50%',
        backgroundColor: '#2C4870',
        color: '#333',
        }}
        {...getHandleProps(id)}
        >
        </div>
  )
}

function Track({ source, target, getTrackProps }) { // your own track component
  return (
    <div
      style={{
        position: 'absolute',
        height: 10,
        zIndex: 1,
        marginTop: 35,
        backgroundColor: '#546C91',
        borderRadius: 5,
        cursor: 'pointer',
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
      }}
      {...getTrackProps()} // this will set up events if you want it to be clickeable (optional)
    />
  )
}

function Tick({ tick, count }) {  // your own tick component
  return (
    <div>
      <div
        style={{
          position: 'absolute',
          marginTop: 52,
          marginLeft: -0.5,
          width: 1,
          height: 8,
          backgroundColor: 'silver',
          left: `${tick.percent}%`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          marginTop: 60,
          fontSize: 20,
          textAlign: 'center',
          marginLeft: `${-(100 / count) / 2}%`,
          width: `${100 / count}%`,
          left: `${tick.percent}%`,
        }}
      >
        {tick.value}%
      </div>
    </div>
  )
}

// ************************************************************************


/**
  A page shows an input for a number answer.
*/
export default class NumberSlider extends React.Component<PropsType> {
  constructor(props: any) {
    super(props);
    (this: any).state = {};
    (this: any).handleSubmit = this.handleSubmit.bind(this);
    (this: any).handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // If there is an input field, then set its focus.
    if(this.props.editable) {
      let node = document.getElementById(ID);
      if(node) node.focus();
    }
  }
  componentDidUpdate() {
    if(this.props.editable) {
      let node = document.getElementById(ID);
      if(node) node.focus();
    }	
  }


  handleSubmit(event: any): any {
    /*
    if(event.key === 'Enter' ) {
      this.props.handleSubmit(document.getElementById(ID).text);
    }
    event.preventDefault(); // cancel any keypress.
    */
  }

  handleChange(value: Array<number>): any {
        const n = value.pop(); // top number.

        if( typeof n !== 'number') return;
        if( Number.isNaN(n)) return;  // component sometimes returns NaN


        if(n !== this.props.page.client) {
            this.props.handleChange({ client: n});
        }
  }

  // Build out the table 
  // Doesn't need to actually return anything, as the description will be shown 
  // by the containing object.
  render(): Node {
    const value = Number.isNaN(this.props.page.client) || this.props.page.client === null || typeof this.props.page.client === 'undefined' 
            ? 0 
            : this.props.page.client;
        
    const disabled = !this.props.editable;
  
    return (
      <div style={{ padding: 30 }}>
        <Slider
          disabled={disabled}
                    rootStyle={sliderStyle}
                    domain={[0, 100]}
                    step={1}
                    mode={2}
                    onUpdate={ (e) => this.handleChange(e) }
                    values={[value]} >
                    <Rail>
                        {({ getRailProps }) => (  // adding the rail props sets up events on the rail
                            <div style={railStyle} {...getRailProps()} /> 
                        )}
                    </Rail>
                    <Handles>
                        {({ handles, getHandleProps }) => (
                            <div className="slider-handles">
                                {handles.map(handle => (
                                    <Handle
                                        key={handle.id}
                                        handle={handle}
                                        getHandleProps={getHandleProps}
                                    />
                                ))}
                            </div>
                        )}
                    </Handles>
                    <Tracks right={false}>
                        {({ tracks, getTrackProps }) => (
                            <div className="slider-tracks">
                                {tracks.map(({ id, source, target }) => (
                                    <Track
                                        key={id}
                                        source={source}
                                        target={target}
                                        getTrackProps={getTrackProps}
                                    />
                                ))}
                            </div>
                        )}
                    </Tracks>
                    <Ticks count={10}>
                        {({ ticks }) => (
                            <div className="slider-ticks">
                                {ticks.map(tick => (
                                    <Tick key={tick.id} tick={tick} count={ticks.length} />
                                ))}
                            </div>
                        )}
                    </Ticks>
                </Slider>
            </div>
      );
  }
}