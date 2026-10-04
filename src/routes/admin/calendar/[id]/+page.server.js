import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { calendarEvent } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';
import { boundedFormData, readEvent, inputFailure } from '$lib/server/modu-validation';
export async function load({ params, locals }) {
	requireAdmin(locals);
	const event = await db.query.calendarEvent.findFirst({ where: eq(calendarEvent.id, params.id) });
	if (!event) error(404, '일정을 찾을 수 없습니다.');
	return { event };
}
export const actions = {
	save: async ({ request, params, locals }) => {
		requireAdmin(locals);
		let values;
		try {
			values = readEvent(await boundedFormData(request));
		} catch (cause) {
			return inputFailure(cause);
		}
		const rows = await db
			.update(calendarEvent)
			.set({ ...values, updatedAt: new Date() })
			.where(eq(calendarEvent.id, params.id))
			.returning({ id: calendarEvent.id });
		if (!rows.length) error(404, '일정을 찾을 수 없습니다.');
		redirect(303, '/admin/calendar?month=' + values.startDate.slice(0, 7));
	},
	delete: async ({ params, locals }) => {
		requireAdmin(locals);
		const rows = await db
			.delete(calendarEvent)
			.where(eq(calendarEvent.id, params.id))
			.returning({ id: calendarEvent.id });
		if (!rows.length) error(404, '일정을 찾을 수 없습니다.');
		redirect(303, '/admin/calendar');
	}
};
