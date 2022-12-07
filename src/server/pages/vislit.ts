/**
	Visual Literacy Test
**/
//const { LinearGen, ShuffleGen } = require('./../Gens');
const { vislit_lineA, vislit_lineB } = require('./vislit_line');
const { vislit_barA, vislit_barB } = require('./vislit_bar');
const { vislit_pie_2d, vislit_pie_3d } = require('./vislit_pie');
const { vislit_stackedbar } = require('./vislit_stackedbar');
const { vislit_combo } = require('./vislit_combo');
const { vislit_scatter } = require('./vislit_scatter');
const { vislit_waterfall_absolute, vislit_waterfall_relative } = require('./vislit_waterfall');
const { VISLIT_TIME_PER_SLIDE } = require('./../secret');


////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////

const _text_base = {
	type: 'IfPageTextSchema',
	show_feedback_on: false,
};

const vislit_debug = ({
    gen_type: 'LinearGen',
    pages: [

    ]
});

const vislit = ({
    gen_type: 'LinearGen',
    pages: [        
        {   ..._text_base, 
            description: `There are 11 different parts in this module.  Each focuses on a different chart type.
                <br/><br/>
                Each part begins by showing you a chart, and then asking how familiar you are with it. 
                You will be shown a series of pages, each of which ask a question about that type of chart.
                <br/><br/>
                <b><i>You 
                only have ${VISLIT_TIME_PER_SLIDE} seconds per task, so try to keep focused.</i></b>
                <br/><br/>
                Are ready to get started?`},

        vislit_lineA,
        {   ..._text_base, 
            description: `Good job! You've finished the first section.<br/><br>Are you ready to continue?`},

        vislit_waterfall_absolute,
        {   ..._text_base, 
            description: `Good job! You've finished the second section.<br/><br>Are you ready to continue?`},
        
        vislit_barA,
        {   ..._text_base, 
            description: `Good job! You've finished the third section.<br/><br>Are you ready to continue?`},
        
        vislit_pie_2d,
        {   ..._text_base, 
            description: `Good job! You've finished the fourth section.<br/><br>Are you ready to continue?`},

        vislit_stackedbar,
        {   ..._text_base, 
            description: `Good job! You've finished the fifth section.<br/><br>Are you ready to continue?`},
        
        vislit_scatter,
        {   ..._text_base, 
            description: `Good job! You've finished the sixth section.<br/><br>Are you ready to continue?`},

        vislit_barB,
        {   ..._text_base, 
            description: `Good job! You've finished the seventh section.<br/><br>Are you ready to continue?`},

        vislit_pie_3d,
        {   ..._text_base, 
            description: `Good job! You've finished the eighth section.<br/><br>Are you ready to continue?`},

        vislit_waterfall_relative,
        {   ..._text_base, 
            description: `Good job! You've finished the ninth section.<br/><br>Are you ready to continue?`},

        vislit_combo,
        {   ..._text_base, 
            description: `Good job! You've finished the tenth section.<br/><br>Are you ready to continue?`},

        vislit_lineB,
        {   ..._text_base, 
            description: `Good job! You've finished the final chart section.<br/><br>Are you ready to continue?`},
        
    ]
});

export { vislit };
