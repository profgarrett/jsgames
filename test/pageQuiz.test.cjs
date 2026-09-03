// Tests for extractQuizQuestions / buildQuiz in src/app/pages/PageQuiz.tsx
//
// Quiz questions live under a "## Practice Questions" heading as an ordered
// list, each question followed by indented answer bullets. The first answer
// listed is the correct one.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { extractQuizQuestions, buildQuiz, shuffle, removeQuizSection, logQuizAnswer } = require('../src/app/pages/PageQuiz.tsx');
const { loadUserFromServer } = require('../src/app/components/Authentication.tsx');

const SAMPLE = [
	'# A Page',
	'',
	'Some intro prose.',
	'',
	'## Terms',
	'',
	'- **Alpha**: first letter',
	'',
	'## Practice Questions',
	'',
	'1. Who first introduced Exploratory Data Analysis?',
	'   - John Tukey',
	'   - Frank Anscombe',
	'   - Edward Tufte',
	'',
	'1. What is the primary goal of EDA?',
	'   - To learn about a dataset',
	'   - To confirm a hypothesis',
	'',
].join('\n');

describe('extractQuizQuestions', () => {
	test('extracts questions from the Practice Questions section', () => {
		const questions = extractQuizQuestions(SAMPLE);
		assert.strictEqual(questions.length, 2);
		assert.strictEqual(questions[0].prompt, 'Who first introduced Exploratory Data Analysis?');
		assert.deepStrictEqual(questions[0].answers, ['John Tukey', 'Frank Anscombe', 'Edward Tufte']);
	});

	test('treats the first listed answer as correct', () => {
		const questions = extractQuizQuestions(SAMPLE);
		const built = buildQuiz(questions);
		for (const question of built) {
			const correct = question.options.filter((o) => o.isCorrect);
			assert.strictEqual(correct.length, 1);
		}
		const first = built.find((q) => q.prompt.startsWith('Who first'));
		assert.strictEqual(first.options.find((o) => o.isCorrect).text, 'John Tukey');
	});

	test('ignores bullets outside the Practice Questions section', () => {
		const questions = extractQuizQuestions(SAMPLE);
		const prompts = questions.map((q) => q.prompt);
		assert.ok(!prompts.some((p) => p.includes('Alpha')));
	});

	test('stops at the next level-2 heading', () => {
		const md = [
			'## Practice Questions',
			'1. Question one?',
			'   - Right',
			'   - Wrong',
			'',
			'## Homework',
			'1. Not a quiz question?',
			'   - Nope',
			'   - Also nope',
		].join('\n');
		const questions = extractQuizQuestions(md);
		assert.strictEqual(questions.length, 1);
		assert.strictEqual(questions[0].prompt, 'Question one?');
	});

	test('strips inline code and emphasis from prompts and answers', () => {
		const md = [
			'## Practice Questions',
			'1. A `gender` field contains **1** and `2`. This is:',
			'   - A *coded* value',
			'   - A missing value',
		].join('\n');
		const questions = extractQuizQuestions(md);
		assert.strictEqual(questions[0].prompt, 'A gender field contains 1 and 2. This is:');
		assert.deepStrictEqual(questions[0].answers, ['A coded value', 'A missing value']);
	});

	test('accepts *, + answer markers and 1) question markers', () => {
		const md = [
			'## Practice Questions',
			'1) Question?',
			'   * Right',
			'   + Wrong',
		].join('\n');
		const questions = extractQuizQuestions(md);
		assert.deepStrictEqual(questions[0].answers, ['Right', 'Wrong']);
	});

	test('skips questions with fewer than two answers', () => {
		const md = [
			'## Practice Questions',
			'1. Lonely question?',
			'   - Only answer',
			'1. Good question?',
			'   - Right',
			'   - Wrong',
		].join('\n');
		const questions = extractQuizQuestions(md);
		assert.strictEqual(questions.length, 1);
		assert.strictEqual(questions[0].prompt, 'Good question?');
	});

	test('returns empty array when there is no Practice Questions section', () => {
		assert.deepStrictEqual(extractQuizQuestions(''), []);
		assert.deepStrictEqual(extractQuizQuestions('# Title\n\nSome text.'), []);
	});

	test('stamps every question with the given page slug, for multi-page quizzes', () => {
		const questions = extractQuizQuestions(SAMPLE, 'course_dv/dv01-eda/index');
		assert.strictEqual(questions.length, 2);
		assert.ok(questions.every((q) => q.page === 'course_dv/dv01-eda/index'));
	});

	test('leaves page undefined when none is given', () => {
		const questions = extractQuizQuestions(SAMPLE);
		assert.ok(questions.every((q) => q.page === undefined));
	});
});

describe('removeQuizSection', () => {
	test('removes the heading and all of its questions', () => {
		const output = removeQuizSection(SAMPLE);
		assert.ok(!output.includes('Practice Questions'));
		assert.ok(!output.includes('John Tukey'));
		assert.ok(!output.includes('primary goal of EDA'));
	});

	test('keeps the content that comes before the section', () => {
		const output = removeQuizSection(SAMPLE);
		assert.ok(output.includes('# A Page'));
		assert.ok(output.includes('Some intro prose.'));
		assert.ok(output.includes('## Terms'));
		assert.ok(output.includes('- **Alpha**: first letter'));
	});

	test('keeps content after the next level-2 heading', () => {
		const md = [
			'## Practice Questions',
			'1. Question one?',
			'   - Right',
			'   - Wrong',
			'',
			'## Homework',
			'Read chapter 2.',
		].join('\n');
		const output = removeQuizSection(md);
		assert.ok(!output.includes('Question one?'));
		assert.ok(output.includes('## Homework'));
		assert.ok(output.includes('Read chapter 2.'));
	});

	test('leaves markdown without the section untouched in substance', () => {
		const md = '# Title\n\nSome text.\n';
		assert.strictEqual(removeQuizSection(md).trim(), md.trim());
	});

	test('does not remove a deeper heading with the same name', () => {
		const md = '## Review\n\n### Practice Questions\n\nSome prose.\n';
		const output = removeQuizSection(md);
		assert.ok(output.includes('### Practice Questions'));
	});
});

describe('shuffle / buildQuiz', () => {
	test('shuffle preserves membership and does not mutate the input', () => {
		const input = [1, 2, 3, 4, 5, 6, 7, 8];
		const output = shuffle(input);
		assert.deepStrictEqual(input, [1, 2, 3, 4, 5, 6, 7, 8]);
		assert.deepStrictEqual(output.slice().sort((a, b) => a - b), input);
	});

	test('buildQuiz keeps every question and every answer', () => {
		const questions = extractQuizQuestions(SAMPLE);
		const built = buildQuiz(questions);
		assert.strictEqual(built.length, questions.length);

		const byPrompt = new Map(questions.map((q) => [q.prompt, q.answers.slice().sort()]));
		for (const question of built) {
			assert.deepStrictEqual(
				question.options.map((o) => o.text).sort(),
				byPrompt.get(question.prompt),
			);
		}
	});

	test('randomizes order across many runs', () => {
		const questions = extractQuizQuestions(SAMPLE);
		const orders = new Set();
		for (let i = 0; i < 50; i++) {
			orders.add(buildQuiz(questions).map((q) => q.prompt).join('|'));
		}
		// With 2 questions, 50 runs should produce both orderings.
		assert.ok(orders.size > 1, 'expected question order to vary');
	});

	test('carries each question\'s source page through into the shuffled deck', () => {
		const questions = extractQuizQuestions(SAMPLE, 'course_dv/dv01-eda/index');
		const built = buildQuiz(questions);
		assert.ok(built.every((q) => q.page === 'course_dv/dv01-eda/index'));
	});

	test('pools questions tagged with different pages, keeping each one\'s own page', () => {
		const pageA = extractQuizQuestions(SAMPLE, 'course_dv/a/index');
		const pageB = extractQuizQuestions(SAMPLE, 'course_dv/b/index');
		const built = buildQuiz([...pageA, ...pageB]);

		assert.strictEqual(built.length, pageA.length + pageB.length);
		assert.strictEqual(built.filter((q) => q.page === 'course_dv/a/index').length, pageA.length);
		assert.strictEqual(built.filter((q) => q.page === 'course_dv/b/index').length, pageB.length);
	});
});

describe('logQuizAnswer', () => {
	const ENTRY = {
		page: 'course_dv/dv01-eda/index',
		question: 'Who first introduced Exploratory Data Analysis?',
		answer: 'John Tukey',
		correct: true,
	};

	// The Authentication module caches the user, so drive it through its own
	// loader with a stubbed fetch to simulate logged-in / logged-out state.
	const setUser = async (username) => {
		global.fetch = async () => ({ json: async () => ({ username, isAdmin: false }) });
		await loadUserFromServer();
	};

	test('posts the answer to /api/quizviews when logged in', async () => {
		await setUser('student1');

		const calls = [];
		global.fetch = (url, options) => {
			calls.push({ url, options });
			return Promise.resolve({ ok: true });
		};

		logQuizAnswer(ENTRY);

		assert.strictEqual(calls.length, 1);
		assert.strictEqual(calls[0].url, '/api/quizviews');
		assert.strictEqual(calls[0].options.method, 'POST');
		assert.strictEqual(calls[0].options.credentials, 'include');
		assert.deepStrictEqual(JSON.parse(calls[0].options.body), ENTRY);
	});

	test('sends a row per submission, so a retake logs again', async () => {
		await setUser('student1');

		const calls = [];
		global.fetch = (url, options) => {
			calls.push(JSON.parse(options.body));
			return Promise.resolve({ ok: true });
		};

		logQuizAnswer(ENTRY);
		logQuizAnswer(ENTRY);

		assert.strictEqual(calls.length, 2);
		assert.deepStrictEqual(calls[0], calls[1]);
	});

	test('does not call the API when logged out', async () => {
		await setUser('');

		let called = false;
		global.fetch = () => { called = true; return Promise.resolve({ ok: true }); };

		logQuizAnswer(ENTRY);
		assert.strictEqual(called, false);
	});

	test('returns immediately and swallows network failures', async () => {
		await setUser('student1');

		global.fetch = () => Promise.reject(new Error('network down'));
		assert.strictEqual(logQuizAnswer(ENTRY), undefined);

		global.fetch = () => { throw new Error('fetch exploded'); };
		assert.doesNotThrow(() => logQuizAnswer(ENTRY));

		// A never-resolving request must not block the caller.
		global.fetch = () => new Promise(() => {});
		assert.strictEqual(logQuizAnswer(ENTRY), undefined);

		// Give any rejection handlers a tick to run; an unhandled one fails the test run.
		await new Promise((resolve) => setImmediate(resolve));
	});
});
