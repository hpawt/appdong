import { eq } from 'drizzle-orm';
import { error, redirect, fail, isHttpError } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { announcement as announcementTable } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';
import { readAnnouncement, sanitizeContent } from '$lib/server/announcements';
import { parseAttachments } from '$lib/attachments';

export async function load({ params, locals }) {
	requireAdmin(locals);
	const [announcement] = await db
		.select()
		.from(announcementTable)
		.where(eq(announcementTable.id, params.id));
	if (!announcement) error(404, '공지사항을 찾을 수 없습니다.');
	return {
		announcement: {
			...announcement,
			content: sanitizeContent(announcement.content),
			attachments: parseAttachments(announcement.attachments)
		}
	};
}

export const actions = {
	update: async ({ request, params, locals }) => {
		const user = requireAdmin(locals);
		let values;
		try {
			values = readAnnouncement(await request.formData());
		} catch (cause) {
			if (isHttpError(cause, 400)) return fail(400, { message: cause.body.message });
			throw cause;
		}
		const updated = await db
			.update(announcementTable)
			.set({ ...values, authorName: user.name })
			.where(eq(announcementTable.id, params.id))
			.returning({ id: announcementTable.id });
		if (!updated.length) error(404, '공지사항을 찾을 수 없습니다.');
		redirect(303, '/admin/announcements');
	},
	delete: async ({ params, locals }) => {
		requireAdmin(locals);
		const deleted = await db
			.delete(announcementTable)
			.where(eq(announcementTable.id, params.id))
			.returning({ id: announcementTable.id });
		if (!deleted.length) error(404, '삭제할 공지사항을 찾을 수 없습니다.');
		redirect(303, '/admin/announcements');
	}
};
