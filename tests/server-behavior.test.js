import assert from 'node:assert/strict';
import test from 'node:test';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { loadServerModule } from './helpers/server-module.js';

/** @param {Record<string, string>} values */
function form(values) {
	const data = new FormData();
	for (const [key, value] of Object.entries(values)) data.set(key, value);
	return data;
}

/** @param {any[]} [rows] */
function database(rows = []) {
	/** @type {any[]} */
	const writes = [];
	let current = rows;
	const chain = {
		from() {
			return chain;
		},
		innerJoin() {
			return chain;
		},
		for() {
			return chain;
		},
		where() {
			return chain;
		},
		/** @param {Record<string, unknown>} values */
		set(values) {
			writes.push({ type: 'update', values });
			return chain;
		},
		/** @param {Record<string, unknown>} values */
		values(values) {
			writes.push({ type: 'insert', values });
			return Promise.resolve();
		},
		returning() {
			return Promise.resolve(current);
		},
		/** @param {(rows: any[]) => unknown} resolve */
		then(resolve) {
			return Promise.resolve(current) /** @param {(rows: any[]) => unknown} resolve */
				.then(resolve);
		}
	};
	const db = {
		select() {
			return chain;
		},
		insert() {
			return chain;
		},
		update() {
			return chain;
		},
		delete() {
			writes.push({ type: 'delete' });
			return chain;
		},
		transaction: async (/** @type {(transaction: typeof db) => unknown} */ callback) =>
			callback(db),
		query: {
			user: { findFirst: async () => current[0] },
			application: { findFirst: async () => current[0] }
		}
	};
	return {
		db,
		writes,
		/** @param {any[]} values */
		setRows(values) {
			current = values;
		}
	};
}

const user = {
	id: 'member',
	username: 'member',
	name: '홍길동',
	role: 'USER',
	hashed_password: 'hash'
};
const admin = { ...user, id: 'admin', role: 'ADMIN' };
const schema = {
	user: { id: 'id', userId: 'userId', username: 'username' },
	session: { id: 'id', userId: 'userId' },
	application: { id: 'id', userId: 'userId' },
	announcement: { id: 'id' }
};
const validProfile = {
	name: '홍길동',
	department: '컴퓨터학부',
	phone1: '010',
	phone2: '1234',
	phone3: '5678'
};

test('form validation rejects files, oversized text and forged choices', async () => {
	const { readText, readChoices, isUniqueViolation } = await loadServerModule(
		'src/lib/server/validation.js'
	);
	const data = form({ name: '  홍길동  ' });
	assert.equal(readText(data, 'name'), '홍길동');
	data.set('name', new File(['x'], 'fake.txt'));
	assert.throws(
		() => readText(data, 'name'),
		(cause) => isHttpError(cause, 400)
	);
	assert.throws(
		() => readText(form({ name: '1234' }), 'name', { max: 3 }),
		(cause) => isHttpError(cause, 400)
	);
	assert.throws(
		() => readChoices(form({ activity: 'forged' }), 'activity', ['known']),
		(cause) => isHttpError(cause, 400)
	);
	assert.equal(isUniqueViolation({ cause: { code: '23505' } }), true);
});

test('announcement HTML strips scripts, handlers, unsafe URLs and CSS while keeping Quill markup', async () => {
	const { sanitizeContent, readAnnouncement } = await loadServerModule(
		'src/lib/server/announcements.js'
	);
	const dirty =
		'<script>alert(1)</script><p class="ql-align-center" style="color:#ff0000;background-image:url(javascript:x)">안내</p><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:x">링크</a><img src="https://example.test/photo.png">';
	const clean = sanitizeContent(dirty);
	assert.doesNotMatch(clean, /script|onerror|javascript|background-image/);
	assert.match(clean, /ql-align-center/);
	assert.match(clean, /https:\/\/example.test\/photo.png/);
	assert.throws(
		() => readAnnouncement(form({ title: '제목', content: '<p><br></p>' })),
		(cause) => isHttpError(cause, 400)
	);
	assert.throws(
		() =>
			readAnnouncement(
				form({
					title: '제목',
					content: '<p>내용</p>',
					attachments: '[{"name":"x","url":"javascript:x"}]'
				})
			),
		(cause) => isHttpError(cause, 400)
	);
});

test('upload validation rejects executable formats, size overflow and fake image content', async () => {
	const { validateUpload, MAX_UPLOAD_BYTES } = await loadServerModule('src/lib/server/uploads.js');
	await assert.rejects(validateUpload('text'), (cause) => isHttpError(cause, 400));
	await assert.rejects(
		validateUpload(new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })),
		(cause) => isHttpError(cause, 400)
	);
	await assert.rejects(
		validateUpload(new File(['<script/>'], 'x.png', { type: 'image/png' })),
		(cause) => isHttpError(cause, 400)
	);
	await assert.rejects(
		validateUpload(
			new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], 'x.txt', { type: 'text/plain' })
		),
		(cause) => isHttpError(cause, 413)
	);
	const pdf = await validateUpload(
		new File(['%PDF-1.7 test'], '../guide.pdf', { type: 'application/pdf' })
	);
	assert.equal(pdf.contentType, 'application/pdf');
	assert.doesNotMatch(pdf.name, /\//);
});

test('public password reset cannot be used to change arbitrary users', async () => {
	const { actions } = await loadServerModule('src/routes/forgot-password/+page.server.js');
	for (const action of Object.values(actions)) assert.equal(action().status, 403);
});

test('admin password reset requires authority, validates confirmation and invalidates sessions', async () => {
	const state = database([user]);
	const { actions } = await loadServerModule('src/routes/admin/users/[userId]/+page.server.js', {
		'$lib/server/db': { db: state.db },
		'$lib/server/db/schema': schema,
		'$lib/server/passwords': { hashPassword: async () => 'new-hash' }
	});
	for (const actor of [null, user]) {
		await assert.rejects(
			actions.resetPassword({
				locals: { user: actor },
				params: { userId: user.id },
				request: {
					formData() {
						assert.fail('Unauthorized input was read');
					}
				}
			}),
			(cause) => isHttpError(cause, 403)
		);
	}
	const event = {
		locals: { user: admin },
		params: { userId: user.id },
		request: { formData: async () => form({ password: 'password', confirm_password: 'wrong' }) }
	};
	assert.equal((await actions.resetPassword(event)).status, 400);
	assert.equal(state.writes.length, 0);
	event.request.formData = async () => form({ password: 'password', confirm_password: 'password' });
	assert.equal((await actions.resetPassword(event)).success, true);
	assert.equal(state.writes[0].values.hashed_password, 'new-hash');
	assert.equal(state.writes[1].type, 'delete');
	state.setRows([]);
	await assert.rejects(actions.resetPassword(event), (cause) => isHttpError(cause, 404));
	assert.equal(state.writes.filter((entry) => entry.type === 'delete').length, 1);
});

test('legacy attachment and choice lists tolerate corrupt data and deduplicate rendering keys', async () => {
	const { parseAttachments, parseStringList } = await loadServerModule('src/lib/attachments.js');
	assert.equal(parseAttachments('not-json').length, 0);
	const files = parseAttachments(
		JSON.stringify([
			{ name: 'guide', url: 'https://example.test/guide.pdf' },
			{ name: 'duplicate', url: 'https://example.test/guide.pdf' },
			{ name: 'unsafe', url: 'javascript:x' }
		])
	);
	assert.equal(files.length, 1);
	assert.equal(files[0].name, 'guide');
	assert.equal(parseStringList('["Python","Python",2]').join(','), 'Python');
});

test('password hashing verifies correct secrets and rejects wrong or corrupt hashes', async () => {
	const { hashPassword, verifyPassword } = await loadServerModule('src/lib/server/passwords.js');
	const hash = await hashPassword('correct-password');
	assert.notEqual(hash, 'correct-password');
	assert.equal(await verifyPassword(hash, 'correct-password'), true);
	assert.equal(await verifyPassword(hash, 'wrong-password'), false);
	assert.equal(await verifyPassword('invalid-hash', 'correct-password'), false);
});

test('profile updates require the current password and invalidate all sessions on password change', async () => {
	const state = database([user]);
	const { actions } = await loadServerModule('src/routes/my-page/+page.server.js', {
		'$lib/server/db': { db: state.db },
		'$lib/server/db/schema': schema,
		'$lib/server/passwords': {
			verifyPassword: async (/** @type {string} */ _hash, /** @type {string} */ password) =>
				password === 'correct',
			hashPassword: async () => 'new-hash'
		},
		'$lib/server/auth': { deleteSessionTokenCookie() {} }
	});
	const event = {
		locals: { user, session: { id: 'session' } },
		request: { formData: async () => form(validProfile) }
	};
	assert.equal((await actions.updateProfile(event)).status, 403);
	assert.equal(state.writes.length, 0);
	event.request.formData = async () => form({ ...validProfile, current_password: 'wrong' });
	assert.equal((await actions.updateProfile(event)).status, 403);
	assert.equal(state.writes.length, 0);
	event.request.formData = async () =>
		form({
			...validProfile,
			current_password: 'correct',
			password: 'new-password',
			confirm_password: 'new-password'
		});
	await assert.rejects(
		actions.updateProfile(event),
		(cause) => isRedirect(cause) && cause.location === '/login?message=password_updated'
	);
	assert.equal(state.writes[0].values.hashed_password, 'new-hash');
	assert.equal(state.writes[1].type, 'delete');
});

test('reauthentication rejects wrong passwords and succeeds with the correct password', async () => {
	const state = database([user]);
	const { actions } = await loadServerModule('src/routes/my-page/+page.server.js', {
		'$lib/server/db': { db: state.db },
		'$lib/server/db/schema': schema,
		'$lib/server/passwords': {
			verifyPassword: async (/** @type {string} */ _hash, /** @type {string} */ password) =>
				password === 'correct',
			hashPassword: async () => 'hash'
		},
		'$lib/server/auth': { deleteSessionTokenCookie() {} }
	});
	const event = {
		locals: { user },
		request: { formData: async () => form({ password: 'wrong' }) }
	};
	assert.equal((await actions.reauthenticate(event)).status, 400);
	event.request.formData = async () => form({ password: 'correct' });
	assert.equal((await actions.reauthenticate(event)).step, 2);
});

test('missing delete targets return 404 instead of a false success or 500', async () => {
	for (const [path, name] of [
		['src/routes/admin/users/[userId]/+page.server.js', 'deleteUser'],
		['src/routes/admin/applications/[id]/+page.server.js', 'deleteApplication'],
		['src/routes/admin/announcements/[id]/edit/+page.server.js', 'delete']
	]) {
		const state = database();
		const { actions } = await loadServerModule(path, {
			'$lib/server/db': { db: state.db },
			'$lib/server/db/schema': schema
		});
		await assert.rejects(
			actions[name]({ locals: { user: admin }, params: { id: 'missing', userId: 'missing' } }),
			(cause) => isHttpError(cause, 404)
		);
	}
});

test('signup validates the required fields and always assigns USER despite forged role input', async () => {
	const state = database();
	const { actions } = await loadServerModule('src/routes/signup/+page.server.js', {
		'$lib/server/db': { db: state.db },
		'$lib/server/db/schema': schema,
		'$lib/server/passwords': { hashPassword: async () => 'hash' }
	});
	assert.equal(
		(
			await actions.default({
				request: { formData: async () => form({ ...validProfile, username: 'ab' }) }
			})
		).status,
		400
	);
	assert.equal(state.writes.length, 0);
	const result = await actions.default({
		request: {
			formData: async () =>
				form({
					...validProfile,
					username: 'member',
					student_id: '2026000001',
					password: 'password',
					confirm_password: 'password',
					role: 'ADMIN'
				})
		}
	});
	assert.equal(result.success, true);
	assert.equal(state.writes[0].values.role, 'USER');
});

test('applications reject forged enum values and duplicate submissions before inserting', async () => {
	const state = database([{ id: 'existing' }]);
	const { actions } = await loadServerModule('src/routes/accession/application/+page.server.js', {
		'$lib/site-features': { siteFeatures: { recruitment: true } },
		'$lib/server/db': { db: state.db },
		'$lib/server/db/schema': schema
	});
	const values = {
		fullName: '홍길동',
		phoneNumber: '01012345678',
		university: '경북대학교',
		department: '컴퓨터학부',
		studentId: '2026000001',
		motivation: '지원 동기',
		programmingExperience: '보통',
		githubExperience: '유',
		activityChoice: '스터디'
	};
	assert.equal(
		(
			await actions.default({
				locals: { user },
				request: { formData: async () => form({ ...values, githubExperience: 'x' }) }
			})
		).status,
		400
	);
	assert.equal(
		(await actions.default({ locals: { user }, request: { formData: async () => form(values) } }))
			.status,
		403
	);
	assert.equal(state.writes.length, 0);
	state.setRows([]);
	assert.equal(
		(await actions.default({ locals: { user }, request: { formData: async () => form(values) } }))
			.success,
		true
	);
	assert.equal(state.writes.length, 1);
});

test('expired sessions are deleted and renewal updates the server expiration', async () => {
	const state = database([
		{ user, session: { id: 'session', userId: user.id, expiresAt: new Date(Date.now() - 1000) } }
	]);
	const auth = await loadServerModule('src/lib/server/auth.js', {
		'$lib/server/db': { db: state.db },
		'$lib/server/db/schema': schema
	});
	assert.equal((await auth.validateSessionToken('test-token')).user, null);
	assert.equal(state.writes[0].type, 'delete');
	state.setRows([
		{ user, session: { id: 'session', userId: user.id, expiresAt: new Date(Date.now() + 1000) } }
	]);
	const renewed = await auth.validateSessionToken('test-token');
	assert.ok(renewed.session.expiresAt.getTime() > Date.now() + 50 * 60 * 1000);
	assert.equal(state.writes[1].type, 'update');
	const token = auth.generateSessionToken();
	assert.ok(token.length >= 40);
});
