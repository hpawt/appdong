import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { calendarEvent } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';
import { boundedFormData, readEvent, inputFailure } from '$lib/server/modu-validation';
export const actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		let values;
		try {
			values = readEvent(await boundedFormData(request));
		} catch (cause) {
			return inputFailure(cause);
		}
		await db.insert(calendarEvent).values({ id: crypto.randomUUID(), ...values });
		redirect(303, '/admin/calendar?month=' + values.startDate.slice(0, 7));
	}
};
