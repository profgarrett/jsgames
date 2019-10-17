// @flow
import React from 'react';
import type { Node } from 'react';

// Timer will reset upon a new object being passed.
type PropsType = {
	time_limit: number,
    for_object: Object,
    onTimeout: Function,
};

type StateType = {
    old_object: Object,
    start_time: number,
    remaining_time: number,
    handle: Function,
    fired: boolean,
}

export default class Timer extends React.Component<PropsType, StateType> { 
    myRef: any;

	constructor(props: PropsType) {
		super(props);

		(this: any).tick = this.tick.bind(this);
        
        this.state = {
            old_object: this.props.for_object,
            start_time: Date.now(),
            remaining_time: this.props.time_limit,
            handle: setInterval( this.tick, 1000),
            fired: false,
        };
	}

    // Stop updating render.
    componentWillUnmount() {
        window.clearTimeout(this.state.handle);
	}


    tick() {
        // Don't fire multiple times.
        if(this.state.fired) return;

        const seconds = this.props.time_limit - Math.floor((Date.now() - this.state.start_time)/1000);

        if( seconds < 0 ) {
            // If no time is left
            this.setState({ remaining_time: 0, fired: true });
            this.props.onTimeout();
        } else {
            // Update timer.
            this.setState({ remaining_time: seconds });
        }
 
    }

    static getDerivedStateFromProps(props: PropsType, state: StateType): StateType {
        
        // If a new object is passed, then update state.
        if(props.for_object !== state.old_object) {

            // Add new
            return {
                old_object: props.for_object,
                start_time: Date.now(),
                remaining_time: props.time_limit,
                handle: state.handle,
                fired: false,
            }
        } else {
            return state;
        }
    }

	render(): Node {
        const style = {
            textAlign: 'center',
            marginTop: 20,
            fontSize: '25px',
            color: '#006dcc',
        };
        const style_highlight = {
            ...style,
            color: 'red',
            backgroundColor: 'black',
        }

        if( this.state.remaining_time < 1 ) {
            return <div style={style_highlight}>Time is up!</div>;
        }

        return (<div style={style}><b>{ this.state.remaining_time }</b> seconds remaining</div>);
    }
}