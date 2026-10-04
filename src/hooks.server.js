import { redirect, error } from '@sveltejs/kit';
import { siteFeatures } from '$lib/site-features';
import {
	sessionCookieName,
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie
} from '$lib/server/auth';
import { requireAdmin } from '$lib/server/permissions';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const token = event.cookies.get(sessionCookieName);
	event.locals.user = null;
	event.locals.session = null;
	if (token) {
		const { user, session } = await validateSessionToken(token);
		if (user && session) {
			event.locals.user = user;
			event.locals.session = session;
			setSessionTokenCookie(event, token, session.expiresAt);
		} else deleteSessionTokenCookie(event);
	}
	const routeId = event.route.id ?? '';
	if (routeId === '/admin' || routeId.startsWith('/admin/')) {
		if (!event.locals.user && ['GET', 'HEAD'].includes(event.request.method))
			redirect(303, '/login');
		requireAdmin(event.locals);
	}
	if (!siteFeatures.modu && /^\/(?:admin\/)?(?:calendar|forms)(?:\/|$)/.test(routeId))
		error(404, '페이지를 준비하고 있습니다.');
	return resolve(event);
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error: cause, status }) {
	console.error('Request failed', status, cause instanceof Error ? cause.name : 'UnknownError');
	return {
		message:
			status === 500
				? '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
				: '요청을 처리할 수 없습니다.'
	};
}
