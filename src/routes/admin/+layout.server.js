import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/permissions';
export function load({ locals }) {
	if (!locals.user) redirect(303, '/login');
	requireAdmin(locals);
}
