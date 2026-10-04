import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { customForm, formResponse } from '$lib/server/db/schema';
import { validateAnswers } from '$lib/server/modu-validation';

/** @param {typeof customForm.$inferSelect} row */
export function formView(row) {
	return { ...row, questions: /** @type {import('$lib/modu').Question[]} */ (row.questions) };
}

/** @param {typeof formResponse.$inferSelect} row */
export function responseView(row) {
	return {
		...row,
		questions: /** @type {import('$lib/modu').Question[]} */ (row.questions),
		answers: /** @type {Record<string, string|string[]>} */ (row.answers)
	};
}

/** @param {import('drizzle-orm/postgres-js').PostgresJsDatabase<typeof import('$lib/server/db/schema')>} database
 * @param {string} id @param {string} version @param {FormData} fields */
export async function submitResponse(database, id, version, fields) {
	return database.transaction(async (tx) => {
		const [row] = await tx.select().from(customForm).where(eq(customForm.id, id)).for('update');
		if (!row || !row.published) error(404, '폼을 찾을 수 없습니다.');
		if (!row.accepting) error(403, '지금은 응답을 받지 않는 폼입니다.');
		if (row.version !== version) error(409, '폼이 변경되었습니다. 새로고침 후 다시 제출해주세요.');
		const questions = formView(row).questions;
		const allowed = new Set(['version', ...questions.map((q) => q.id)]);
		for (const key of fields.keys())
			if (!allowed.has(key)) error(400, '알 수 없는 질문이 있습니다.');
		/** @type {Record<string, unknown>} */ const input = Object.create(null);
		for (const question of questions)
			input[question.id] =
				question.type === 'checkbox' ? fields.getAll(question.id) : (fields.get(question.id) ?? '');
		const answers = validateAnswers(input, questions);
		const responseId = crypto.randomUUID();
		await tx
			.insert(formResponse)
			.values({ id: responseId, formId: id, questions, answers, version });
		return { success: true, message: '응답이 제출되었습니다. 감사합니다.' };
	});
}

/** @param {unknown} value */
export function csvCell(value) {
	let text = String(value ?? '').replaceAll('\u0000', '');
	if (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
	return '"' + text.replaceAll('"', '""') + '"';
}

/** @param {ReturnType<typeof responseView>[]} responses */
export function responsesCsv(responses) {
	/** @type {Map<string, import('$lib/modu').Question>} */ const columns = new Map();
	for (const response of responses)
		for (const q of response.questions) columns.set(q.id + '\0' + q.title, q);
	const headers = ['응답 ID', '제출 시각', ...[...columns.values()].map((q) => q.title)];
	const rows = responses.map((response) => [
		response.id,
		new Date(response.submittedAt).toISOString(),
		...[...columns.entries()].map(([key, q]) => {
			if (!response.questions.some((old) => old.id + '\0' + old.title === key)) return '';
			const value = response.answers[q.id];
			return Array.isArray(value) ? value.join('; ') : value;
		})
	]);
	return (
		'\uFEFF' + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
	);
}
