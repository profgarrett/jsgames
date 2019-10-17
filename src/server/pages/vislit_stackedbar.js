// @flow
/**
	Visual Literacy Test
**/
const { LinearGen, ShuffleGen } = require('./../Gens');
import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';
const { VISLIT_TIME_PER_SLIDE } = require('./../secret.js');


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
const PRODUCTS = [
    'Product A',
    'Product B',
    'Product C',
];
const YEARS = [
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018', 
]



function wrap( d: Object ): Array<any>{
    const data = [];
    let o = {};
    const keys = Object.keys(d);
    const y1 = parseInt(YEARS[0],10);

    // Start building.
    for(let i=0; i<d[keys[0]].length; i++ ){
        o = { 'Year': y1+i+'' };
        
        keys.forEach( k => { o[k] = d[k][i] }) 
        data.push(o);
    }
    return data;
}

const q = ( type: string ): string => {
    if(type === 'familiar')
       return 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.';

    if(type === 'product') 
        return `Which product has had the most sales?`;
    
    if(type === 'year') 
        return `Which year has had the most sales?`;
    
    throw new Error('Invalid type');
}




////////////////////////////////////////////////////////////
// Stacked Bar Chart - Label Axis
////////////////////////////////////////////////////////////

const stackedbarchart_familiarity = [
    {
        ..._choice_base,
        template_id: 'vislit_stackedbar_familiarity',
        instruction: q('familiar'),
        client_items: LIKERT_AGREE,
        chart_def: {
            type: 'ChartStackedBar_Plain',
            data: wrap( {"Product A": [109, 102, 90, 102, 102, 104], "Product B": [113, 108, 114, 97, 104, 112], "Product C": [93, 102, 96, 111, 102, 117]},  ),
            theme: 'e',
        },
        time_limit: null,
    } 
];


const barchart_sales_task_description = [
    {   ..._text_base,
        template_id: 'vislit_stackedbar_task',
        description: `The next series of pages will ask you questions about sales data.
            You will be asked to identify largest <i>product</i> or <i>year</i>.
            <br/><br/>
            Contine when you feel comfortable with this task.`,
        chart_def: {
            type: 'ChartStackedBar_Plain',
            data: wrap( {"Product A": [109, 102, 90, 102, 102, 104], "Product B": [113, 108, 114, 97, 104, 112], "Product C": [93, 102, 96, 111, 102, 117]},  ),
            theme: 'e',
        },     
    },
];

const stackedbarchart_choices = [
    { 
        ..._choice_base,
        template_id: 'vislit_stackedbar_product_a',
        instruction: q('product'),
        client_items: PRODUCTS,
        chart_def: {
            type: 'ChartStackedBar_Plain',
            data: wrap( {"Product A": [184, 222, 103, 180, 129, 225], "Product B": [106, 103, 147, 50, 73, 83], "Product C": [82, 109, 89, 145, 96, 112]} ),
            theme: 'a',
        },
        solution: 'Product A',
    },{
        ..._choice_base,
        template_id: 'vislit_stackedbar_product_b',
        instruction: q('product'),
        client_items: PRODUCTS,
        chart_def: {
            type: 'ChartStackedBar_Plain',
            data: wrap( {"Product A": [104, 135, 151, 157, 117, 132], "Product B": [178, 129, 127, 188, 217, 174], "Product C": [92, 92, 98, 100, 100, 105] } ),
            theme: 'c',
        },
        solution: 'Product B',
    },{
        ..._choice_base,
        template_id: 'vislit_stackedbar_year_a',
        instruction: q('year'),
        client_items: YEARS,
        chart_def: {
            type: 'ChartStackedBar_Plain',
            data: wrap( {"Product A": [104, 119, 125, 142, 172, 188], "Product B": [89, 120, 176, 212, 255, 261], "Product C": [157, 206, 108, 80, 140, 238]} ),
            theme: 'b',
        },
        solution: '2018',
    },{
        ..._choice_base,
        template_id: 'vislit_stackedbar_year_b',
        instruction: q('year'),
        client_items: YEARS,
        chart_def: {
            type: 'ChartStackedBar_Plain',
            data: wrap( {"Product A": [93, 207, 90, 103, 91, 94], "Product B": [112, 109, 78, 104, 114, 76], "Product C": [109, 103, 106, 98, 109, 100]} ),
            theme: 'd',
        },
        solution: '2014',
    }
];


////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////


const vislit_stackedbar = ({
    gen_type: LinearGen,
    pages: [

        ...barchart_sales_task_description,
        ...stackedbarchart_familiarity,

        ({
            gen_type: ShuffleGen,
            pages: [
                ...stackedbarchart_choices
            ]
        }: GenType),
    ]
}: GenType);


module.exports = { vislit_stackedbar  };
