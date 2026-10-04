import assert from 'node:assert/strict';
import test from 'node:test';
import { calendarFile, filterEvents } from '../src/lib/calendar-tools.js';
import { loadServerModule } from './helpers/server-module.js';

const event = {
	id: 'local-test',
	title: '모임',
	description: '활동 안내',
	location: '동아리방',
	startDate: '2026-09-30',
	endDate: '2026-10-02',
	time: '',
	category: 'meeting',
	pinned: true
};

test('calendar search intersects words and category, normalizes text and sorts without mutating', () => {
	const events = [
		{
			...event,
			id: 'later',
			title: 'ＡＰＰ 세미나',
			startDate: '2026-10-05',
			endDate: '2026-10-05',
			category: 'event'
		},
		event
	];
	assert.deepEqual(
		filterEvents(events, 'app 동아리방', 'event').map((e) => e.id),
		['later']
	);
	assert.equal(filterEvents(events, 'APP', 'meeting').length, 0);
	assert.equal(filterEvents(events, '모임 없는단어').length, 0);
	assert.deepEqual(
		filterEvents(events).map((e) => e.id),
		['local-test', 'later']
	);
	assert.equal(events[0].id, 'later');
});

test('calendar export uses inclusive date spans, UTC for Korean times and safe UTF-8 folding', () => {
	const raw = calendarFile(
		[
			{
				...event,
				title: '가😀'.repeat(100) + ',;\\',
				description: '본문\nEND:VEVENT\r\nBEGIN:VEVENT'
			},
			{ ...event, id: 'timed', startDate: '2026-10-01', endDate: '2026-10-01', time: '00:30' }
		],
		new Date('2026-10-04T01:02:03Z')
	);
	assert.match(raw, /DTSTART;VALUE=DATE:20260930\r\nDTEND;VALUE=DATE:20261003/);
	assert.match(raw, /DTSTART:20260930T153000Z/);
	assert.match(raw, /DTSTAMP:20261004T010203Z/);
	assert.equal(raw.split('\r\n').filter((line) => line === 'BEGIN:VEVENT').length, 2);
	for (const line of raw.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75);
	const unfolded = raw.replace(/\r\n /g, '');
	assert.ok(unfolded.includes('SUMMARY:' + '가😀'.repeat(100) + '\\,\\;\\\\'));
	assert.match(unfolded, /DESCRIPTION:본문\\nEND:VEVENT\\nBEGIN:VEVENT/);
	assert.throws(() => calendarFile([{ ...event, endDate: '2026-02-30' }]));
	assert.throws(() => calendarFile([{ ...event, time: '25:00' }]));
	const multi = calendarFile([{ ...event, time: '18:30' }]);
	assert.match(multi, /DESCRIPTION:시작 시간: 18:30 \(한국 시간\)\\n활동 안내/);
});

test('workspace round-trip validates whole backup and rejects corrupt/oversized or duplicated records', async () => {
	const { readWorkspace, workspaceFile, MAX_WORKSPACE_BYTES } =
		await loadServerModule('src/lib/playground.js');
	const definition = {
		title: '참가 신청',
		description: '',
		published: false,
		accepting: true,
		questions: [{ id: 'name', title: '이름', type: 'text', required: true, options: [] }]
	};
	const original = { events: [event], definition };
	assert.deepEqual(JSON.parse(JSON.stringify(readWorkspace(workspaceFile(original)))), original);
	assert.deepEqual(
		JSON.parse(JSON.stringify(readWorkspace(workspaceFile({ events: [], definition: null })))),
		{ events: [], definition: null }
	);
	for (const value of [
		null,
		{ version: 2, ...original },
		{ version: 1, events: [event, event], definition: null },
		{ version: 1, events: [{ ...event, endDate: '2026-02-30' }], definition: null },
		{ version: 1, events: Array(101).fill(event), definition: null },
		{ version: 1, events: [], definition: { ...definition, questions: [] } }
	])
		assert.throws(() => readWorkspace(JSON.stringify(value)));
	assert.throws(() => readWorkspace(' '.repeat(MAX_WORKSPACE_BYTES + 1)));
	assert.equal(original.events.length, 1);
});
