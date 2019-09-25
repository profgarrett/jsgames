//@ flow
import React from 'react';
import type { Node } from 'react';
//import { ResponsiveLine } from '@nivo/line'
import { ChartDef } from './../../../shared/ChartDef';

export function ChartPie_3d(cd: ChartDef): Node {
    const config = {

    };
	//let distortion = typeof cd.distortion !== 'undefined' ? cd.distortion : 0;
	//if(distortion < 1 && distortion > 0) distortion = distortion * 100;

	return <img width='400' src='/static/vislit/pie3d1.png' />

}

export function ChartPie_2d(cd: ChartDef): Node {
    const config = {

    };
	return <img width='400' src='/static/vislit/pie2d1.png' />

}