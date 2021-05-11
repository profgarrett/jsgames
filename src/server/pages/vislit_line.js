// @flow
    
/**
	Visual Literacy Test
**/
const { LinearGen, ShuffleGen } = require('./../Gens');
import type { GenType } from './../Gens';
//import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';
const { VISLIT_MIN_TIME_PER_SLIDE, VISLIT_TIME_PER_SLIDE, DISTORTION_MEDIUM, DISTORTION_SMALL } = require('./../secret.js');


const _text_base = {
	type: 'IfPageTextSchema',
	show_feedback_on: false,
};

/*
const _slider_base = {
	type: 'IfPageSliderSchema',
    min: 0,
    max: 100,
	show_feedback_on: false,
    time_limit: VISLIT_TIME_PER_SLIDE,
    time_minimum: VISLIT_MIN_TIME_PER_SLIDE,
    code: 'test',
    description: '',
};
*/
 
const _choice_base = {
    type: 'IfPageChoiceSchema',
	show_feedback_on: false,
    code: 'test',
    solution: '*',
    correct_required: false,
    time_limit: VISLIT_TIME_PER_SLIDE,
    time_minimum: VISLIT_MIN_TIME_PER_SLIDE,
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
const LIKERT_GROWTH = [
    '1. Same growth as the market (difference of 0%)',
    '2. Poor growth compared to over the market (difference of 10%)',
    '3. Fair growth compared to over the market (difference of 30%)', 
    '4. Good growth compared to the market (difference of 45%)',
    '5. Very good growth compared to the market (difference of 60%)',
    '6. Excellent growth compared to the market (difference of 75%)',
];

const DATA = {

 d1: {'SP500': [100, 103, 103, 103, 105, 107, 110], 'Company': [100, 93, 95, 102, 104, 116, 121]}, 
   
 d2: {'SP500': [100, 102, 101, 104, 105, 109, 110], 'Company': [100, 97, 102, 108, 125, 123, 143]}, 
   
 d3: {'SP500': [100, 101, 104, 105, 105, 111, 112], 'Company': [100, 111, 106, 114, 113, 130, 146]}, 
   
 d4: {'SP500': [100, 101, 104, 103, 105, 110, 108], 'Company': [100, 100, 108, 134, 125, 148, 162]}, 
   
 d5: {'SP500': [100, 104, 106, 103, 108, 111, 112], 'Company': [100, 107, 111, 131, 141, 148, 168]}, 
   
 d6: {'SP500': [100, 102, 106, 103, 108, 107, 110], 'Company': [100, 97, 108, 103, 109, 111, 121]}, 
   
 d7: {'SP500': [100, 102, 105, 103, 108, 111, 112], 'Company': [100, 100, 117, 124, 125, 133, 146]}, 
   
 d8: {'SP500': [100, 101, 103, 107, 107, 106, 112], 'Company': [100, 111, 115, 115, 117, 132, 146]}, 
   
 d9: {'SP500': [100, 101, 105, 104, 105, 109, 108], 'Company': [100, 112, 125, 131, 139, 138, 162]}, 
   
 d10: {'SP500': [100, 104, 104, 104, 108, 106, 112], 'Company': [100, 107, 126, 124, 125, 146, 168]}, 
   
 d11: {'SP500': [100, 104, 104, 107, 106, 108, 112], 'Company': [100, 95, 109, 114, 121, 117, 146]}, 
   
 d12: {'SP500': [100, 103, 102, 106, 108, 107, 111], 'Company': [100, 110, 105, 107, 129, 126, 144]}, 
   

};


function wrap( d: Object, as: string): Array<any> {
    let data = [];

    for( let key in d ){
        if(d.hasOwnProperty(key)) {
            data.push( { id: key, data: wrapInner( d[key], as) } );
        }
    }
    
    return data;
}

function wrapInner( d: Array<any>, as: string): Array<any> {
    const y1 = 2019-7;
    return d.map( (v, i) => { 
        return { 'x': y1+i+'', y: v };
    });
}

const q = ( type: string, topic: string ): string => {
    if(type === 'familiar')
       return 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.';

    if(type === 'grow') 
        return `Compare the growth of the company against the overall stock market (SP500). 
            <br/><br/>
            Rate the overall growth of the firm over the 7-year period.`;
    
    
    throw new Error('Invalid type');
}




////////////////////////////////////////////////////////////
// Line Chart - Unlabled Axis
////////////////////////////////////////////////////////////

const linechart_dollar_familiarity = [

    {
        ..._choice_base,
        template_id: 'vislit_line_familiarity',
        instruction: q('familiar', ''),
        client_items: LIKERT_AGREE,
        chart_def: {
            type: 'ChartLine_StockDollar',
            data: wrap({
                        'SP500': [100, 105, 110, 120, 110, 100, 115 ], 
                        'Company': [100, 110, 120, 130, 140, 150, 145 ]
                    }, 'Stock Price'),
            theme: 'e',
        },
        time_limit: null,
    },

];

const linechart_dollar_task = [
    {
        ..._text_base,
        template_id: 'vislit_line_sample',
        instruction: '',
        description: `This chart type compares a $100 investment in the overall stock market,
                with the same investment in company stock. It helps investors see if a firm 
                is outperforming the overall market.
                <br/><br/>
                In this chart, the same $100 invested in the market would end up being worth $100. 
                If it was invested in the company's stock, it would be worth $150.
                <br/><br/>
                Continue when you feel comfortable with this task.`,
        chart_def: {
            type: 'ChartLine_StockDollar',
            data: wrap({
                        'SP500': [100, 105, 110, 120, 110, 100, 115 ], 
                        'Company': [100, 110, 120, 130, 140, 150, 145 ]
                    }, 'Stock Price'),
            theme: 'e',
        },
        time_limit: null,
    },
]


const linechart_dollar_a = [
    
    {
        ..._choice_base,
        template_id: 'vislit_line_dollar_a1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d1, 'Stock Price'),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_b1_smalldis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d2, 'Stock Price'),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_c1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, // SMALL
            data: wrap( DATA.d3, 'Stock Price'),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_d1_meddis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d4, 'Stock Price'),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[4],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_e1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d5, 'Stock Price'),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[4],
    },{
        ..._choice_base,
        template_id: 'vislit_line_dollar_f1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d6, 'Stock Price'),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_g1_smalldis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d7, 'Stock Price'),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_h1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, // SMALL
            data: wrap( DATA.d8, 'Stock Price'),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_i1_meddis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d9, 'Stock Price'),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[4],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_j1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d10, 'Stock Price'),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[4],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_k1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d11, 'Stock Price'),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_l1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d12, 'Stock Price'),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[2],
    }
];


const linechart_dollar_b = [
    {
        ..._choice_base,
        template_id: 'vislit_line_dollar_a2_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d1, 'Price'),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_b2_ok',
        instruction: q('grow', 'Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, // DISTORTION_SMALL,
            data: wrap( DATA.d2, 'Price'),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_c2_smalldis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d3, 'Price'),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_d2_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, //DISTORTION_MEDIUM, 
            data: wrap( DATA.d4, 'Price'),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[4],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_e2_meddis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_MEDIUM, // 0, 
            data: wrap( DATA.d5, 'Price'),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[4],
    },{
        ..._choice_base,
        template_id: 'vislit_line_dollar_f2_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d6, 'Price'),
            theme: 'a',
        },
        solution: LIKERT_GROWTH[1],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_g2_ok',
        instruction: q('grow', 'Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, // DISTORTION_SMALL,
            data: wrap( DATA.d7, 'Price'),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_h2_smalldis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d8, 'Price'),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[2],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_i2_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, //DISTORTION_MEDIUM, 
            data: wrap( DATA.d9, 'Price'),
            theme: 'd',
        },
        solution: LIKERT_GROWTH[4],
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_j2_meddis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_MEDIUM, // 0, 
            data: wrap( DATA.d10, 'Price'),
            theme: 'e',
        },
        solution: LIKERT_GROWTH[4],
    },{
        ..._choice_base,
        template_id: 'vislit_line_dollar_k2_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d11, 'Price'),
            theme: 'b',
        },
        solution: LIKERT_GROWTH[2],
    },{
        ..._choice_base,
        template_id: 'vislit_line_dollar_l2_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d12, 'Price'),
            theme: 'c',
        },
        solution: LIKERT_GROWTH[2],
    }
];


////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////


const vislit_lineA = ({
    gen_type: LinearGen,
    pages: [

        ...linechart_dollar_task,
        ...linechart_dollar_familiarity,

        ({   gen_type: ShuffleGen,
            pages: [
                ...linechart_dollar_a
            ]
        }: GenType),
    ]
}: GenType);

const vislit_lineB = ({
    gen_type: LinearGen,
    pages: [
        ...linechart_dollar_task,
        ({
            gen_type: ShuffleGen,
            pages: [
                ...linechart_dollar_b
            ]
        }: GenType),
    ]
}: GenType);

module.exports = { vislit_lineA, vislit_lineB };