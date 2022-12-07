/**
	Demographic Information
**/


const _number_base = {
    type: 'IfPageShortTextAnswerSchema',
    description: 'Demographic Information',
    show_feedback_on: false,
    code: 'test',
    time_mimimum: 2,
};

const _choice_base = {
    type: 'IfPageChoiceSchema',
	show_feedback_on: false,
    code: 'test',
    solution: '*',
    correct_required: false,
    description: '',
    time_mimimum: 2,
};


const LIKERT_AGREE = [ 
    '1. Strongly disagree', 
    '2. Disagree',
    '3. Somewhat disagree',
    '4. Neither agree nor disagree',
    '5. Somewhat agree',
    '6. Agree',
    '7. Strongly agree'
];

const LIKERT_FAMILIAR = [
    '1. Not at all familiar',
    '2. Slightly familiar',
    '3. Somewhat familiar',
    '4. Moderately familiar',
    '5. Extremely familiar',
];

const amt_demographics = [
    {	..._choice_base,
        instruction: 'What is your age?',
        client_items: [ '18-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90 and over'],
        template_id: 'mechanicalturk_age',
    },
    {	..._choice_base,
        instruction: 'What is your highest level of education?',
        client_items: [ '1. High school or less', '2. Some college', '3. Associates', '4. Bachelors', '5. Masters', '6. Doctoral'],
        template_id: 'mechanicalturk_education',
    },
    {	..._choice_base,
        instruction: 'How familiar are you with the stock market?',
        client_items: LIKERT_FAMILIAR,
        template_id: 'mechanicalturk_stockmarket',
    },
    {
        ..._choice_base,
        instruction: `Have you ever purchased stock in a publicly-traded company?`, 
        client_items: ['1. No', '2. Yes', '3. Not sure'],
        template_id: 'mechanicalturk_stockpurchase',
    },

];

export { amt_demographics };
