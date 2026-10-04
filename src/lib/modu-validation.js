import { error } from '@sveltejs/kit';
import { eventCategories, questionTypes, validDate } from '$lib/modu';

export const MAX_DEFINITION_BYTES = 32000;

/** @param {unknown} cause */
export function inputMessage(cause) {
	if (cause && typeof cause === 'object' && 'body' in cause) {
		const body = /** @type {{message?: string}} */ (cause.body);
		if (body?.message) return body.message;
	}
	return cause instanceof Error ? cause.message : '입력 내용을 확인해주세요.';
}

/** @param {unknown} value @returns {Record<string, unknown>} */
function record(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		error(400, '입력 형식을 확인해주세요.');
	return /** @type {Record<string, unknown>} */ (value);
}

/** @param {unknown} value @param {number} max @param {boolean} [required] */
function text(value, max, required = false) {
	if (typeof value !== 'string' || value.length > max || (required && !value.trim()))
		error(400, '필수 항목과 입력 길이를 확인해주세요.');
	return value.trim();
}

/** @param {unknown} input @returns {import('$lib/modu').FormDefinition} */
export function validateDefinition(input) {
	const value = record(input);
	const title = text(value.title, 150, true);
	const description = text(value.description, 5000);
	if (typeof value.published !== 'boolean' || typeof value.accepting !== 'boolean')
		error(400, '공개·접수 상태를 확인해주세요.');
	if (!Array.isArray(value.questions) || value.questions.length < 1 || value.questions.length > 50)
		error(400, '질문은 1~50개로 구성해주세요.');
	const ids = new Set();
	const questions = value.questions.map((input) => {
		const q = record(input);
		const id = text(q.id, 64, true);
		const title = text(q.title, 200, true);
		if (
			!/^[a-zA-Z0-9_-]+$/.test(id) ||
			['__proto__', 'constructor', 'prototype', 'version'].includes(id) ||
			ids.has(id)
		)
			error(400, '질문 ID는 중복 없이 구성해주세요.');
		ids.add(id);
		if (
			typeof q.type !== 'string' ||
			!Object.hasOwn(questionTypes, q.type) ||
			typeof q.required !== 'boolean'
		)
			error(400, '질문 유형을 확인해주세요.');
		/** @type {string[]} */ let options = [];
		if (['radio', 'checkbox', 'select'].includes(q.type)) {
			if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 30)
				error(400, '선택지는 2~30개로 구성해주세요.');
			options = q.options.map((option) => text(option, 200, true));
			if (new Set(options).size !== options.length) error(400, '선택지는 중복될 수 없습니다.');
		}
		return {
			id,
			title,
			type: /** @type {import('$lib/modu').Question['type']} */ (q.type),
			required: q.required,
			options
		};
	});
	return { title, description, questions, published: value.published, accepting: value.accepting };
}

/** @param {unknown} input @param {import('$lib/modu').Question[]} questions @returns {Record<string, string|string[]>} */
export function validateAnswers(input, questions) {
	const supplied = record(input);
	const ids = new Set(questions.map((q) => q.id));
	if (Object.keys(supplied).some((id) => !ids.has(id)))
		error(400, '알 수 없는 질문이 있습니다. 폼을 새로고침해주세요.');
	/** @type {Map<string, string|string[]>} */
	const entries = new Map();
	for (const question of questions) {
		const raw = Object.hasOwn(supplied, question.id) ? supplied[question.id] : undefined;
		if (question.type === 'checkbox') {
			const values = raw === undefined ? [] : raw;
			if (
				!Array.isArray(values) ||
				values.length > question.options.length ||
				values.some((option) => typeof option !== 'string' || !question.options.includes(option)) ||
				new Set(values).size !== values.length
			)
				error(400, `‘${question.title}’의 선택지를 확인해주세요.`);
			if (question.required && !values.length) error(400, `‘${question.title}’에 응답해주세요.`);
			entries.set(question.id, values);
		} else {
			const value = text(raw === undefined ? '' : raw, 5000);
			if (question.required && !value) error(400, `‘${question.title}’에 응답해주세요.`);
			if (value && ['radio', 'select'].includes(question.type) && !question.options.includes(value))
				error(400, `‘${question.title}’의 선택지를 확인해주세요.`);
			if (value && question.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
				error(400, '이메일 주소를 확인해주세요.');
			entries.set(question.id, value);
		}
	}
	const answers = Object.fromEntries(entries);
	if (new TextEncoder().encode(JSON.stringify(answers)).length > MAX_DEFINITION_BYTES)
		error(413, '응답 내용은 32KB 이하로 작성해주세요.');
	return answers;
}

/** @param {FormData} form */
export function readDefinition(form) {
	const raw = form.get('definition');
	if (typeof raw !== 'string') error(400, '폼 정보를 확인해주세요.');
	if (new TextEncoder().encode(raw).length > MAX_DEFINITION_BYTES)
		error(413, '폼 내용은 32KB 이하로 구성해주세요.');
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		error(400, '폼 정보를 확인해주세요.');
	}
	return validateDefinition(parsed);
}

/** @param {FormData} form */
export function readEvent(form) {
	const value = (/** @type {string} */ key, /** @type {number} */ max, required = false) =>
		text(form.get(key) ?? '', max, required);
	const startDate = value('startDate', 10, true);
	const endDate = value('endDate', 10, true);
	const time = value('time', 5);
	const category = value('category', 20, true);
	if (!validDate(startDate) || !validDate(endDate) || endDate < startDate)
		error(400, '시작일과 종료일을 확인해주세요.');
	if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) error(400, '시간을 확인해주세요.');
	if (!Object.hasOwn(eventCategories, category)) error(400, '일정 종류를 확인해주세요.');
	return {
		title: value('title', 100, true),
		description: value('description', 5000),
		location: value('location', 150),
		startDate,
		endDate,
		time,
		category,
		pinned: form.get('pinned') === 'on'
	};
}
