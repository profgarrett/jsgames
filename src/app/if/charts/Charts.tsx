import React, { ReactElement } from 'react';
import { ChartBar_TopLabelNoAxis } from './ChartBar';
import { ChartLine_StockDollar } from './ChartLine';
//import { ChartPie_2d, CharPie_3d } from './ChartPie';
import { ChartStackedBar_Plain } from './ChartStackedBar';
import { ChartWaterfall_Plain } from './ChartWaterfall';
import { ChartImage } from './ChartImage';

import { ChartDef } from '../../../shared/ChartDef';

export function buildChart( cd: ChartDef ): ReactElement {
    if(cd.type === 'ChartBar_TopLabelNoAxis') return ChartBar_TopLabelNoAxis(cd);
    if(cd.type === 'ChartLine_StockDollar') return ChartLine_StockDollar(cd);
    //if(cd.type === 'ChartPie_2d') return ChartPie_2d(cd);
    //if(cd.type === 'ChartPie_3d') return ChartPie_3d(cd);
    if(cd.type === 'ChartStackedBar_Plain') return ChartStackedBar_Plain(cd);
    if(cd.type === 'ChartWaterfall_Plain') return ChartWaterfall_Plain(cd);
    if(cd.type === 'ChartImage') return ChartImage(cd);
    
    throw new Error('Invalid chart type '+cd.type + ' passed to Charts.buildChart');
}