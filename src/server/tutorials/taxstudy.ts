import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';

/*
	Tax Decision Support study. Built on the same pattern as testprolificstudy.ts.

	Flow:
		consent -> background (12 pages) -> tax knowledge (intro + 6)
		-> scenario instructions (worded by condition)
		-> 3 scenario blocks, order shuffled per participant:
			video with the pre estimate question below it (one page) -> pre reason/confidence/difficulty
			-> advisor, with the post estimate question below it on the same page
			-> post reason/confidence/difficulty -> cogfit
		-> scenarios-completed page -> end questions (5, incl. attention check) -> debrief -> finish

	Access:
		- WVU students: Google login, join the study's section, open /ifgame/levels/taxstudy.
		- Link: /prolific?level=taxstudy&section=<join code>&PROLIFIC_PID=<id> also works.
		  The consent below is written for WVU students, and there is no completion code.

	Conditions (between-subjects, 3 arms): FAQ, short AI, long AI with citations.
		Every page with `versions_by_condition: true` lists its versions in the order
		[FAQ, SHORT_AI, LONG_AI]. IfLevelSchemaFactory picks one index per participant, so the
		instructions page and all 3 advisor pages agree, and the pick is independent of the
		scenario shuffle. Each version tags the page (condition_faq / condition_short_ai /
		condition_long_ai); exports carry it as the participant's condition.

	Variable names from the survey doc are stored as each page's template_id
	(e.g. s1_pre_estimate), and exported as a_template_id. The post estimate lives on the
	advisor page (question_id sN_post_estimate); /api/reports/answers gives it its own row.

	Before launch: replace the video placeholders (VIDEO_URLS), and review the system prompts.
*/

/////////////////////////////////////////////////////////////////////////////////////////
// Settings you are most likely to change.

// Unlisted YouTube/Vimeo *embed* URLs. While empty, the video page shows the script instead.
const VIDEO_URLS = {
	s1: '',
	s2: '',
	s3: '',
};

// Messages a participant may send per advisor chat.
const MAX_TURNS = 30;

// Shared by both AI conditions, so only the style instructions differ between them.
const PROMPT_BASE = `You are a general-purpose chatbot.
If a question is not about taxes, briefly say that you can only help with tax questions.
NEVER ask for Social Security numbers, account numbers, or other personal identifying information.
Write in plain text only. Do not use Markdown (no headings, bold, italics, or tables).
Assume that they live in the US in West Virginia.
`;

const PROMPT_SHORT_AI = `${PROMPT_BASE}

Style: short, conversational, and friendly.
Keep each reply to about 2 to 4 sentences (under 80 words).
Use everyday words at about an 8th-grade reading level.
Do not include citations or references to IRS publications, forms, or the tax code.`;

const PROMPT_LONG_AI = `${PROMPT_BASE}

Style: formal, thorough, and precise.
Give a complete explanation of about 200 to 350 words, in several paragraphs: the applicable rule, how it applies, and the conclusion.
Write at a college reading level.
Support each rule with citations to authoritative sources, such as IRS publications, IRS Tax Topics, form instructions, or the Internal Revenue Code, written inline in parentheses, for example (IRS Publication 970, Tax Benefits for Education) or (IRC section 117).`;

// Cap on output tokens per AI reply. The model (gpt-6.1-sol, reasoning effort low) is set in
// src/server/openai_chat.ts. The cap includes reasoning tokens, and hitting it while the model is
// still reasoning returns an empty reply, so these are ceilings, not length targets. The prompts
// control length.
const SHORT_AI_SETTINGS = { max_tokens: 2000 };
const LONG_AI_SETTINGS = { max_tokens: 4000 };


/////////////////////////////////////////////////////////////////////////////////////////
// Page bases.

const _text = {
	type: 'IfPageTextSchema',
	code: 'tutorial',
	show_feedback_on: false,
	time_minimum: 2,
};

// code 'test' makes an answer required before "Next page" is enabled.
const _choice = {
	type: 'IfPageChoiceSchema',
	code: 'test',
	solution: '*',
	instruction: 'Select one',
	show_feedback_on: false,
	time_minimum: 2,
};

// Scored item: stores correct/incorrect, never blocks or shows feedback.
const _choice_scored = {
	..._choice,
	correct_required: false,
};

const _number = {
	type: 'IfPageNumberAnswerSchema',
	code: 'test',
	show_feedback_on: false,
	time_minimum: 2,
	instruction: 'Type a number',
};

const _short_text = {
	type: 'IfPageShortTextAnswerSchema',
	code: 'test',
	show_feedback_on: false,
	time_minimum: 2,
	instruction: 'Type your answer',
};

const _long_text = {
	type: 'IfPageLongTextAnswerSchema',
	code: 'test',
	show_feedback_on: false,
	time_minimum: 2,
	instruction: 'Type your answer',
};

const CONFIDENCE_7 = ['Not at all confident', 'Slightly confident', 'Somewhat confident', 'Moderately confident', 'Fairly confident', 'Very confident', 'Extremely confident'];
const DIFFICULTY_7 = ['Extremely easy', 'Very easy', 'Moderately easy', 'Neither easy nor difficult', 'Moderately difficult', 'Very difficult', 'Extremely difficult'];
const AGREE_7 = ['Strongly disagree', 'Disagree', 'Slightly disagree', 'Neither agree nor disagree', 'Slightly agree', 'Agree', 'Strongly agree'];
const FREQ_7 = ['Never', 'Once or twice', 'Several times a year', 'Monthly', 'Weekly', 'Several times a week', 'Daily'];

const link = (url: string, title: string): string =>
	`<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;


/////////////////////////////////////////////////////////////////////////////////////////
// Consent (HRP-502e cover letter, from Survey 1.8).

const consent = {
	..._text,
	template_id: 'consent',
	instruction: 'Click "Next page" to agree and begin.',
	description: `
<h4>Research Participation Information</h4>
<h5>Tax Decision Support</h5>
<p><b>Principal investigator:</b> Nathan Garrett, PhD, CPA, West Virginia University, Nathan.Garrett@mail.wvu.edu, 304.293.7870</p>
<p>You are invited to take part in a research study about how people use a digital tax advisor to answer tax questions. Please read this information before deciding whether to participate. You must be at least 18 years old and currently enrolled as a WVU student to participate.</p>
<p><b>What will I do?</b> If you agree, you will answer background questions and a short set of general tax-knowledge questions. You will then work through three fictional tax situations. For each one, you will watch a short video, give an initial answer, use an assigned tax-advisor resource, and give a revised answer. You may also view additional facts about the fictional situation. After the three situations, you will answer questions about your experience and see the correct answers and explanations. The study should take approximately 30 to 45 minutes. The tax situations are fictional. The resource may give an incomplete or incorrect answer and should not be used for your own taxes.</p>
<p><b>What information will be collected?</b> We will collect your survey answers, initial and revised answers, written explanations, ratings, and information about how you use the website, such as which fact tabs you open and how long you spend on a task. We will collect your WVU email address to administer access and extra credit. Please do not enter your own tax details, financial information, or other personal information in the AI chat or written answers.</p>
<p><b>What are the risks?</b> You might feel brief frustration or embarrassment when answering an unfamiliar question. An advisor may provide incorrect tax information. Research information could also be disclosed despite safeguards. Throughout the study, do not include information about yourself or another real person. The study uses fictional cases, and you will receive the correct answers at the end.</p>
<p><b>Are there benefits or costs?</b> You may learn something about tax questions or the limits of online advice, but there is no expected direct benefit. There is no fee to participate. You will use your own internet-connected device.</p>
<p><b>Will I receive extra credit?</b> If this study is offered through your course, completing it will earn extra credit, according to the policies set by your faculty. You can earn the same amount by completing alternative assignments; again, see your faculty. Your decision to participate will not affect your standing in the course.</p>
<p><b>How will my information be protected and used?</b> Research responses will be associated with a study ID. Identifiers will be removed after extra credit and data checks are complete. De-identified information may be used in scholarly publications or shared to support further research. Before sharing written responses, the team will review them for identifying details. Results will be reported in summary form. We cannot promise complete confidentiality, particularly for text you input.</p>
<p><b>Is participation voluntary?</b> Yes. You may decline or stop at any time by closing the website. If you stop, information already submitted may still be used unless you ask the research team to remove it while it remains linked to your email address. After the identifying link has been deleted, the team may no longer be able to locate your responses for removal. You may choose the equivalent extra-credit activity instead of participating.</p>
<p><b>Who can answer my questions?</b> For questions about the study or a request to remove identifiable responses, contact Nathan Garrett at Nathan.Garrett@mail.wvu.edu or 304.293.7870. For questions about your rights as a research participant, contact the WVU Office of Human Research Protections at 304-293-7073 or IRB@wvu.edu.</p>
<p>By choosing to continue, you indicate that you have read this information, are at least 18 years old, and voluntarily agree to participate. You may save or print this page for your records.</p>
`,
};


/////////////////////////////////////////////////////////////////////////////////////////
// Background and demographic control variables.

const background = [
	{ ..._short_text, template_id: 'Username',
		description: 'What is your WVU MIX email address? (e.g., ndg0008@mix.wvu.edu)' },
	{ ..._number, template_id: 'BackAge',
		description: 'What is your age?' },
	{ ..._choice, template_id: 'BackClass',
		description: 'What is your current class standing?',
		client_items: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate student'] },
	{ ..._choice, template_id: 'BackTaxClass',
		description: 'Have you taken a college class focusing entirely on taxes?',
		client_items: ['Yes', 'No', 'Not sure'] },
	{ ..._short_text, template_id: 'BackMajor',
		description: 'What is your primary and (if any) secondary major?' },
	{ ..._choice, template_id: 'BackTaxesFiled',
		description: 'Have you ever filed a tax return with the IRS? If so, how?',
		client_items: [
			'I have never needed to file my taxes',
			'My parents took care of filing for me',
			'I worked with my parents and/or a tax professional',
			'Yes, entirely on my own',
			'Other',
		] },
	// Optional: code 'tutorial' lets the participant skip it.
	{ ..._short_text, code: 'tutorial', template_id: 'BackTaxesFiledOther',
		description: 'If you chose "Other" on the last question, please describe how you filed.',
		instruction: 'Type your answer, or click "Skip to next page" if you did not choose Other.' },
	{ ..._choice, template_id: 'BackTaxConfidence',
		description: 'How confident do you feel about your knowledge of tax rules?',
		client_items: CONFIDENCE_7 },
	{ ..._choice, template_id: 'BackWebsiteUseTax',
		description: 'How frequently do you use a website to answer tax questions?',
		client_items: FREQ_7 },
	{ ..._choice, template_id: 'BackWebsiteUseIRS',
		description: 'How frequently have you gone to the IRS website to answer a tax question?',
		client_items: FREQ_7 },
	{ ..._choice, template_id: 'BackAIUse',
		description: 'How frequently do you use artificial intelligence, <i>e.g.</i>, ChatGPT?',
		client_items: FREQ_7 },
	{ ..._choice, template_id: 'BackAIUseTax',
		description: 'How frequently do you use artificial intelligence to <u>answer a tax or legal question</u>?',
		client_items: FREQ_7 },
];


/////////////////////////////////////////////////////////////////////////////////////////
// Tax knowledge. `solution` is the answer key, used only to score (no feedback is shown).

const knowledge_intro = {
	..._text,
	template_id: 'tax_intro',
	description: 'The next section of the survey asks you some questions relating to your tax knowledge. If you don\'t know the answer, pick "Not sure."',
};

const knowledge = [
	{ ..._choice_scored, template_id: 'TaxBody',
		description: 'What body is responsible for collecting taxes for the federal government?',
		client_items: [
			'Interstate Revenue Support',
			'Federal Reserve',
			'Internal Revenue Service',
			'Individual state tax departments collect money and send it to the federal government',
			'Not sure',
		],
		solution: 'Internal Revenue Service' },
	{ ..._choice_scored, template_id: 'TaxReduce',
		description: 'Which term describes a reduction in the amount of taxable income?',
		client_items: ['Deduction', 'Credit', 'Withholding', 'Regulation', 'Not sure'],
		solution: 'Deduction' },
	{ ..._choice_scored, template_id: 'TaxMarginal',
		description: 'In June, you receive a raise at work. This moves you into the 22% marginal federal income tax bracket. This results in:',
		client_items: [
			'All of your income is now taxed at 22%',
			'The 22% only applies from June to December; January to May is taxed at your old rate',
			'The 22% rate only applies to some of your income',
			'The 22% rate is only applied if you file for a refund',
			'Not sure',
		],
		solution: 'The 22% rate only applies to some of your income' },
	{ ..._choice_scored, template_id: 'TaxLiability',
		description: 'Which of the following will generally reduce your taxes the most?',
		client_items: ['A $1,000 tax deduction', 'A $1,000 tax credit', 'A $1,000 refund', 'All of the above', 'Not sure'],
		solution: 'A $1,000 tax credit' },
	{ ..._choice_scored, template_id: 'TaxFiling',
		description: 'You file an extension. Which of the following is true?',
		client_items: [
			'You have 6 months to pay your taxes, but must file your paperwork now',
			'You have 6 months to pay your taxes, and have 6 months to file the paperwork',
			'You must pay your taxes now, and file your paperwork now',
			'You must pay your taxes now, and have 6 months to file the paperwork',
			'Not sure',
		],
		solution: 'You must pay your taxes now, and have 6 months to file the paperwork' },
	{ ..._choice_scored, template_id: 'TaxRetire',
		description: 'You contribute after-tax money to a Roth IRA investment account. Which of the following is generally true when taking money out?',
		client_items: [
			'All of it is tax-free for qualified distributions',
			'You must pay taxes on your contributions, but increases in the account are tax-free',
			'Your original contributions are tax-free, but increases are taxable',
			'All of the account is taxable',
			'Not sure',
		],
		solution: 'All of it is tax-free for qualified distributions' },
];


/////////////////////////////////////////////////////////////////////////////////////////
// Scenario instructions. Versions are in condition order: [FAQ, SHORT_AI, LONG_AI].

const instructions_text = (advisor: string, use_verb: string): string => `
<p>We are testing a tax advisor system. You will be presented with three scenarios. Each will:</p>
<ul>
	<li>Ask you to watch a video describing a fictional scenario</li>
	<li>Ask you for a preliminary answer</li>
</ul>
<p>You will then see a tax advisor ${advisor}. Please ${use_verb} the advisor to check your answer.</p>
<p>After ${use_verb === 'use' ? 'using' : 'talking with'} the advisor, you will input a revised answer.</p>
<p>After working through 3 scenarios, we will ask you a few closing questions.</p>
`;

const scenario_instructions = {
	..._text,
	template_id: 'scenario_instructions',
	versions_by_condition: true,
	versions: [
		{ description: instructions_text('website', 'use'), tags: ['condition_faq'] },
		{ description: instructions_text('chatbot', 'interact with'), tags: ['condition_short_ai'] },
		{ description: instructions_text('chatbot', 'interact with'), tags: ['condition_long_ai'] },
	],
};


/////////////////////////////////////////////////////////////////////////////////////////
// Scenarios.

type ScenarioType = {
	key: string, // s1, s2, s3
	title: string,
	video_url: string,
	script: string, // shown as the video transcript tab, and in place of a missing video
	question: string,
	faq_html: string,
	tabs: Array<{ title: string, body: string }>, // tab 4 (index 3) holds the determinative fact
};

const video_html = (s: ScenarioType, width: number, height: number): string => s.video_url !== ''
	? `<iframe width="${width}" height="${height}" src="${s.video_url}" title="Scenario video" frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
		allowfullscreen></iframe>`
	: `<div style="border: 1px dashed #999; padding: 10px; background: #f8f9fa;">
		<b>[VIDEO PLACEHOLDER]</b> Script: <i>${s.script}</i></div>`;

const make_scenario_block = (s: ScenarioType): any => {
	const k = s.key;
	const before = `<b>${s.title} scenario: your preliminary answer</b><br/>`;
	const after = `<b>${s.title} scenario: your revised answer</b><br/>`;

	const advisor_description = `<b>${s.title} scenario</b><br/>Please check your understanding through the tax advisor system. You can look up additional information using the tabs on the left. A transcript of the video is in the first tab.`;

	return {
		gen_type: 'LinearGen',
		pages: [
			// Before the advisor. The video and the preliminary-answer question share one page,
			// so the participant can re-watch while answering. (The number box auto-focuses, so
			// the video is kept small enough that the box is usually visible without scrolling.)
			{ ..._number, template_id: k + '_pre_estimate',
				instruction: 'Watch the video, then type a dollar amount and click "Next page."',
				description: `<b>${s.title} scenario</b><br/><br/>${video_html(s, 480, 270)}<br/><br/>` + before + s.question },
			{ ..._long_text, template_id: k + '_pre_reason',
				description: before + 'Write 1-2 sentences explaining why you gave this answer.' },
			{ ..._choice, template_id: k + '_pre_confidence', client_items: CONFIDENCE_7,
				description: before + 'How confident do you feel about this answer?' },
			{ ..._choice, template_id: k + '_pre_difficulty', client_items: DIFFICULTY_7,
				description: before + 'How difficult is this tax question?' },

			// Advisor, with the revised-answer question below it (question_id = sN_post_estimate),
			// so the participant can keep using the video, tabs and advisor while answering.
			// code 'test': "Next page" stays disabled until the page is answered.
			// Versions in condition order: [FAQ, SHORT_AI, LONG_AI].
			{
				type: 'IfPageChatSchema',
				code: 'test',
				template_id: k + '_advisor',
				description: advisor_description,
				question: after + s.question,
				question_id: k + '_post_estimate',
				max_turns: MAX_TURNS,
				tabs: s.tabs,
				versions_by_condition: true,
				versions: [
					{ static_html: s.faq_html, tags: ['condition_faq'],
						instruction: 'Use the advisor. Then type your revised answer below and click "Next page."' },
					{ solution_system_prompt: PROMPT_SHORT_AI, ...SHORT_AI_SETTINGS, tags: ['condition_short_ai'],
						instruction: 'Ask the advisor to check your answer. Then type your revised answer below and click "Next page."' },
					{ solution_system_prompt: PROMPT_LONG_AI, ...LONG_AI_SETTINGS, tags: ['condition_long_ai'],
						instruction: 'Ask the advisor to help you with your answer. Then type your revised answer below and click "Next page."' },
				],
			},

			// After the advisor.
			{ ..._long_text, template_id: k + '_post_reason',
				description: after + 'Write 1-2 sentences explaining why you gave this answer.' },
			{ ..._choice, template_id: k + '_post_confidence', client_items: CONFIDENCE_7,
				description: after + 'How confident do you feel about this answer?' },
			{ ..._choice, template_id: k + '_post_difficulty', client_items: DIFFICULTY_7,
				description: after + 'How difficult is this tax question?' },
			{ ..._choice, template_id: k + '_post_cogfit1', client_items: AGREE_7,
				description: `<b>${s.title} scenario</b><br/>This advisor system felt like a good match for this kind of tax question.` },
/*			{ ..._choice, template_id: k + '_post_cogfit2', client_items: AGREE_7,
				description: `<b>${s.title} scenario</b><br/>This advisor system approached the problem the way I naturally think.` },
			{ ..._choice, template_id: k + '_post_cogfit3', client_items: AGREE_7,
				description: `<b>${s.title} scenario</b><br/>This advisor system fit how I wanted to work through this question.` }, */
		],
	};
};


// Scenario 1: Scholarship. Correct answer: $14,000.
const s1: ScenarioType = {
	key: 's1',
	title: 'Scholarship',
	video_url: VIDEO_URLS.s1,
	script: `
I just got accepted to become a business student at WVU! I\'m so excited, as they gave me a scholarship. 
But, I don\'t understand how this scholarship will impact my taxes. The letter said that I had to use $12,000 
for tuition and $8,000 for room and board. The award does say that part of the tuition portion is tied to working 
as a teaching assistant.
How much is taxable income?
`,
	question: 'How much of this $20,000 scholarship is taxable income?',
	faq_html: `
<h5>Scholarships and Payments for Services</h5>
<p><b>When may a scholarship be excluded from income?</b> A degree candidate generally may exclude scholarship amounts used for qualified tuition and required educational expenses. The exclusion does not apply to amounts used for room and board. See ${link('https://www.irs.gov/taxtopics/tc421', 'IRS Topic No. 421, Scholarships, Fellowship Grants, and Other Grants')}.</p>
<p><b>How is an award treated if the student must perform services?</b> The portion of an award that represents payment for teaching, research, or other services generally must be included in income, even if the payment is described as a scholarship. See ${link('https://www.irs.gov/publications/p970', 'IRS Publication 970, Tax Benefits for Education')}.</p>
<p><b>How should an award with several designated uses be evaluated?</b> Determine the amount attributable to qualified tuition expenses, the amount attributable to room and board, and the amount attributable to required services. Apply the relevant rule to each portion separately. The amount included in income is not the same as the student's final tax liability.</p>
`,
	tabs: [
		{ title: 'Video transcript', body: '' }, // filled in below
		{ title: 'Degree-seeking status', body: 'She is a degree-seeking student hoping to graduate in 4 years.' },
		{ title: 'Other job', body: 'She is not planning on working any other jobs while enrolled.' },
		{ title: 'Teaching assistant', body: 'Half of tuition comes from a grant ($6,000), and the other half ($6,000) is salary (wages) for her work as a teaching assistant.' },
		{ title: 'Room and board', body: 'She gets $8,000 for living expenses. This does not come from her teaching assistant role.' },
	],
};

// Scenario 2: Small business. Correct answer: $8,000 net business income.
const s2: ScenarioType = {
	key: 's2',
	title: 'Small business',
	video_url: VIDEO_URLS.s2,
	script: `
I started a small business this year picking up trash for my neighbors. So far, I\'ve collected $10,000. 
However, my dad just told me that I need to file taxes on the business. 
I also rented a truck for $4,000 (it was so nice having a car to see my friends). 
But I only have $1,000 cash left after paying off my bills and my parents. 
How much is taxable business income?
`,
	question: 'How much of this $10,000 is taxable business income?',
	faq_html: `
<h5>Business Receipts and Expenses</h5>
<p><b>How is net business income determined?</b> Net business income generally equals gross receipts from customers less allowable business expenses. The amount of cash remaining after bills and other payments does not, by itself, establish net business income. See ${link('https://www.irs.gov/publications/p334', 'IRS Publication 334, Tax Guide for Small Business')}.</p>
<p><b>Is a loan received from a family member a business receipt?</b> A genuine loan that the borrower is obligated to repay is not a payment from a customer for goods or services. Repayment of the loan principal is not an allowable business expense.</p>
<p><b>May the cost of renting a vehicle be deducted?</b> The business portion of a vehicle rental may generally be deducted. When the vehicle is used for both business and personal trips, the rental expense must be divided between those uses. The personal portion is not a business expense. See the ${link('https://www.irs.gov/instructions/i1040sc', 'Instructions for Schedule C')} and ${link('https://www.irs.gov/taxtopics/tc510', 'IRS Topic No. 510, Business Use of Car')}.</p>
<p><b>Are the owner's personal expenditures business expenses?</b> No. Personal expenditures, such as ordinary clothing, food, and personal telephone charges, do not become business expenses merely because they are paid with money earned from the business. See ${link('https://www.irs.gov/faqs/small-business-self-employed-other-business/income-expenses', 'IRS Income and Expenses FAQs')}.</p>
`,
	tabs: [
		{ title: 'Video transcript', body: '' },
		{ title: 'Loan', body: 'His loan had no interest payments.' },
		{ title: 'Other job', body: 'He had no other jobs this year.' },
		{ title: 'Personal use', body: 'Half of the miles he put on the truck are for driving to school and seeing friends.' },
		{ title: 'Personal bills', body: 'He spent roughly $500 a month on clothing, food, and a cell phone.' },
	],
};

// Scenario 3: Roommate payments. Correct answer: $600.
const s3: ScenarioType = {
	key: 's3',
	title: 'Roommate payments',
	video_url: VIDEO_URLS.s3,
	script: `
My roommate and I split a lot of stuff this year.
They sent $2,500 on Venmo for rent, and a $600 gift card to the campus bookstore.
My friend said the IRS is cracking down on Venmo now, and I\'m worried I must report all of it.
 It\'s not like I have a real job. We just help each other out. 
 How much is taxable income?
`,
	question: 'How much of this $3,100 is taxable income?',
	faq_html: `
<h5>Reimbursements and Payments for Services</h5>
<p><b>Is a payment taxable because it was made through a payment app?</b> The method of payment does not, by itself, determine whether the amount is income. The purpose of the payment must be considered. See ${link('https://www.irs.gov/businesses/understanding-your-form-1099-k', 'IRS, Understanding Your Form 1099-K')}.</p>
<p><b>Is a roommate's reimbursement for shared costs income?</b> A payment reimbursing a roommate's share of rent, utilities, groceries, or another shared expense generally is not income to the person who initially paid the expense. See ${link('https://www.irs.gov/newsroom/form-1099-k-faqs-what-to-do-if-you-receive-a-form-1099-k', 'IRS Form 1099-K FAQs')}.</p>
<p><b>How is a payment for tutoring treated?</b> An amount received in exchange for tutoring is payment for services. Receiving that payment as a gift card rather than cash does not make it a reimbursement of shared expenses. See ${link('https://www.irs.gov/publications/p525', 'IRS Publication 525, Taxable and Nontaxable Income')}.</p>
<p><b>How should multiple payments be evaluated?</b> Determine the purpose of each payment separately. Amounts repaying shared expenses and amounts paid for services have different tax treatment.</p>
`,
	tabs: [
		{ title: 'Video transcript', body: '' },
		{ title: 'School', body: 'She is a full-time college student with no other job this year.' },
		{ title: 'Venmo', body: 'The $2,500 Venmo payment came from her roommate paying their share of the rent.' },
		{ title: 'Gift card', body: 'My roommate gave me the $600 bookstore gift card in exchange for me tutoring them in algebra.' },
		{ title: 'Other payments', body: 'The roommate made no other payments to her this year.' },
	],
};

// Tab 6 is the video transcript.
[s1, s2, s3].forEach( s => { s.tabs[0].body = s.script; });


/////////////////////////////////////////////////////////////////////////////////////////
// End questions, debrief, finish.

const end_questions = [
	{ ..._choice, template_id: 'end_easeuse', client_items: AGREE_7,
		description: 'The tax advisor system was easy to use.' },
	{ ..._choice, template_id: 'end_understandtaxlaw', client_items: AGREE_7,
		description: 'The tax advisor system\'s communication style helped me understand tax laws.' },
	{ ..._choice, template_id: 'end_regulations', client_items: AGREE_7,
		description: 'The tax advisor system was based on the relevant IRS regulations.' },
	{ ..._choice_scored, template_id: 'end_attcheck',
		description: 'Which of the problems below were not covered in the earlier scenarios?',
		client_items: ['Scholarship', 'Venmo', 'Small business income', 'Charitable giving'],
		solution: 'Charitable giving' },
	{ ..._choice, template_id: 'end_weightonadvice', client_items: AGREE_7,
		description: 'This advisor system changed how I thought about each scenario.' },
];

const completed_scenarios_page = {
	..._text,
	template_id: 'scenario_exit',
	description: 'You\'ve completed all the scenarios. The next section of the survey asks you some closing questions.',
};



const debrief = {
	..._text,
	template_id: 'debrief',
	description: `
<h4>Debriefing</h4>
<p>Thank you for participating in this research study. We hope you found the experience informative and helpful. The correct answers to the scenarios are provided below.</p>
<p><b>Scenario 1: Scholarship</b><br/>
<b>Correct answer: $14,000.</b><br/>
Of the $20,000 award, $6,000 is a scholarship used for tuition and is generally excluded from taxable income. The $6,000 paid for teaching assistant work is taxable because it is payment for services. The remaining $8,000 is designated for room and board, which is not a qualified tuition expense and is also taxable. Thus, $6,000 + $8,000 = $14,000 of taxable income. This amount is taxable income, not the amount of tax the student owes.</p>
<p><b>Scenario 2: Small business</b><br/>
<b>Correct answer: $8,000 of net business income.</b><br/>
The $10,000 received from customers is business revenue. Half of the $4,000 truck rental relates to business driving, making $2,000 deductible as a business expense. The other half relates to personal driving and is not deductible.  Assuming he had no other business expenses, net business income is $10,000 &minus; $2,000 = $8,000.</p>
<p><b>Scenario 3: Roommate payments</b><br/>
<b>Correct answer: $600.</b><br/>
The $2,500 sent through Venmo repaid the roommate's share of rent and utilities.  Those reimbursements are not income, regardless of how the roommate paid them. The $600 bookstore gift card was payment for tutoring, so its value is income.  $600 is taxable income.</p>
`,
};


// No completion code: WVU students get credit through their faculty. For a Prolific run,
// add the Prolific completion code here (and use a Prolific-specific consent).
const finish = {
	..._text,
	template_id: 'finish',
	instruction: 'Click "Next page" to finish.',
	description: 'Thank you for participating! You have completed the study. You can now close this window.',
};


/////////////////////////////////////////////////////////////////////////////////////////

const taxstudy: LevelSchemaFactoryType = {
	code: 'taxstudy',
	title: 'Tax Decision Support',
	description: 'Research study: answer three fictional tax questions with the help of a tax advisor.',
	show_score_after_completing: false,
	version: 1.0,
	show_progress: false,

	gen: {
		gen_type: 'LinearGen',
		pages: [
			consent,
			...background,
			knowledge_intro,
			...knowledge,
			scenario_instructions,
			{
				gen_type: 'ShuffleGen',
				pages: [ make_scenario_block(s1), make_scenario_block(s2), make_scenario_block(s3) ],
			},
			completed_scenarios_page,
			...end_questions,
			debrief,
			finish,
		],
	}
};

export { taxstudy };
