import { publicAnnouncements } from '$lib/server/announcement-queries';
export async function load() {
	const { announcements, unavailable } = await publicAnnouncements(5);
	return { recentAnnouncements: announcements, announcementsUnavailable: unavailable };
}
