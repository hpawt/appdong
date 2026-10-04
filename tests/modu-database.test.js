import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import * as schema from '../src/lib/server/db/schema.js';
import { loadServerModule } from './helpers/server-module.js';

const admin = { id: 'admin', role: 'ADMIN' };
const questions = [
	{ id: 'name', title: '이름', type: 'text', required: true, options: [] },
	{ id: 'email', title: '이메일', type: 'email', required: true, options: [] },
	{ id: 'choice', title: '참여 시간', type: 'checkbox', required: true, options: ['오전', '오후'] }
];
const definition = {
	title: '모임 신청',
	description: '',
	published: false,
	accepting: true,
	questions
};

/** @param {Record<string, string|string[]>} values */
function request(values) {
	const body = new URLSearchParams();
	for (const [key, value] of Object.entries(values))
		for (const entry of Array.isArray(value) ? value : [value]) body.append(key, entry);
	return new Request('http://localhost/action', { method: 'POST', body });
}

test('PostgreSQL migration, actual route CRUD, response snapshots, permissions and CSV export', async (t) => {
	const client = new PGlite();
	t.after(() => client.close());
	const migration = await readFile(new URL('../migrations/0001_modu.sql', import.meta.url), 'utf8');
	await client.exec(migration);
	await client.exec(migration); // Repeatable and additive.
	const db = drizzle(client, { schema });
	const dependencies = { '$lib/server/db': { db }, '$lib/server/db/schema': schema };
	const create = await loadServerModule('src/routes/admin/forms/new/+page.server.js', dependencies);
	const edit = await loadServerModule('src/routes/admin/forms/[id]/+page.server.js', dependencies);
	const publicForm = await loadServerModule('src/routes/forms/[id]/+page.server.js', dependencies);
	const responses = await loadServerModule(
		'src/routes/admin/forms/[id]/responses/+page.server.js',
		dependencies
	);
	const exported = await loadServerModule(
		'src/routes/admin/forms/[id]/responses/export/+server.js',
		dependencies
	);
	const adminList = await loadServerModule('src/routes/admin/forms/+page.server.js', dependencies);
	const publicList = await loadServerModule('src/routes/forms/+page.server.js', dependencies);
	let id = '';
	await assert.rejects(
		create.actions.save({
			locals: { user: admin },
			request: request({ definition: JSON.stringify(definition) })
		}),
		(cause) => {
			if (!isRedirect(cause)) return false;
			id = cause.location.split('/').pop() || '';
			return true;
		}
	);
	const params = { id };
	assert.equal((await publicList.load()).forms.length, 0);
	assert.equal((await adminList.load({ locals: { user: admin } })).forms.length, 1);
	await assert.rejects(
		publicForm.actions.submit({
			params,
			request: request({ version: 'private', name: '김테스트' })
		}),
		(cause) => isHttpError(cause, 404)
	);
	await assert.rejects(publicForm.load({ params, locals: { user: null } }), (cause) =>
		isHttpError(cause, 404)
	);
	let row = (await edit.load({ params, locals: { user: admin } })).definition;
	assert.equal(row.questions.length, 3);
	await assert.rejects(
		edit.actions.save({
			params,
			locals: { user: admin },
			request: request({
				definition: JSON.stringify({ ...definition, published: true }),
				version: row.version
			})
		}),
		isRedirect
	);
	row = (await publicForm.load({ params, locals: { user: null } })).definition;
	assert.equal((await publicList.load()).forms.length, 1);
	const values = {
		version: row.version,
		name: '=HYPERLINK("evil")',
		email: 'test@example.com',
		choice: ['오전']
	};
	assert.equal(
		(await publicForm.actions.submit({ params, request: request({ ...values, email: 'bad' }) }))
			.status,
		400
	);
	assert.equal(
		(await publicForm.actions.submit({ params, request: request({ ...values, version: 'stale' }) }))
			.status,
		409
	);
	assert.equal(
		(await publicForm.actions.submit({ params, request: request(values) })).success,
		true
	);
	const context = { params, locals: { user: admin }, url: new URL('http://localhost/responses') };
	let responsePage = await responses.load(context);
	assert.equal(responsePage.total, 1);
	assert.equal((await adminList.load({ locals: { user: admin } })).forms[0].responseCount, 1);
	assert.equal(responsePage.responses[0].questions.length, 3);
	assert.equal(responsePage.responses[0].answers.name, values.name);
	const responseId = responsePage.responses[0].id;
	await assert.rejects(
		edit.actions.save({
			params,
			locals: { user: admin },
			request: request({
				definition: JSON.stringify({
					...definition,
					published: true,
					accepting: false,
					questions: [questions[0]]
				}),
				version: row.version
			})
		}),
		isRedirect
	);
	assert.equal((await publicForm.actions.submit({ params, request: request(values) })).status, 403);
	responsePage = await responses.load(context);
	assert.equal(
		responsePage.responses[0].questions.length,
		3,
		'Old question definitions must remain intact'
	);
	const csvResponse = await exported.GET({ params, locals: { user: admin } });
	const bytes = new Uint8Array(await csvResponse.arrayBuffer());
	assert.deepEqual([...bytes.slice(0, 3)], [239, 187, 191]);
	const csv = new TextDecoder().decode(bytes);
	assert.match(csv, /참여 시간/);
	assert.match(csv, /'=HYPERLINK/);
	assert.equal(csvResponse.headers.get('cache-control'), 'no-store');
	await assert.rejects(
		responses.actions.delete({
			params: { id: 'other' },
			locals: { user: admin },
			request: request({ responseId })
		}),
		(cause) => isHttpError(cause, 404)
	);
	assert.equal(
		(
			await responses.actions.delete({
				params,
				locals: { user: admin },
				request: request({ responseId })
			})
		).success,
		true
	);
	assert.equal((await responses.load(context)).total, 0);
	const current = (await edit.load({ params, locals: { user: admin } })).definition;
	const staleSave = await edit.actions.save({
		params,
		locals: { user: admin },
		request: request({ definition: JSON.stringify(definition), version: row.version })
	});
	assert.equal(staleSave.status, 409);
	assert.equal(
		(await edit.load({ params, locals: { user: admin } })).definition.version,
		current.version
	);
	await db.insert(schema.formResponse).values({
		id: crypto.randomUUID(),
		formId: id,
		questions,
		answers: {},
		version: current.version
	});
	await assert.rejects(edit.actions.delete({ params, locals: { user: admin } }), isRedirect);
	assert.equal(
		(await db.select().from(schema.formResponse)).length,
		0,
		'Form deletion cascades to responses'
	);

	const newEvent = await loadServerModule(
		'src/routes/admin/calendar/new/+page.server.js',
		dependencies
	);
	const editEvent = await loadServerModule(
		'src/routes/admin/calendar/[id]/+page.server.js',
		dependencies
	);
	const calendar = await loadServerModule('src/lib/server/calendar.js', dependencies);
	const eventValues = {
		title: '월 경계 행사',
		description: '공지',
		location: '동아리방',
		startDate: '2026-09-30',
		endDate: '2026-10-02',
		time: '18:30',
		category: 'event',
		pinned: 'on'
	};
	await assert.rejects(
		newEvent.actions.save({ locals: { user: admin }, request: request(eventValues) }),
		isRedirect
	);
	const [event] = await db.select().from(schema.calendarEvent);
	assert.equal(
		(await calendar.calendarData(new URL('http://localhost/calendar?month=2026-10'))).events[0].id,
		event.id
	);
	await assert.rejects(
		editEvent.actions.save({
			params: { id: event.id },
			locals: { user: admin },
			request: request({ ...eventValues, title: '변경된 행사' })
		}),
		isRedirect
	);
	assert.equal(
		(await db.select().from(schema.calendarEvent).where(eq(schema.calendarEvent.id, event.id)))[0]
			.title,
		'변경된 행사'
	);
	await assert.rejects(
		editEvent.actions.delete({ params: { id: event.id }, locals: { user: admin } }),
		isRedirect
	);
	assert.equal((await db.select().from(schema.calendarEvent)).length, 0);
});

test('all new admin loaders, mutations and exports reject non-admins before reading input', async () => {
	const dependencies = { '$lib/server/db': { db: {} }, '$lib/server/db/schema': schema };
	for (const path of [
		'src/routes/admin/calendar/+page.server.js',
		'src/routes/admin/calendar/new/+page.server.js',
		'src/routes/admin/calendar/[id]/+page.server.js',
		'src/routes/admin/forms/+page.server.js',
		'src/routes/admin/forms/new/+page.server.js',
		'src/routes/admin/forms/[id]/+page.server.js',
		'src/routes/admin/forms/[id]/responses/+page.server.js',
		'src/routes/admin/forms/[id]/responses/export/+server.js'
	]) {
		const module = await loadServerModule(path, dependencies);
		const functions = [
			...Object.values(module.actions || {}),
			...['load', 'GET'].filter((key) => module[key]).map((key) => module[key])
		];
		for (const invoke of functions)
			for (const user of [null, { role: 'USER' }]) {
				await assert.rejects(
					async () =>
						invoke({
							locals: { user },
							params: { id: 'target' },
							url: new URL('http://localhost'),
							request: {
								formData() {
									assert.fail('Input read before authorization');
								}
							}
						}),
					(cause) => isHttpError(cause, 403)
				);
			}
	}
});
