import { db } from '$lib/server/db';

/** @param {number | undefined} [limit] */
export function listAnnouncements(limit) {
	return db.query.announcement.findMany({
		limit,
		columns: { id: true, title: true, authorName: true, createdAt: true },
		orderBy: (announcements, { desc }) => [desc(announcements.createdAt)]
	});
}

/** @param {number | undefined} [limit] */
export async function publicAnnouncements(limit) {
	try {
		return { announcements: await listAnnouncements(limit), unavailable: false };
	} catch {
		return { announcements: [], unavailable: true };
	}
}
