// @flow
/**
	Visual Literacy Test
**/
const { LinearGen, ShuffleGen } = require('./../Gens');
import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';
const { VISLIT_MIN_TIME_PER_SLIDE, VISLIT_TIME_PER_SLIDE, DISTORTION_MEDIUM, DISTORTION_SMALL } = require('./../secret.js');


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
    time_minimum: VISLIT_MIN_TIME_PER_SLIDE,
    description: '',
}

const TREND = [
    'Decreased',
    'Not changing',
    'Increased',
    'Unknown',
]
const LIKERT_IMPORTANCE = [ 
    '1. Unimportant',
    '2. Neutral',
    '3. Important',
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
// Scatter Chart
////////////////////////////////////////////////////////////


const scatter_task = [
    {
        ..._text_base,
        template_id: 'vislit_scatter_task',
        description: `This next series of charts compare the data on a scatterplot.
                <br/><br/>`,
        instruction: 'Continue when you feel comfortable with this task.',
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/scatter_a.png',
            data: null,
        },
        time_limit: null,
    } 
];


const scatter_familiarity = [
    {
        ..._choice_base,
        template_id: 'vislit_scatter_familiarity',
        instruction: 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.',
        client_items: LIKERT_AGREE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/scatter_a.png',
            data: null,
        },
        time_limit: null,
    } 
];



const scatter = [
{
        ..._choice_base,
        template_id: 'vislit_scatter_trend_a',
        instruction: 'Which of the following statements best describes the data in the chart below?',
        client_items: [
            'A. In recent years, people are driving their cars more',
            'B. Some cars are driven more than others',
            'C. The more years cars are driven, the more miles they cover',
            'D. Cars are increasingly being driven more'],
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/scatter_a.png',
            data: [ ],
        },
        solution: 'C. The more years cars are driven, the more miles they cover',
        time_limit: null,
    },
];




////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////


const vislit_scatter = ({
    gen_type: LinearGen,
    pages: [

        ...scatter_task,
        ...scatter_familiarity,
        ...scatter,
        /*
        ({
            gen_type: ShuffleGen,
            pages: [
                ...scatter
            ]
        }: GenType),
        */
    ]
}: GenType);

module.exports = { vislit_scatter };