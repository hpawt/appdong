import assert from 'node:assert/strict';
import test from 'node:test';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { loadServerModule } from './helpers/server-module.js';

const targets = [
	['src/routes/admin/users/[userId]/+page.server.js', 'updateUser', 'update'],
	['src/routes/admin/users/[userId]/+page.server.js', 'deleteUser', 'delete'],
	['src/routes/admin/applications/[id]/+page.server.js', 'deleteApplication', 'delete'],
	['src/routes/admin/announcements/[id]/edit/+page.server.js', 'delete', 'delete']
];

for (const [path, actionName, operation] of targets) {
	test(`${actionName}: rejects non-admins before reading input or changing the DB`, async () => {
		let mutations = 0;
		const chain = {
			returning() {
				return [{ id: 'target' }];
			},
			set() {
				return chain;
			},
			where() {
				return chain;
			}
		};
		const { actions } = await loadServerModule(path, {
			'drizzle-orm': {
				/** @param {unknown} column @param {unknown} value */
				eq: (column, value) => ({ column, value })
			},
			'$lib/server/db': {
				db: {
					update() {
						mutations++;
						return chain;
					},
					delete() {
						mutations++;
						return chain;
					}
				}
			},
			'$lib/server/db/schema': {
				user: { id: 'user.id' },
				session: { id: 'session.id', userId: 'session.userId' },
				application: { id: 'application.id' },
				announcement: { id: 'announcement.id' }
			}
		});
		for (const user of [null, { role: 'USER' }, { role: 'admin' }, {}]) {
			await assert.rejects(
				actions[actionName]({
					locals: { user },
					params: { userId: 'target', id: 'target' },
					request: {
						formData() {
							assert.fail('Unauthorized input was read');
						}
					}
				}),
				(result) => isHttpError(result, 403)
			);
		}
		assert.equal(mutations, 0);

		// 같은 액션을 ADMIN이 호출하면 기존 수정/삭제 동작을 수행합니다.
		const event = {
			locals: { user: { role: 'ADMIN' } },
			params: { userId: 'target', id: 'target' },
			request: {
				async formData() {
					return new Map([
						['role', 'USER'],
						['name', '홍길동'],
						['department', '컴퓨터학부'],
						['student_id', '2026000001'],
						['phone_number', '01012345678']
					]);
				}
			}
		};
		if (operation === 'update') {
			assert.equal((await actions[actionName](event)).success, true);
		} else {
			await assert.rejects(
				actions[actionName](event),
				(result) => isRedirect(result) && result.status === 303
			);
		}
		assert.equal(mutations, 1);
	});
}

/** @param {{ routeId: string | null, method?: string, cookie?: string, user?: { role: string } | null, session?: object | null }} options */
async function runHook({ routeId, method = 'GET', cookie, user = null, session = null }) {
	const { handle } = await loadServerModule('src/hooks.server.js', {
		'$lib/server/auth': {
			sessionCookieName: 'auth-session',
			setSessionTokenCookie() {},
			deleteSessionTokenCookie() {},
			async validateSessionToken() {
				return { user, session };
			}
		}
	});
	let resolved = false;
	const event = {
		route: { id: routeId },
		request: { method },
		url: new URL('https://example.test/admin'),
		cookies: { get: () => cookie },
		locals: {}
	};
	try {
		await handle({
			event,
			resolve() {
				resolved = true;
				return 'OK';
			}
		});
		return { resolved };
	} catch (result) {
		assert.equal(resolved, false, 'Protected code ran before the authorization check');
		assert.ok(isHttpError(result) || isRedirect(result));
		return {
			resolved,
			status: result.status,
			location: isRedirect(result) ? result.location : undefined
		};
	}
}

test('hook blocks direct admin POSTs and data loads before resolving the route', async () => {
	for (const routeId of [
		'/admin',
		'/admin/users/[userId]',
		'/admin/applications/[id]',
		'/admin/announcements/[id]/edit'
	]) {
		for (const method of ['GET', 'HEAD', 'POST']) {
			const anonymous = await runHook({ routeId, method });
			assert.equal(anonymous.status, method === 'POST' ? 403 : 303);
			if (method !== 'POST') assert.equal(anonymous.location, '/login');
			const member = await runHook({
				routeId,
				method,
				cookie: 'test-token',
				user: { role: 'USER' },
				session: {}
			});
			assert.equal(member.status, 403);
			const admin = await runHook({
				routeId,
				method,
				cookie: 'test-token',
				user: { role: 'ADMIN' },
				session: {}
			});
			assert.equal(admin.resolved, true);
		}
	}
});

test('hook rejects expired admin sessions and preserves public routes', async () => {
	const expired = await runHook({
		routeId: '/admin/users/[userId]',
		method: 'POST',
		cookie: 'expired-token',
		user: { role: 'ADMIN' }
	});
	assert.equal(expired.status, 403);
	for (const routeId of ['/', '/login', '/signup', '/announce/[id]', '/administrator', null]) {
		assert.equal((await runHook({ routeId })).resolved, true);
	}
});
