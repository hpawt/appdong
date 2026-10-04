import { requireAdmin } from '$lib/server/permissions';
import { calendarData } from '$lib/server/calendar';
export const load = ({ url, locals }) => {
	requireAdmin(locals);
	return calendarData(url, true);
};
