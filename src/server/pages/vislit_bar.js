// @flow
/**
	Visual Literacy Test
**/
const { LinearGen, ShuffleGen } = require('./../Gens');
import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';
const { VISLIT_TIME_PER_SLIDE, DISTORTION_MEDIUM, DISTORTION_SMALL } = require('./../secret.js');

const _text_base = {
	type: 'IfPageTextSchema',
	show_feedback_on: false,
    
};

const _slider_base = {
	type: 'IfPageSliderSchema',
    min: 0,
    max: 100,
	show_feedback_on: false,
    time_limit: VISLIT_TIME_PER_SLIDE,
    code: 'test',
    description: '',
};

 
const _choice_base = {
    type: 'IfPageChoiceSchema',
	show_feedback_on: false,
    code: 'test',
    solution: '*',
    correct_required: false,
    time_limit: VISLIT_TIME_PER_SLIDE,
    description: '',
}


////////////////////////////////////////////////////////////
// A) Bar CHart Unlabeled Axis
////////////////////////////////////////////////////////////

const LIKERT_AGREE = [ 
    '1. Strongly disagree', 
    '2. Disagree',
    '3. Somewhat disagree',
    '4. Neither agree nor disagree',
    '5. Somewhat agree',
    '6. Agree',
    '7. Strongly agree'
];
const LIKERT_FREQUENCY = [
    '1. Never',
    '2. Rarely (less than 10% of the time)',
    '3. Occasionally (around 30% of the time)',
    '4. Sometimes (around 50% of the time)',
    '5. Frequently (around 70% of the time)',
    '6. Usually (around 90% of the time)',
    '7. Every time',
];
const LIKERT_GROWTH = [
    '1. No growth',
    '2. Poor growth (15%)',
    '3. Fair growth (30%)', 
    '4. Good growth (45%)',
    '5. Very good growth (60%)',
    '6. Excellent growth (75% or greater)',
];


// If profit, then reduce the numbers to make them harder to recognize.
function wrap( d: Array<any>, as: string): Array<any> {
    const adjust = (as === 'Profit' ? 1 : 0.65);
    const y1 = 2019-7;
    let a = d.map( (v, i) => { 
        let o = { 'Year': y1+i+'' };
        o[as] =  Math.round(adjust * v);
        return o;
    });
    return a;
}

const q = ( type: string, topic: string ): string => {
    if(type === 'familiar')
       return 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.';

    if(type === 'quant') 
        return `How much (as a percentage) do you think that ` + topic.toLowerCase()  
        + ' has improved from the first year to the last year?';
    
    if(type === 'qual') 
        return `How would you rate the company's ` + topic.toLowerCase() + ' growth for the <b>entire</b> 7 year period?';
    
    throw new Error('Invalid type');
}


const DATA = {
d1: [119, 105, 125, 127, 131, 134],
d2: [316, 357, 399, 415, 385, 405],
d3: [1456, 1520, 1658, 1762, 2012, 2151],
d4: [1113, 1129, 1191, 1384, 1393, 1459],
d5: [533, 547, 591, 648, 717, 741],
d6: [108, 117, 116, 120, 113, 119],
d7: [319, 348, 353, 378, 411, 431],
d8: [1504, 1548, 1594, 1852, 1937, 2111],
d9: [1058, 1077, 1222, 1386, 1462, 1488],
d10: [536, 562, 656, 661, 651, 714],
};


////////////////////////////////////////////////////////////
// Bar Chart - Unlabled Axis
////////////////////////////////////////////////////////////

const barchart_unlabledaxis_familiarity = [
    {
        ..._choice_base,
        template_id: 'vislit_bar_familiarity',
        instruction: q('familiar', ''),
        client_items: LIKERT_AGREE,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            data: wrap( [80,70,30,50,30], 'Sales'),
            theme: 'e',
        },
        time_limit: null,
    } 
];

const barchart_sales_task_description = [
        {   ..._text_base,
        description: `The next series of pages will ask you to rate the company's sales
            growth using this style of chart. 
            <br/><br/>
            Contine when you feel comfortable with this task.`,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            data: wrap( [80,70,30,50,30], 'Sales'),
            theme: 'e',
        },
    },
];


const barchart_profit_task_description = [
        {   ..._text_base,
        description: `This series of pages will ask you to assess changes in 
            the company's profitability using a bar chart. 
            <br/><br/>
            Continue when you feel comfortable with this task.`,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            data: wrap( [80,70,30,50,30], 'Sales'),
            theme: 'e',
        },        
    },
];

const barchart_unlabledaxis_choices_a = [
    { 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_a1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d1, 'Sales'),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1], // 15%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_b1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d2, 'Sales'),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_c1_smalldis',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL,
            data: wrap( DATA.d3, 'Sales'),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[3], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_d1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d4, 'Sales'),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[3], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_e1_meddis',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM,
            data: wrap( DATA.d5, 'Sales'),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[2], // 30%
    }
];


const barchart_unlabledaxis_choices_b = [
    { 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_a1_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d1, 'Profit'),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1], // 15%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_b1_smalldis',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d2, 'Profit'),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_c1_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d3, 'Profit'),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[3], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_d1_meddis',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, // 0
            data: wrap( DATA.d4, 'Profit'),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[3], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_e1_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d5, 'Profit'),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[2], // 30%
    }
];


const barchart_unlabledaxis_sliders_a = [
    {
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_a1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d6, 'Sales'),
            theme: 'a',
        },
        solution: 0.15,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_b1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d7, 'Sales'),
            theme: 'b',
        },
        solution: 0.3,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_c1_smalldis',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d8, 'Sales'),
            theme: 'c',
        },
        solution: 0.6,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_d1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MED
            data: wrap( DATA.d9, 'Sales'),
            theme: 'd',
        },
        solution: 0.6,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_e1_meddis',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d10, 'Sales'),
            theme: 'd',
        },
        solution: 0.3,
    }
];

const barchart_unlabledaxis_sliders_b = [
    {
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_a2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d6, 'Profit'),
            theme: 'a',
        },
        solution: 0.15,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_b2_smalldis',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d7, 'Profit'),
            theme: 'b',
        },
        solution: 0.3,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_c2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d8, 'Profit'),
            theme: 'c',
        },
        solution: 0.6,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_d2_meddis',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d9, 'Profit'),
            theme: 'd',
        },
        solution: 0.6,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_e2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d10, 'Profit'),
            theme: 'e',
        },
        solution: 0.3,
    }
];





////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////


const vislit_barA = ({
    gen_type: LinearGen,
    pages: [

        ...barchart_sales_task_description,
        ...barchart_unlabledaxis_familiarity,

        ({  
            gen_type: ShuffleGen,
            pages: [
                ...barchart_unlabledaxis_choices_a
            ]
        }: GenType),
        ({
            gen_type: ShuffleGen,
            pages: [
                ...barchart_unlabledaxis_sliders_a
            ]
        }: GenType),
    ]
}: GenType);

const vislit_barB = ({
    gen_type: LinearGen,
    pages: [

        ...barchart_profit_task_description,

        ({   gen_type: ShuffleGen,
            pages: [
                ...barchart_unlabledaxis_choices_b
            ]
        }: GenType),
        ({   gen_type: ShuffleGen,
            pages: [
                ...barchart_unlabledaxis_sliders_b
            ]
        }: GenType),
    ]
}: GenType);

module.exports = { vislit_barA, vislit_barB };
