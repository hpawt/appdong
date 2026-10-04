import { calendarData } from '$lib/server/calendar';
export const load = ({ url }) => calendarData(url);
