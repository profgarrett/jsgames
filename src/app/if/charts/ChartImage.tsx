import React from 'react';
import { ChartDef } from '../../../shared/ChartDef';

export function ChartImage(cd: ChartDef): React.ReactElement {
	// @ts-ignore
	return <img height='300' src={cd.src} />

}
