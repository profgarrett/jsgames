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
// Adjust: percentage.
function wrap( d: Array<any>, as: string, adjust: number): Array<any> {
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
d1: [568, 586, 581, 599, 619, 653],
d2: [848, 991, 952, 976, 1157, 1102],
d3: [513, 527, 467, 673, 744, 821],
d4: [1116, 1224, 1403, 1519, 1646, 1786],
d5: [668, 645, 642, 683, 765, 868],
d6: [1056, 1205, 1144, 1105, 1172, 1214],
d7: [1260, 1376, 1282, 1345, 1395, 1638],
d8: [1461, 1581, 1529, 1666, 1962, 2338],
d9: [802, 868, 1019, 999, 1080, 1283],
d10: [694, 716, 838, 745, 878, 902],
d11: [691, 548, 690, 675, 781, 898],
d12: [689, 588, 723, 754, 855, 1102],
d13: [1196, 1177, 1279, 1400, 1407, 1375],
d14: [735, 796, 961, 883, 917, 956],
d15: [875, 985, 1194, 1157, 1231, 1400],
d16: [710, 760, 712, 870, 770, 1136],
d17: [505, 403, 352, 542, 425, 657],
d18: [945, 926, 906, 1038, 913, 1087],
d19: [866, 892, 1061, 1038, 1040, 1126],
d20: [1159, 1138, 1318, 1315, 1525, 1854],
d21: [1097, 1226, 1281, 1235, 1458, 1755],
d22: [552, 575, 476, 665, 555, 718],
d23: [592, 668, 733, 727, 800, 770],
d24: [702, 718, 880, 937, 1071, 1123],
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
            data: wrap( [80,70,30,50,30], 'Sales', 1.0),
            theme: 'e',
        },
        time_limit: null,
    } 
];

const barchart_sales_task_description = [
        {   ..._text_base,
        template_id: 'vislit_bar_taskorientation_sales',
        description: `The next series of pages will ask you to rate the company's sales
            growth using this style of chart. 
            <br/><br/>
            Contine when you feel comfortable with this task.`,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            data: wrap( [80,70,30,50,30], 'Sales', 1.0),
            theme: 'e',
        },
    },
];


const barchart_profit_task_description = [
        {   ..._text_base,
        template_id: 'vislit_bar_taskorientation_profit',
        description: `This series of pages will ask you to assess changes in 
            the company's profitability using a bar chart. 
            <br/><br/>
            Continue when you feel comfortable with this task.`,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            data: wrap( [80,70,30,50,30], 'Sales', 1.0),
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
            data: wrap( DATA.d1, 'Sales', 1.0),
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
            data: wrap( DATA.d2, 'Sales', 1.0),
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
            data: wrap( DATA.d3, 'Sales', 1.0),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[4], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_d1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d4, 'Sales', 1.0),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[4], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_e1_meddis',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM,
            data: wrap( DATA.d5, 'Sales', 1.0),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_f1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d6, 'Sales', 1.0),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1], // 15%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_g1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d7, 'Sales', 1.0),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_h1_smalldis',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL,
            data: wrap( DATA.d8, 'Sales', 1.0),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[4], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_i1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d9, 'Sales', 1.0),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[4], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_j1_meddis',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM,
            data: wrap( DATA.d10, 'Sales', 1.0),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_k1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d11, 'Sales', 1.0),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_l1_ok',
        instruction: q('qual', 'Sales'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d12, 'Sales', 1.0),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[4], // 60%
    }

];


const barchart_unlabledaxis_choices_b = [
    { 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_a2_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d1, 'Profit', 0.65),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1], // 15%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_b2_smalldis',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d2, 'Profit', 0.65),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_c2_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d3, 'Profit', 0.65),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[4], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_d2_meddis',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, // 0
            data: wrap( DATA.d4, 'Profit', 0.65),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[4], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_e2_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d5, 'Profit', 0.65),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_f2_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d6, 'Profit', 0.65),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1], // 15%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_g2_smalldis',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d7, 'Profit', 0.65),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_h2_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d8, 'Profit', 0.65),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[4], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_i2_meddis',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, // 0
            data: wrap( DATA.d9, 'Profit', 0.65),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[4], // 60%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_j2_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d10, 'Profit', 0.65),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_k2_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d11, 'Profit', 0.65),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[2], // 30%
    },{ 
        ..._choice_base,
        template_id: 'vislit_bar_unlabeled_choice_l2_ok',
        instruction: q('qual', 'Profit'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, 
            data: wrap( DATA.d12, 'Profit', 0.65),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[4], // 30%
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
            data: wrap( DATA.d13, 'Sales', 0.9),
            theme: 'a',
        },
        solution: 15,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_b1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d14, 'Sales', 0.9),
            theme: 'b',
        },
        solution: 30,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_c1_smalldis',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d15, 'Sales', 0.9),
            theme: 'c',
        },
        solution: 60,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_d1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MED
            data: wrap( DATA.d16, 'Sales', 0.9),
            theme: 'd',
        },
        solution: 60,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_e1_meddis',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d17, 'Sales', 0.9),
            theme: 'e',
        },
        solution: 30,
    },{
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_f1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d18, 'Sales', 0.9),
            theme: 'a',
        },
        solution: 15,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_g1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d19, 'Sales', 0.9),
            theme: 'b',
        },
        solution: 30,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_h1_smalldis',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d20, 'Sales', 0.9),
            theme: 'c',
        },
        solution: 60,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_i1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MED
            data: wrap( DATA.d21, 'Sales', 0.9),
            theme: 'd',
        },
        solution: 60,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_j1_meddis',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d22, 'Sales', 0.9),
            theme: 'e',
        },
        solution: 30,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_k1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d23, 'Sales', 0.9),
            theme: 'a',
        },
        solution: 30,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_l1_ok',
        instruction: q('quant', 'Sales'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d24, 'Sales', 0.9),
            theme: 'b',
        },
        solution: 60,
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
            data: wrap( DATA.d13, 'Profit', 0.8),
            theme: 'a',
        },
        solution: 15,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_b2_smalldis',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d14, 'Profit', 0.8),
            theme: 'b',
        },
        solution: 30,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_c2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d15, 'Profit', 0.7),
            theme: 'c',
        },
        solution: 60,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_d2_meddis',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d16, 'Profit', 0.6),
            theme: 'd',
        },
        solution: 60,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_e2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d17, 'Profit', 0.5),
            theme: 'e',
        },
        solution: 30,
    },{
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_f2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d18, 'Profit', 0.8),
            theme: 'a',
        },
        solution: 15,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_g2_smalldis',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d19, 'Profit', 0.8),
            theme: 'b',
        },
        solution: 30,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_h2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // SMALL
            data: wrap( DATA.d20, 'Profit', 0.7),
            theme: 'c',
        },
        solution: 60,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_i2_meddis',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d21, 'Profit', 0.6),
            theme: 'd',
        },
        solution: 60,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_j2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d22, 'Profit', 0.5),
            theme: 'e',
        },
        solution: 30,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_k2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0,
            data: wrap( DATA.d23, 'Profit', 0.6),
            theme: 'a',
        },
        solution: 30,
    },{ 
        ..._slider_base,
        template_id: 'vislit_bar_unlabeled_slider_l2_ok',
        instruction: q('quant', 'Profit'),
        chart_def: {
            type: 'ChartBar_TopLabelNoAxis',
            distortion: 0, 
            data: wrap( DATA.d24, 'Profit', 0.5),
            theme: 'b',
        },
        solution: 60,
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
