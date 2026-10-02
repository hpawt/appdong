import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/permissions';

export function load({ params, locals }) {
	requireAdmin(locals);
	redirect(303, `/admin/announcements/${encodeURIComponent(params.id)}/edit`);
}
