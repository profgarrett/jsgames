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


////////////////////////////////////////////////////////////
// A) Bar CHart Unlabeled Axis
////////////////////////////////////////////////////////////

const LIKERT_IMPORTANCE = [ 
    '1. Absolutely unimportant', 
    '2. Unimportant',
    '3. Somewhat unimportant',
    '4. Neutral',
    '5. Somewhat important',
    '6. Important',
    '7. Absolutely important'
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
// Pie Chart - 2d
////////////////////////////////////////////////////////////


const pie2d_familiarity = [
    {
        ..._choice_base,
        template_id: 'vislit_pie2d_familiarity',
        instruction: 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.',
        client_items: LIKERT_AGREE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_2d_familiar.png',
            data: null,
        },
        time_limit: null,
    } 
];



const pie2d_task = [
    {
        ..._text_base,
        template_id: 'vislit_pie2d_task',
        description: `This next series of charts show the performance of a company's different products.
                <br/><br/>
                You will be asked to rate the importance of a product to the overall company's success.
                <br/><br/>`,
        instruction: 'Continue when you feel comfortable with this task.',
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_2d_familiar.png',
            data: null,
        },
        time_limit: null,
    } 
];





const pie2d = [
{
        ..._choice_base,
        template_id: 'vislit_pie2d_select_A',
        instruction: 'How important is Area D to the overall company?',
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_2d_a.png',
            data: [ 12.3, 36.6, 24.3, 26.8],
        },
        solution: '*' // 27
    },{
        ..._choice_base,
        template_id: 'vislit_pie2d_select_B',
        instruction: 'How important is Product 4 to the overall company?',
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_2d_b.png',
            data: [ 31, 21, 27, 21 ],
        },
        solution: '*', // 21%
    },{
        ..._choice_base,
        template_id: 'vislit_pie2d_select_C',
        instruction: 'How important is Series C to the overall company?',
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_2d_c.png',
            data: [ 16, 20, 25, 14, 25],
        },
        solution: '*', //25 IN FRONT, no distortion
    },{
        ..._choice_base,
        template_id: 'vislit_pie2d_select_D',
        instruction: 'How important is Series A to the overall company?',
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_2d_d.png',
            data: [ 18, 7, 75],
        },
        solution: '*', // 18
    },
];



const pie3d_familiarity = [
    {
        ..._choice_base,
        template_id: 'vislit_pie3d_familiarity',
        description: 'Rate your agreement with the statement below. <br/><br/>I am familiar with this style of chart.',
        client_items: LIKERT_AGREE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_3d_familiar.png',
            data: null,
        },
        time_limit: null,
    }
];



const pie3d_task = [
    {
        ..._text_base,
        template_id: 'vislit_pie2d_task',
        description: `This next series of chart shows the distribution of sales a company has in different regions.
                <br/><br/>
                You will be asked to rate how important you feel each area is to the company's success.
                `,
        instruction: `Continue when you feel comfortable with this task.`,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_2d_familiar.png',
            data: null,
        },
        time_limit: null,
    } 
];


const pie3d = [
    {
        ..._choice_base,
        template_id: 'vislit_pie3d_select_A',
        instruction: 'How important is Region D to the overall company?',
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_3d_a.png',
            data: [ 12.3, 36.6, 24.3, 26.8],
        },
        solution: '*' // 27
    },{
        ..._choice_base,
        template_id: 'vislit_pie3d_select_B',
        instruction: 'How important is West to the overall company?',
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_3d_b.png',
            data: [ 31, 21, 27, 21 ],
        },
        solution: '*', // 21%
    },{
        ..._choice_base,
        template_id: 'vislit_pie3d_select_C',
        instruction: 'How important is Group C to the overall company?',
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_3d_c.png',
            data: [ 16, 20, 25, 14, 25],
        },
        solution: '*', //25 IN FRONT
    },{
        ..._choice_base,
        template_id: 'vislit_pie3d_select_D',
        instruction: 'How important is Area 1 to the overall company?',
        client_items: LIKERT_IMPORTANCE,
        chart_def: {
            type: 'ChartImage',
            src: '/static/vislit/pie_3d_d.png',
            data: [ 18, 7, 75],
        },
        solution: '*', // 18
    },
];

////////////////////////////////////////////////////////////
// Compiled
////////////////////////////////////////////////////////////


const vislit_pie_2d = ({
    gen_type: LinearGen,
    pages: [

        ...pie2d_task,
        ...pie2d_familiarity,

        ({
            gen_type: ShuffleGen,
            pages: [
                ...pie2d
            ]
        }: GenType),
    ]
}: GenType);

const vislit_pie_3d = ({
    gen_type: LinearGen,
    pages: [

        ...pie3d_task,
        ...pie3d_familiarity,

        ({   
            gen_type: ShuffleGen,
            pages: [
                ...pie3d
            ]
        }: GenType),
    ]
}: GenType);

module.exports = { vislit_pie_2d, vislit_pie_3d };