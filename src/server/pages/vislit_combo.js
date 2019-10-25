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

const TREND = [
    '1. Decreased',
    '2. Not changing',
    '3. Increased',
    '4. Unknown',
]
const LIKERT_IMPORTANCE = [ 
    '1. Unimportant',
    '2. Neutral',
    '3. Important',
    '4. Can not tell from chart',
];
const LIKERT_AGREE = [ 
    '1. Strongly disagree', 
    '2. Disagree',
    '3. Somewhat disagree',
    '4. Neither agree nor disagree',
    '5. Somewhat agree',
    '6. Agree',
    '7. Strongly agree'
];

////////////////////////////////////////////////////////////
// Combo Chart
////////////////////////////////////////////////////////////


const combo_task = [
    {
        ..._text_base,
        template_id: 'vislit_combo_task',
        description: `This next series of charts compare the number of sales people 
                employed by the company, with the company's overall profits.
                <br/><br/>
                You will be asked several different questions about this relationship.
                <br/><br/>`,
        instruction: 'Continue when you feel comfortable with this task.',
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/combo_familiar.png',
            data: null,
        },
        time_limit: null,
    } 
];


const combo_familiarity = [
    {
        ..._choice_base,
        template_id: 'vislit_combo_familiarity',
        instruction: 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.',
        client_items: LIKERT_AGREE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/combo_familiar.png',
            data: null,
        },
        time_limit: null,
    } 
];



const combo = [
{
        ..._choice_base,
        template_id: 'vislit_combo_trend_a',
        instruction: 'Has the number of salespeople changed over the 6 years?',
        client_items: TREND,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/combo_a.png',
            data: [ ],
        },
        solution: '1. Decreased'
    },{
        ..._choice_base,
        template_id: 'vislit_combo_trend_b',
        instruction: 'Has the amount of profit changed over the 6 years?',
        client_items: TREND,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/combo_b.png',
            data: [  ],
        },
        solution: '3. Increased', 
    },{
        ..._choice_base,
        template_id: 'vislit_combo_cause_c',
        instruction: `Based on the chart, how important is the number of sales people to increasing the company's profits?`,
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/combo_c.png',
            data: [ ],
        },
        solution: '1. Unimportant',
    },{
        ..._choice_base,
        template_id: 'vislit_combo_highest_d',
        instruction: 'What year had the highest profit?',
        client_items: [ '2014', '2015', '2016', '2017', '2018', '2019' ],
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/combo_d.png',
            data: [ ],
        },
        solution: '2016', 
    },
];




////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////


const vislit_combo = ({
    gen_type: LinearGen,
    pages: [

        ...combo_task,
        ...combo_familiarity,
        ...combo,
        /*
        ({
            gen_type: ShuffleGen,
            pages: [
                ...combo
            ]
        }: GenType),
        */
    ]
}: GenType);

module.exports = { vislit_combo };