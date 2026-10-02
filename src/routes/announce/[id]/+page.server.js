import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { announcement as announcementTable } from '$lib/server/db/schema';
import { sanitizeContent } from '$lib/server/announcements';
import { parseAttachments } from '$lib/attachments';

export async function load({ params }) {
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
