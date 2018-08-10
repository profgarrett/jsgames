// @flow

export type LevelType = {
	_id: string,
	code: string,
	username: string,
	type: string,

	seed: number,

	title: string,
	description: string,
	updated: Date,
	created: Date,

	completed: boolean,

	pages: Array<PageType>,
	history: Array<Object>,

	allow_skipping_tutorial: boolean,

	get_score_as_array: (any, any, any, any) => Array<Object>,
	get_new_page: (Object) => Object,
	toJson: () => Object,
	toJsonString: () => string
};


// Fields common to all pages.
export type PageType = {
	type: string,

	code: string,
	description: string,
	instruction: string,
	client_feedback: Array<string>,
	solution_feedback: Array<Function>,

	correct: boolean,
	correct_required: boolean,
	completed: boolean,
	show_feedback_on: boolean,

	+get_feedback: () => ?string,
	+client_has_answered: () => boolean,
	updateUserFields: (Object) => void,
	history: Array<Object>,
	+toJson: Function
};


export type TextPageType = {

	// Copy from PageType
	type: string,

	code: string,
	description: string,
	instruction: string,
	feedback: Array<string>,
	solution_feedback: Array<Function>,

	correct: boolean,
	correct_required: boolean,
	completed: boolean,
	show_feedback_on: boolean,
	
	+client_has_answered: () => boolean,	
	+get_feedback: () => ?string,
	updateUserFields: (Object) => void,
	history: Array<Object>,
	+toJson: Function,
	// End Copy

	client_read: boolean
};


export type ChoicePageType = {

	// Copy from PageType
	type: string,

	code: string,
	description: string,
	instruction: string,
	feedback: Array<string>,
	solution_feedback: Array<Function>,

	correct: boolean,
	correct_required: boolean,
	completed: boolean,
	show_feedback_on: boolean,
	
	client_has_answered: () => boolean,	
	get_feedback: () => ?string,
	updateUserFields: (Object) => void,
	history: Array<Object>,
	toJson: Function,
	// End Copy

	client: string,
	client_items: Array<string>,
	solution: string

};



export type ParsonsPageType = {

	// Copy from PageType
	type: string,

	code: string,
	description: string,
	instruction: string,
	feedback: Array<string>,
	solution_feedback: Array<Function>,

	correct: boolean,
	correct_required: boolean,
	completed: boolean,
	show_feedback_on: boolean,
	
	client_has_answered: () => boolean,	
	get_feedback: () => ?string,
	updateUserFields: (Object) => void,
	history: Array<Object>,
	toJson: Function,
	// End Copy

	helpblock: string,
	potential_items: Array<string>,
	solution_items: Array<string>,
	client_items: Array<string>
};


export type FormulaPageType = {
	// Copy from PageType
	type: string,

	code: string,
	description: string,
	instruction: string,
	feedback: Array<string>,
	solution_feedback: Array<Function>,

	correct: boolean,
	correct_required: boolean,
	completed: boolean,
	show_feedback_on: boolean,

	client_has_answered: () => boolean,	
	get_feedback: () => ?string,
	updateUserFields: (Object) => void,
	history: Array<Object>,
	toJson: Function,
	// End Copy

	helpblock: string,

	tests: Array<Object>,
	column_titles: Array<string>,
	column_formats: Array<string>,

	client_f: string,
	client_f_format: string,
	client_test_results: Array<Object>,

	solution_f: string,
	solution_f_match: Function,
	solution_test_results: Array<Object>,
	solution_f_visible: boolean,
	solution_test_results_visible: boolean
};




/**
	Generator are used to create pages.

	They are smart functions that will create new pages in a deterministic fashion.
	This means that given the same input, they will also provide the same output.

	Any random behavior requires a seed value given by the level.
*/

export type GenType = {
	gen: Function,
	until: ?Function,
	pages: Array<PageType | GenType>
};

export type AdaptiveGenType = {
	gen: Function,
	until: Function,
	tutorial_gen: GenType,
	test_gen: GenType
};

