import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { application as appTable } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';

export async function load({ params, locals }) {
	requireAdmin(locals);
	const [application] = await db.select().from(appTable).where(eq(appTable.id, params.id));
	if (!application) error(404, '지원서를 찾을 수 없습니다.');
	return { application };
}

export const actions = {
	deleteApplication: async ({ params, locals }) => {
		requireAdmin(locals);
		const deleted = await db
			.delete(appTable)
			.where(eq(appTable.id, params.id))
			.returning({ id: appTable.id });
		if (!deleted.length) error(404, '삭제할 지원서를 찾을 수 없습니다.');
		redirect(303, '/admin/applications');
	}
};
