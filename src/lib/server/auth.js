import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const SESSION_DURATION = 60 * 60 * 1000;
export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	return encodeBase64url(crypto.getRandomValues(new Uint8Array(32)));
}

/** @param {string} token */
function sessionId(token) {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

/** @param {string} token @param {string} userId */
export async function createSession(token, userId) {
	const session = {
		id: sessionId(token),
		userId,
		expiresAt: new Date(Date.now() + SESSION_DURATION)
	};
	await db.insert(table.session).values(session);
	return session;
}

/** @param {string} token */
export async function validateSessionToken(token) {
	const [result] = await db
		.select({
			user: {
				id: table.user.id,
				username: table.user.username,
				name: table.user.name,
				role: table.user.role
			},
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId(token)));
	if (!result) return { session: null, user: null };
	const { session, user } = result;
	if (Date.now() >= session.expiresAt.getTime()) {
		await invalidateSession(session.id);
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - SESSION_DURATION / 2) {
		session.expiresAt = new Date(Date.now() + SESSION_DURATION);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}
	return { session, user };
}

/** @param {string} id */
export async function invalidateSession(id) {
	await db.delete(table.session).where(eq(table.session.id, id));
}

/** @param {import('@sveltejs/kit').RequestEvent} event @param {string} token @param {Date} expiresAt */
export function setSessionTokenCookie(event, token, expiresAt) {
	event.cookies.set(sessionCookieName, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: event.url.protocol === 'https:',
		expires: expiresAt
	});
}

/** @param {import('@sveltejs/kit').RequestEvent} event */
export function deleteSessionTokenCookie(event) {
	event.cookies.delete(sessionCookieName, { path: '/' });
	event.locals.user = null;
	event.locals.session = null;
}
