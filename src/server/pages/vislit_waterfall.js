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
    '4. Neither agree nor disagree',
    '5. Somewhat agree',
    '3. Somewhat disagree',
    '6. Agree',
    '7. Strongly agree',
];


// Create a normal array of data.
function wrapGood( chart_def: Object ): Object {
    const labels = chart_def.labels;
    const data = chart_def.data;
    const wrapped_data = [];
    let running_total = 0;


    // Start building.
    for(let i=0; i<labels.length; i++ ){
        wrapped_data.push({ 
            'Year': labels[i],  /// ugly hack, but it works for now. It's a string, so it doesn't have much effect.
            'Padding': running_total + (data[i] < 0 ? data[i] : 0), // reduce padding if neg
            'Positive': data[i] > 0 ? data[i] : 0,
            'Negative': data[i] < 0 ? -1*data[i] : 0, // turn to positive
        });
        running_total = running_total + data[i];
    }
    return { ...chart_def, data: wrapped_data };
}

// Create a normal array of data, *except for the last item which has no padding*
function wrapBad( chart_def: Object ): Object {
    const c2 = wrapGood(chart_def);
    c2.data[c2.data.length-1].Padding = 0;

    return c2;
}




////////////////////////////////////////////////////////////
// Stacked Bar Chart - Label Axis
////////////////////////////////////////////////////////////


//const DISTORTION_SMALL = 0.5;
//const DISTORTION_MEDIUM = 0.9;

const waterfallchart_absolute_familiarity = [

    {   ..._choice_base, 
        chart_def: wrapGood({
            type: 'ChartWaterfall_Plain',
            labels: ['Profit Region A', 'Profit Region B', 'Profit Region C', 'Profit Region D', 'Profit Region E'],
            data: [200, 300, -150, -50, 350 ],
            max: 400,
            theme: 'a',
        }),
        instruction: 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.',
        client_items: LIKERT_AGREE,
        template_id: 'vislit_waterfall_absolute_familiarity',
        time_limit: null,
    }, 
];



const waterfallchart_absolute_task = [
    {   ..._text_base,
        template_id: 'vislit_waterfall_absolute_task',
        description: `The next series of pages will ask you to identify specific periods 
            (such as the largest increase or decrease), and the ending value
            of the data series.
            <br/><br/>
            Contine when you feel comfortable with this task.`,
        chart_def: wrapGood({
            type: 'ChartWaterfall_Plain',
            labels: ['Profit Region A', 'Profit Region B', 'Profit Region C', 'Profit Region D', 'Profit Region E'],
            data: [200, 300, -150, -50, 350 ],
            max: 400,
            theme: 'a',
        }),
    },
];


const waterfall_absolute = [


    {   ..._choice_base, 
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['California', 'Texas', 'Oregon', 'Other Gains', 'Investments'],
            data: [800, -200, -300, 500, 200 ],
            max: 2000,
            theme: 'b',
        },
        instruction: `Estimate the company's overall earnings.`,
        client_items: [ 200, 300, 750, 1000, 1500],
        solution: 1000,
        template_id: 'EndingPositiveA',
    }, 
    { ..._choice_base, 
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['Profit 2010', 'Profit 2011', 'Profit 2012', 'Profit 2013', 'Profit 2014'],
            data: [500, 400, 100, -200, 400 ],
            max: 2000,
            theme: 'c',
        },
        instruction: 'Around how much did the company earn in total during the 5 years?',
        client_items: [ 300, 500, 800, 1200, 1500],
        solution: 1200,
        template_id: 'EndingPositiveB',
    },


    {   ..._choice_base, 
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['California', 'Texas', 'Oregon', 'Other Gains', 'Taxes'],
            data: [800, -200, 500, 400, -300 ],
            max: 2000,
            theme: 'b',
        },
        instruction: 'How much did the company make overall?',
        client_items: [ 300, 750, 1000, 1200, 1500],
        solution: 1200,
        template_id: 'EndingNegativeA',
    }, 
    { ..._choice_base, 
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['Profit 2010', 'Profit 2011', 'Profit 2012', 'Profit 2013', 'Profit 2014'],
            data: [500, 400, -100, 200, -300 ],
            max: 2000,
            theme: 'c',
        },
        instruction: 'How much did the company earn in total during the 5 years?',
        client_items: [ 300, 500, 700, 1000, 1200],
        solution: 700,
        template_id: 'EndingNegativeB',
    },

    {   ..._choice_base, 
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['Sales', 'Pharmacy', 'Coupons', 'Payroll', 'Legal', 'Gains', 'Taxes' ],
            data: [1900, -400, -100, -800, -100, 1500, -200],
            max: 2000,
            theme: 'd',
        },
        instruction: 'What item had the biggest <b>negative</b> effect?',
        solution: 'Payroll',
        client_items: ['Sales', 'Pharmacy', 'Coupons', 'Payroll', 'Legal', 'Gains', 'Taxes' ],
        template_id: 'IdentifyNegativeA',
    },
    {   ..._choice_base, 
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['Region A', 'Region B', 'Region C', 'Region D', 'Region E' ],
            data: [2000, -1000, 200, -500, 700],
            max: 2000,
            theme: 'e',
        },
        instruction: 'What region had the biggest <b>negative</b> effect?',
        solution: 'Region B',
        client_items: ['Region A', 'Region B', 'Region C', 'Region D', 'Region E' ],
        template_id: 'IdentifyNegativeB',
    },

    {   ..._choice_base, 
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['Coffee', 'Pharmacy', 'Coupons', 'Payroll', 'Legal', 'Gains', 'Taxes' ],
            data: [700, 900, 300, -1200, -100, 300, -200],
            max: 2000,
            theme: 'a',
        },
        instruction: 'What area had the biggest <b>positive</b> effect?',
        solution: 'Pharmacy',
        client_items: ['Coffee', 'Pharmacy', 'Coupons', 'Payroll', 'Legal', 'Gains', 'Taxes' ],
        template_id: 'IdentifyPositiveA',
    },
    {   ..._choice_base, 
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['Region A', 'Region B', 'Region C', 'Region D', 'Region E' ],
            data: [300, 500, -700, 200, 200],
            max: 2000,
            theme: 'b',
        },
        instruction: 'What region had the biggest <b>positive</b> effect?',
        solution: 'Region B',
        client_items: ['Region A', 'Region B', 'Region C', 'Region D', 'Region E' ],
        template_id: 'IdentifyPositiveB',
    }
];

// Wrap 
waterfall_absolute.forEach( def => def.chart_def = wrapGood( def.chart_def ));
waterfall_absolute.forEach( def => def.template_id = 'vislit_Waterfall_absolute_' + def.template_id);





////////////////////////////////////////////////////////////
/**
    This series of questinos use relative waterfalls, where each bar (except the two on the outer edges)
    measures change between the two outer values.
 */
 const waterfallchart_relative_familiarity = [

    {   ..._choice_base, 
        chart_def: wrapBad({
            type: 'ChartWaterfall_Plain',
            labels: ['Profit Year 2018', 'Sales', 'Expenses', 'Taxes', 'Profit Year 2019'],
            data: [1200, -300, 200, -100, 1000 ],
            max: 1500,
            theme: 'round_a',
        }),
        instruction: 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.',
        client_items: LIKERT_AGREE,
        template_id: 'vislit_waterfall_relative_familiarity',
        time_limit: null,
    }, 
];


const waterfallchart_relative_task = [
    {   ..._text_base,
        description: `The next series of pages uses waterfall charts to show changes from one period to another.
            You will asked to identify the largest increase, decrease, or the ending value. 
            <br/><br/>
            Contine when you feel comfortable with this task.`,
        chart_def: wrapBad({
            type: 'ChartWaterfall_Plain',
            labels: ['Profit Year 2018', 'Sales', 'Expenses', 'Taxes', 'Profit Year 2019'],
            data: [1200, -300, 200, -100, 1000 ],
            max: 1500,
            theme: 'round_a',
        }),
        template_id: 'vislit_waterfall_relative_task',
    },
];

const waterfall_relative = [

    {   ..._choice_base,
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['2016 Results', 'Volume', 'Pricing', 'Contribution', 'Structural', 'Exchange', '2017 Results'],
            data: [2000, 400, 200, -500, -700, -400,  1000],
            max: 3000,
            theme: 'round_a',
        },
        instruction: 'What did the company earn in 2017?',
        client_items: [ 200, 400, 1000, 2000, 2500],
        solution: 1000,
        template_id: 'EndingA',
    },
    {   ..._choice_base,
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['Start Profit', 'Region A', 'Region B', 'Region C', 'Taxes', 'End Profit'],
            data: [ 1400, -200, 300, 150, -50, 1600],
            max: 2000,
            theme: 'round_b',
        },
        instruction: `What was the company's ending profit?`, 
        client_items: [ 300, 500, 1400, 1600, 2000 ],
        solution: 1600,
        template_id: 'EndingB',
    },
    {   ..._choice_base,
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['2009 Results', 'Prices', 'Volume', 'Operations', 'Bad Debt', '2010 Results'],
            data: [900, 200, -600, 400, 100, 1000],
            max: 2000,
            theme: 'round_c',
        },
        instruction: 'What caused the biggest <b>increase</b> in earnings between 2009 and 2010?',
        client_items: ['2009 Results', 'Prices', 'Volume', 'Operations', 'Bad Debt', '2010 Results'],
        solution: 'Operations',
        template_id: 'IdentifyChangeA',
    },
    {   ..._choice_base,
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['2009 Results', 'Prices', 'Volume', 'Operations', 'Bad Debt', '2010 Results'],
            data: [600, 300, -400, 600, -200, 900],
            max: 2000,
            theme: 'round_d',
        },
        instruction: 'What caused the biggest <b>decrease</b> in earnings between 2009 and 2010?',
        client_items: ['2009 Results', 'Prices', 'Volume', 'Operations', 'Bad Debt', '2010 Results'],
        solution: 'Volume',
        template_id: 'IdentifyChangeB',
    },
    {   ..._choice_base,
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['2013 Results', 'Price', 'Operations', 'Interest', 'Special', 'Taxes', '2014 Results'],
            data: [1200, 200, -100, -400, -100, 200, 1000],
            max: 2000,
            theme: 'round_e',
        },
        instruction: 'How much did the company pay in taxes this year?',
        client_items: [-200, 100, 200, 1000, 'Other/Unknown'],
        solution: 'Other/Unknown',
        template_id: 'RelativeOrAbsoluteA',
    },
    {   ..._choice_base,
        chart_def: {
            type: 'ChartWaterfall_Plain',
            labels: ['2016 Results', 'Price', 'Operations', 'Interest', 'Special', 'Taxes', '2017 Results'],
            data: [800, 200, -100, 200, 300, -100, 1300],
            max: 2000,
            theme: 'round_f',
        },
        instruction: 'How much did the company gain from operations this year?',
        client_items: [ -100, 100, 1000, 1400, 'Other/Unknown'],
        solution: 'Other/Unknown',
        template_id: 'RelativeOrAbsoluteB',
    },
];

// Wrap 
waterfall_relative.forEach( def => def.chart_def = wrapBad( def.chart_def ));
waterfall_relative.forEach( def => def.template_id = 'vislit_Waterfall_relative_' + def.template_id);


////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////


const vislit_waterfall_absolute = ({
    gen_type: LinearGen,
    pages: [

        ...waterfallchart_absolute_task,
        ...waterfallchart_absolute_familiarity,
        
        ({
            gen_type: ShuffleGen,
            pages: [
                ...waterfall_absolute,
            ]
        }: GenType),
    ]
}: GenType);

const vislit_waterfall_relative = ({
    gen_type: LinearGen,
    pages: [

        ...waterfallchart_relative_task,
        ...waterfallchart_relative_familiarity,
        
        ({   
            gen_type: ShuffleGen,
            pages: [
                ...waterfall_relative,
            ]
        }: GenType),
    ]
}: GenType);

module.exports = { vislit_waterfall_absolute, vislit_waterfall_relative };
