// @flow


export type LevelType = {
	code: string,
	pages: Array<PageType>,
	get_score_as_array: (any, any, any) => Array<Object>
};

export type PageType = {
	type: string,
	description: string
};
