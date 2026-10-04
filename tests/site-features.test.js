import assert from 'node:assert/strict';
import test from 'node:test';
import { isHttpError } from '@sveltejs/kit';
import { loadServerModule } from './helpers/server-module.js';
import { pageMetadata } from '../src/lib/seo.js';

test('closed recruitment never reads submission input or queries the DB, for guests and members', async () => {
	const { load, actions } = await loadServerModule(
		'src/routes/accession/application/+page.server.js',
		{
			'$lib/server/db': {
				db: new Proxy(
					{},
					{
						get() {
							assert.fail('Closed recruitment accessed the DB');
						}
					}
				)
			},
			'$lib/server/db/schema': { application: {}, user: {} }
		}
	);
	for (const user of [null, { id: 'member', role: 'USER' }, { id: 'admin', role: 'ADMIN' }]) {
		const result = await load({ locals: { user } });
		assert.equal(result.recruitmentOpen, false);
		assert.equal(result.userData, null);
		const submission = await actions.default({
			locals: { user },
			request: {
				formData() {
					assert.fail('Closed recruitment read input');
				}
			}
		});
		assert.equal(submission.status, 403);
		assert.match(submission.data.message, /모집 기간이 아닙니다/);
	}
});

test('hidden calendar/forms routes stop before loaders and preserve admin authorization', async () => {
	let resolved = 0;
	const { handle } = await loadServerModule('src/hooks.server.js', {
		'$lib/server/auth': {
			sessionCookieName: 'session',
			validateSessionToken: async () => ({
				user: { id: 'admin', role: 'ADMIN' },
				session: { expiresAt: new Date() }
			}),
			setSessionTokenCookie() {},
			deleteSessionTokenCookie() {}
		}
	});
	for (const route of [
		'/calendar',
		'/calendar/sub',
		'/forms',
		'/forms/[id]',
		'/admin/calendar/new',
		'/admin/forms/[id]/responses/export'
	]) {
		await assert.rejects(
			handle({
				event: {
					route: { id: route },
					locals: {},
					cookies: { get: () => 'admin' },
					request: { method: 'POST' }
				},
				resolve() {
					resolved++;
				}
			}),
			(cause) => isHttpError(cause, 404)
		);
	}
	await assert.rejects(
		handle({
			event: {
				route: { id: '/admin/forms/new' },
				locals: {},
				cookies: { get: () => null },
				request: { method: 'POST' }
			},
			resolve() {
				resolved++;
			}
		}),
		(cause) => isHttpError(cause, 403)
	);
	assert.equal(resolved, 0);
});

test('sharing metadata uses the current page and hides account and closed recruitment pages', () => {
	assert.equal(pageMetadata('/about-us').canonical, 'https://www.appdong.com/about-us');
	assert.equal(pageMetadata('/about-us').noindex, false);
	assert.equal(
		pageMetadata('/announce/a', { announcement: { title: '동아리 소식' } }).title,
		'동아리 소식 · APPDONG'
	);
	for (const path of ['/admin', '/admin/users', '/login', '/my-page', '/accession/application'])
		assert.equal(pageMetadata(path).noindex, true);
});
