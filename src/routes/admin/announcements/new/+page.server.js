import { redirect, fail, isHttpError } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { announcement as announcementTable } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';
import { readAnnouncement } from '$lib/server/announcements';

export const actions = {
	create: async ({ request, locals }) => {
		const user = requireAdmin(locals);
		let values;
		try {
			values = readAnnouncement(await request.formData());
		} catch (cause) {
			if (isHttpError(cause, 400)) return fail(400, { message: cause.body.message });
			throw cause;
		}
		const id = `ann_${crypto.randomUUID()}`;
		await db
			.insert(announcementTable)
			.values({ ...values, id, authorId: user.id, authorName: user.name });
		redirect(303, `/announce/${id}`);
	}
};
