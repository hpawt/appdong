import { and, count, desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customForm, formResponse } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';
import { responseView } from '$lib/server/forms';
export async function load({ params, locals, url }) {
	requireAdmin(locals);
	const pageValue = url.searchParams.get('page') || '1';
	if (!/^\d{1,6}$/.test(pageValue) || Number(pageValue) < 1)
		error(400, '페이지 번호를 확인해주세요.');
	const page = Number(pageValue);
	const definition = await db.query.customForm.findFirst({
		where: eq(customForm.id, params.id),
		columns: { id: true, title: true }
	});
	if (!definition) error(404, '폼을 찾을 수 없습니다.');
	const [rows, totals] = await Promise.all([
		db
			.select()
			.from(formResponse)
			.where(eq(formResponse.formId, params.id))
			.orderBy(desc(formResponse.submittedAt), desc(formResponse.id))
			.limit(50)
			.offset((page - 1) * 50),
		db.select({ value: count() }).from(formResponse).where(eq(formResponse.formId, params.id))
	]);
	return { definition, responses: rows.map(responseView), total: totals[0].value, page };
}
export const actions = {
	delete: async ({ request, params, locals }) => {
		requireAdmin(locals);
		const id = (await request.formData()).get('responseId');
		if (typeof id !== 'string' || id.length > 36) error(400, '응답 ID를 확인해주세요.');
		const rows = await db
			.delete(formResponse)
			.where(and(eq(formResponse.id, id), eq(formResponse.formId, params.id)))
			.returning({ id: formResponse.id });
		if (!rows.length) error(404, '응답을 찾을 수 없습니다.');
		return { success: true, message: '응답을 삭제했습니다.' };
	}
};
