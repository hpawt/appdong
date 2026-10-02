import { publicAnnouncements } from '$lib/server/announcement-queries';
export function load() {
	return publicAnnouncements();
}
