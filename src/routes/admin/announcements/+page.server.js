import { listAnnouncements } from '$lib/server/announcement-queries';
import { requireAdmin } from '$lib/server/permissions';
export async function load({ locals }) {
	requireAdmin(locals);
	return { announcements: await listAnnouncements() };
}
