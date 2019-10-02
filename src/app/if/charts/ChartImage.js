//@ flow
import React from 'react';
import type { Node } from 'react';
import { ChartDef } from './../../../shared/ChartDef';

export function ChartImage(cd: ChartDef): Node {

	return <img height='400' src={cd.src} />

}
