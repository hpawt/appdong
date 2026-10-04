import { readEvent, readDefinition } from './modu-validation.js';
export { inputMessage } from './modu-validation.js';

export const MAX_WORKSPACE_BYTES = 2_000_000;
/** @typedef {{events: import('./modu').CalendarEvent[], definition: import('./modu').FormDefinition | null}} Workspace */

/** Validate every imported item before replacing the workspace. @param {string} raw @returns {Workspace} */
export function readWorkspace(raw) {
	if (new TextEncoder().encode(raw).length > MAX_WORKSPACE_BYTES)
		throw new Error('백업 파일은 2MB 이하로 선택해주세요.');
	const value = JSON.parse(raw);
	if (!value || value.version !== 1 || !Array.isArray(value.events) || value.events.length > 100)
		throw new Error('지원하지 않는 백업 파일입니다.');
	const ids = new Set();
	const events = value.events.map((/** @type {unknown} */ item) => {
		if (!item || typeof item !== 'object') throw new Error('일정 형식을 확인해주세요.');
		const event = /** @type {Record<string, unknown>} */ (item);
		if (
			typeof event.id !== 'string' ||
			!/^[a-zA-Z0-9_-]{1,64}$/.test(event.id) ||
			ids.has(event.id) ||
			typeof event.pinned !== 'boolean'
		)
			throw new Error('일정 ID와 고정 상태를 확인해주세요.');
		ids.add(event.id);
		const form = new FormData();
		for (const key of [
			'title',
			'description',
			'location',
			'startDate',
			'endDate',
			'time',
			'category'
		]) {
			if (typeof event[key] !== 'string') throw new Error('일정 형식을 확인해주세요.');
			form.set(key, event[key]);
		}
		if (event.pinned) form.set('pinned', 'on');
		return { id: event.id, ...readEvent(form) };
	});
	let definition = null;
	if (value.definition !== null) {
		const form = new FormData();
		form.set('definition', JSON.stringify(value.definition));
		definition = readDefinition(form);
	}
	return { events, definition };
}

/** @param {Workspace} workspace */
export function workspaceFile(workspace) {
	return JSON.stringify({ version: 1, ...workspace }, null, 2);
}
