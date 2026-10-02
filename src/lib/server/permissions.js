import { error, redirect } from '@sveltejs/kit';

/** @param {App.Locals} locals */
export function requireUser(locals) {
	if (!locals.user) redirect(303, '/login');
	return locals.user;
}

/** @param {App.Locals} locals */
export function requireAdmin(locals) {
	if (locals.user?.role !== 'ADMIN') error(403, '접근 권한이 없습니다.');
	return locals.user;
}
