import assert from 'node:assert/strict';
import test from 'node:test';
import { isHttpError } from '@sveltejs/kit';
import { loadServerModule } from './helpers/server-module.js';

const question = { id: 'name', title: '이름', type: 'text', required: true, options: [] };
const definition = {
	title: '신청',
	description: '',
	published: true,
	accepting: true,
	questions: [question]
};

test('form definitions reject forged types, repeated/prototype IDs and invalid options', async () => {
	const { validateDefinition } = await loadServerModule('src/lib/server/modu-validation.js');
	for (const questions of [
		[],
		[question, question],
		[{ ...question, id: '__proto__' }],
		[{ ...question, id: 'version' }],
		[{ ...question, type: 'file' }],
		[{ ...question, type: 'radio', options: ['하나'] }],
		[{ ...question, type: 'select', options: ['하나', ' 하나 '] }]
	]) {
		assert.throws(
			() => validateDefinition({ ...definition, questions }),
			(cause) => isHttpError(cause, 400)
		);
	}
	assert.equal(validateDefinition(definition).questions[0].title, '이름');
	assert.throws(
		() => validateDefinition({ ...definition, published: 'false' }),
		(cause) => isHttpError(cause, 400)
	);
});

test('answers validate all six types, required checkbox, email, forged fields and byte limit', async () => {
	const { validateAnswers } = await loadServerModule('src/lib/server/modu-validation.js');
	const questions = [
		question,
		{ ...question, id: 'email', type: 'email' },
		{ ...question, id: 'choice', type: 'checkbox', options: ['오전', '오후'] },
		{ ...question, id: 'radio', type: 'radio', options: ['온라인', '현장'] },
		{ ...question, id: 'select', type: 'select', options: ['예', '아니오'] },
		{ ...question, id: 'note', type: 'textarea', required: false }
	];
	const answers = {
		name: '김테스트',
		email: 'test@example.com',
		choice: ['오전'],
		radio: '현장',
		select: '예',
		note: '<script>text</script>'
	};
	assert.equal(validateAnswers(answers, questions).note, answers.note);
	for (const patch of [
		{ name: '' },
		{ email: 'bad' },
		{ choice: [] },
		{ choice: ['오전', '오전'] },
		{ choice: ['없음'] },
		{ radio: '없음' },
		{ note: new File(['x'], 'fake') },
		{ extra: 'forged' }
	])
		assert.throws(
			() => validateAnswers({ ...answers, ...patch }, questions),
			(cause) => isHttpError(cause, 400)
		);
	const bigQuestions = Array.from({ length: 10 }, (_, index) => ({ ...question, id: 'q' + index }));
	const bigAnswers = Object.fromEntries(bigQuestions.map((q) => [q.id, '가'.repeat(2000)]));
	assert.throws(
		() => validateAnswers(bigAnswers, bigQuestions),
		(cause) => isHttpError(cause, 413)
	);
});

test('calendar dates include leap days and cross-month spans without timezone drift', async () => {
	const { validDate, calendarDays, shiftMonth, occursOn, todayKey } =
		await loadServerModule('src/lib/modu.js');
	assert.equal(validDate('2024-02-29'), true);
	for (const date of ['2026-02-29', '2026-04-31', '2101-01-01', '2026-13-01'])
		assert.equal(validDate(date), false);
	assert.equal(calendarDays('2026-10').length, 42);
	assert.equal(calendarDays('2026-10')[0], '2026-09-27');
	assert.equal(shiftMonth('2026-12', 1), '2027-01');
	assert.equal(shiftMonth('1900-01', -1), '1900-01');
	assert.equal(todayKey(new Date('2026-10-02T16:00:00Z')), '2026-10-03');
	assert.equal(occursOn({ startDate: '2026-09-30', endDate: '2026-10-02' }, '2026-10-01'), true);
});

test('event validation rejects impossible dates, reversed spans, invalid times and forged categories', async () => {
	const { readEvent } = await loadServerModule('src/lib/server/modu-validation.js');
	const base = {
		title: '행사',
		description: '',
		location: '',
		startDate: '2026-10-01',
		endDate: '2026-10-02',
		time: '',
		category: 'event'
	};
	/** @param {Record<string, string>} values */
	function fields(values) {
		const form = new FormData();
		for (const [key, value] of Object.entries(values)) form.set(key, value);
		return form;
	}
	assert.equal(readEvent(fields(base)).time, '');
	for (const patch of [
		{ startDate: '2026-02-30' },
		{ endDate: '2026-09-30' },
		{ time: '24:00' },
		{ category: 'forged' }
	])
		assert.throws(
			() => readEvent(fields({ ...base, ...patch })),
			(cause) => isHttpError(cause, 400)
		);
});

test('bounded form reader rejects oversized bodies before decoding', async () => {
	const { boundedFormData, MAX_DEFINITION_BYTES } = await loadServerModule(
		'src/lib/server/modu-validation.js'
	);
	const request = new Request('http://localhost/test', {
		method: 'POST',
		body: new URLSearchParams({ title: '테스트' })
	});
	assert.equal((await boundedFormData(request)).get('title'), '테스트');
	await assert.rejects(
		boundedFormData(
			new Request('http://localhost/test', {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: 'x'.repeat(MAX_DEFINITION_BYTES * 8 + 1)
			})
		),
		(cause) => isHttpError(cause, 413)
	);
});
