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
const LIKERT_GROWTH = [
    '1. No growth',
    '2. Poor growth',
    '3. Fair growth', 
    '4. Good growth',
    '5. Very good growth',
    '6. Excellent growth',
];

const DATA = {
  d1: {"SP500": [100, 102, 105, 103, 105, 108, 109], "Company": [100, 106, 101, 111, 99, 105, 109]}, 
   
 d2: {"SP500": [100, 104, 106, 104, 107, 109, 112], "Company": [100, 114, 105, 115, 112, 126, 139]}, 
   
 d3: {"SP500": [100, 102, 103, 104, 106, 108, 110], "Company": [100, 101, 113, 106, 116, 128, 123]}, 
   
 d4: {"SP500": [100, 101, 105, 105, 109, 109, 108], "Company": [100, 99, 109, 132, 141, 141, 150]}, 
   
 d5: {"SP500": [100, 103, 104, 107, 106, 109, 109], "Company": [100, 110, 126, 130, 128, 133, 160]}, 
   
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
                        "SP500": [100, 105, 110, 120, 110, 100 ], 
                        "Company": [100, 110, 120, 130, 140, 150 ]
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
                        "SP500": [100, 105, 110, 120, 110, 100 ], 
                        "Company": [100, 110, 120, 130, 140, 150 ]
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
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_a2_smalldis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d2, 'Stock Price'),
            theme: 'b',
        },
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_a3_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, // SMALL
            data: wrap( DATA.d3, 'Stock Price'),
            theme: 'c',
        },
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_a4_meddis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_MEDIUM, //0
            data: wrap( DATA.d4, 'Stock Price'),
            theme: 'd',
        },
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_a5_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, // MEDIUM
            data: wrap( DATA.d5, 'Stock Price'),
            theme: 'e',
        },
    }
    
];


const linechart_dollar_b = [
    {
        ..._choice_base,
        template_id: 'vislit_line_dollar_b1_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0,
            data: wrap( DATA.d1, 'Price'),
            theme: 'a',
        },
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
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_b3_smalldis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_SMALL, // 0
            data: wrap( DATA.d3, 'Price'),
            theme: 'c',
        },
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_b4_ok',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: 0, //DISTORTION_MEDIUM, 
            data: wrap( DATA.d4, 'Price'),
            theme: 'd',
        },
    },{ 
        ..._choice_base,
        template_id: 'vislit_line_dollar_b5_meddis',
        instruction: q('grow', 'Stock Price'),
        client_items: LIKERT_GROWTH,
        chart_def: {
            type: 'ChartLine_StockDollar',
            distortion: DISTORTION_MEDIUM, // 0, 
            data: wrap( DATA.d5, 'Price'),
            theme: 'e',
        },
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