import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { calendarEvent } from '$lib/server/db/schema';
import { calendarDays, todayKey, validDate } from '$lib/modu';

/** @param {URL} url @param {boolean} [admin] */
export async function calendarData(url, admin = false) {
	const month = url.searchParams.get('month') || todayKey().slice(0, 7);
	if (!/^\d{4}-\d{2}$/.test(month) || !validDate(month + '-01'))
		error(400, '올바른 월을 선택해주세요.');
	const days = calendarDays(month);
	try {
		const [events, pinnedEvents] = await Promise.all([
			db
				.select()
				.from(calendarEvent)
				.where(and(lte(calendarEvent.startDate, days[41]), gte(calendarEvent.endDate, days[0])))
				.orderBy(asc(calendarEvent.startDate), asc(calendarEvent.time), asc(calendarEvent.id)),
			db
				.select()
				.from(calendarEvent)
				.where(and(gte(calendarEvent.endDate, todayKey()), eq(calendarEvent.pinned, true)))
				.orderBy(asc(calendarEvent.startDate))
				.limit(5)
		]);
		return {
			month,
			events,
			pinnedEvents: pinnedEvents.filter((event) => event.pinned),
			unavailable: false
		};
	} catch {
		if (admin)
			error(503, '일정 저장소에 연결할 수 없습니다. DB와 기능 테이블 설정을 확인해주세요.');
		return { month, events: [], pinnedEvents: [], unavailable: true };
	}
}
