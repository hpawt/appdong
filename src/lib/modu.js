/** @typedef {{ id: string, title: string, type: 'text'|'textarea'|'email'|'radio'|'checkbox'|'select', required: boolean, options: string[] }} Question */
/** @typedef {{ title: string, description: string, questions: Question[], published: boolean, accepting: boolean }} FormDefinition */
/** @typedef {{ id: string, title: string, description: string, location: string, startDate: string, endDate: string, time: string, category: string, pinned: boolean }} CalendarEvent */

export const questionTypes = {
	text: '단답형',
	textarea: '장문형',
	email: '이메일',
	radio: '객관식',
	checkbox: '체크박스',
	select: '드롭다운'
};
export const eventCategories = { notice: '공지', meeting: '미팅', event: '행사', deadline: '마감' };

/** @param {Date} [date] */
export function todayKey(date = new Date()) {
	return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}

/** @param {string} value */
export function validDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2100-12-31')
		return false;
	const date = new Date(value + 'T00:00:00Z');
	return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** @param {string} month @param {number} offset */
export function shiftMonth(month, offset) {
	const date = new Date(month + '-01T00:00:00Z');
	date.setUTCMonth(date.getUTCMonth() + offset);
	const result = date.toISOString().slice(0, 7);
	return result >= '1900-01' && result <= '2100-12' ? result : month;
}

/** @param {string} month */
export function calendarDays(month) {
	const date = new Date(month + '-01T00:00:00Z');
	date.setUTCDate(1 - date.getUTCDay());
	return Array.from({ length: 42 }, (_, index) => {
		const day = new Date(date);
		day.setUTCDate(date.getUTCDate() + index);
		return day.toISOString().slice(0, 10);
	});
}

/** @param {CalendarEvent} event @param {string} day */
export function occursOn(event, day) {
	return event.startDate <= day && event.endDate >= day;
}

/** @returns {FormDefinition} */
export function emptyForm() {
	return {
		title: '',
		description: '',
		published: false,
		accepting: true,
		questions: [{ id: 'q-name', title: '이름', type: 'text', required: true, options: [] }]
	};
}
