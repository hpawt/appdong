import { validDate } from './modu.js';

/** @param {import('./modu').CalendarEvent[]} events @param {string} [query] @param {string} [category] */
export function filterEvents(events, query = '', category = '') {
	const words = query.trim().normalize('NFKC').toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);
	return events
		.filter((event) => {
			const content = [event.title, event.description, event.location]
				.join(' ')
				.normalize('NFKC')
				.toLocaleLowerCase('ko');
			return (
				(!category || event.category === category) && words.every((word) => content.includes(word))
			);
		})
		.sort(
			(a, b) =>
				a.startDate.localeCompare(b.startDate) ||
				a.time.localeCompare(b.time) ||
				a.title.localeCompare(b.title, 'ko')
		);
}

/** @param {string} value */
function escapeText(value) {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/\r\n|\r|\n/g, '\\n')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.split('')
		.filter((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
		.join('');
}

/** Fold UTF-8 content lines without splitting a code point. @param {string} value */
function foldLine(value) {
	const encoder = new TextEncoder();
	let line = '',
		bytes = 0;
	const lines = [];
	for (const char of value) {
		const length = encoder.encode(char).length;
		if (bytes + length > 75) {
			lines.push(line);
			line = ' ';
			bytes = 1;
		}
		line += char;
		bytes += length;
	}
	lines.push(line);
	return lines.join('\r\n');
}

/** @param {Date} date */
function utcStamp(date) {
	return date
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}Z$/, 'Z');
}

/** RFC 5545: dates include the final day; timed events have no invented end time.
 * @param {import('./modu').CalendarEvent[]} events @param {Date} [now] */
export function calendarFile(events, now = new Date()) {
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//APPDONG//Calendar//KO',
		'CALSCALE:GREGORIAN'
	];
	for (const event of events) {
		if (
			!validDate(event.startDate) ||
			!validDate(event.endDate) ||
			event.endDate < event.startDate ||
			(event.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time))
		)
			throw new Error('일정 날짜와 시간을 확인해주세요.');
		lines.push(
			'BEGIN:VEVENT',
			`UID:${escapeText(event.id)}@appdong.com`,
			`DTSTAMP:${utcStamp(now)}`
		);
		if (event.time && event.startDate === event.endDate) {
			lines.push(`DTSTART:${utcStamp(new Date(`${event.startDate}T${event.time}:00+09:00`))}`);
		} else {
			const end = new Date(event.endDate + 'T00:00:00Z');
			end.setUTCDate(end.getUTCDate() + 1);
			lines.push(
				`DTSTART;VALUE=DATE:${event.startDate.replace(/-/g, '')}`,
				`DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replace(/-/g, '')}`
			);
		}
		const description =
			event.time && event.startDate !== event.endDate
				? `시작 시간: ${event.time} (한국 시간)\n${event.description}`
				: event.description;
		lines.push(
			`SUMMARY:${escapeText(event.title)}`,
			`DESCRIPTION:${escapeText(description)}`,
			`LOCATION:${escapeText(event.location)}`,
			'END:VEVENT'
		);
	}
	lines.push('END:VCALENDAR');
	return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** @param {string} contents @param {string} filename @param {string} [type] */
export function downloadFile(contents, filename, type = 'application/json;charset=utf-8') {
	const url = URL.createObjectURL(new Blob([contents], { type }));
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
