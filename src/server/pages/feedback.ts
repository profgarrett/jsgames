import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';

/**
	Easy way of getting feedback from students
**/


const t_base = {
	type: 'IfPageShortTextAnswerSchema',
	show_feedback_on: false,
	instruction: 'Answer this question',
	description: 'Provide feedback',
	code: 'tutorial',    
	template_id: 'feedback_text',
};


const m_base = {
	type: 'IfPageLongTextAnswerSchema',
	show_feedback_on: false,
	instruction: 'Answer this question',
	description: 'Provide feedback',
	code: 'tutorial',    
	template_id: 'feedback_memo',
};

const n_base = {
	type: 'IfPageNumberAnswerSchema',
	show_feedback_on: false,
	code: 'tutorial',
	instruction: `Answer the given question.`,
	description: 'Provide feedback as a number (with no letters)',
	template_id: 'feedback_number',
	correct_required: false,
};


const feedback_base: LevelSchemaFactoryType = {
	code: '...',
	title: 'Feedback',
	description: 'Give quick feedback.',
	show_score_after_completing: false,
	version: 1.0,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
//			m_base
		],
	})
};

const feedback_n = {
	...feedback_base,
	code: 'feedback_n',
	gen: { gen_type: 'LinearGen', pages: [ n_base ]}
};
const feedback_t = {
	...feedback_base,
	code: 'feedback_t',
	gen: { gen_type: 'LinearGen', pages: [ t_base ]}
};
const feedback_m = {
	...feedback_base,
	code: 'feedback_nm',
	gen: { gen_type: 'LinearGen', pages: [ m_base ]}
};
const feedback_nm = {
	...feedback_base,
	code: 'feedback_nm',
	gen: { gen_type: 'LinearGen', pages: [ n_base, m_base ]}
};


export { feedback_n, feedback_t, feedback_nm, feedback_m };

