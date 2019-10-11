// @flow
/**
	Visual Literacy Test
**/
const { LinearGen, ShuffleGen } = require('./../Gens');
const { vislit_lineA, vislit_lineB } = require('./vislit_line');
const { vislit_barA, vislit_barB } = require('./vislit_bar');
const { vislit_pie_2d, vislit_pie_3d } = require('./vislit_pie');
const { vislit_stackedbar } = require('./vislit_stackedbar');
const { vislit_waterfall_absolute, vislit_waterfall_relative } = require('./vislit_waterfall');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////

const vislit = ({
    gen_type: LinearGen,
    pages: [

        vislit_lineA,
        vislit_waterfall_absolute,
        vislit_barA,
        vislit_pie_2d,
        vislit_stackedbar,

        vislit_barB,
        vislit_pie_3d,
        vislit_waterfall_relative,
        vislit_lineB,
        
    ]
}: GenType);

module.exports = { vislit };
