import type { GenType } from '../Gens';
import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';

const sample_page1 = { 
			gen_type: 'LinearGen',
			pages: [
				{	type: 'IfPageTextSchema',
					description: `Test module for load testing.`,
					instruction: `Click the <code>Next page</code> button on 
						the bottom-right of the screen.`,
				},
			]
		}
const sample_page2 = {
    	type: 'IfPageFormulaSchema',
        description: `Test page. Input =a1 + b1 to continue`,
        instruction: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sed nisi ante. Maecenas vitae sem eget elit sodales rhoncus. Donec ut nisl fringilla, vulputate augue eu, dapibus purus. Quisque ultricies neque in mi volutpat posuere. Sed ut felis diam. Maecenas molestie eros et nisi fringilla laoreet. Duis et porta turpis. Ut sollicitudin commodo lacus, eget bibendum augue aliquet a. Etiam in maximus purus, vitae maximus odio. Nulla auctor posuere nunc non tincidunt.
                Donec odio tellus, ornare ut mattis vitae, rhoncus nec est. Aliquam vel ligula non eros euismod eleifend. Vestibulum sodales ultricies scelerisque. Donec rutrum rhoncus nibh eget pulvinar. Phasellus blandit diam suscipit, volutpat magna tincidunt, sollicitudin arcu. Donec non mi quam. Nulla malesuada est sem, a consectetur enim imperdiet eget. 
                `,
        column_titles: ['Year 1', 'Year 2', 'Year 3'],
        tests: [{ 'a': 23, 'b': 55, 'c': 43 },
            { 'a': 23, 'b': 55, 'c': 43 },
            { 'a': 23, 'b': 55, 'c': 43 },
            { 'a': 23, 'b': 55, 'c': 43 },
            { 'a': 23, 'b': 55, 'c': 43 },
            { 'a': 23, 'b': 55, 'c': 43 },
            { 'a': 23, 'b': 55, 'c': 43 },
            { 'a': 23, 'b': 55, 'c': 43 },
        ],
        solution_f: '=a1+b1',
        code: 'tutorial'
    };

const sample_page8 = {
    	type: 'IfPageChoiceSchema',
        description: 'Some page ask you to select an item from a list.',
        instruction: 'How comfortable are you with this tutorial?',
        client_items: ['Very comfortable', 'Comfortable', 'Neutral', 'Uncomfortable', 'Very uncomfortable'],
        show_feedback_on: false
    };



const loadtest: LevelSchemaFactoryType = {
	code: 'loadtest',
	title: 'Used for system load testing',
	description: 'NA.',
	show_score_after_completing: false,
	version: 1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			sample_page1,
            sample_page2,
            structuredClone(sample_page2),
            structuredClone(sample_page2),
            structuredClone(sample_page2),
            structuredClone(sample_page2),
            structuredClone(sample_page2),
            structuredClone(sample_page2),
            structuredClone(sample_page2),
            sample_page8
        ],
	})
};


export {loadtest};