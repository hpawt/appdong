import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customForm, formResponse } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';
import { responseView, responsesCsv } from '$lib/server/forms';
export async function GET({ params, locals }) {
	requireAdmin(locals);
	const definition = await db.query.customForm.findFirst({
		where: eq(customForm.id, params.id),
		columns: { id: true }
	});
	if (!definition) error(404, '폼을 찾을 수 없습니다.');
	const responses = await db
		.select()
		.from(formResponse)
		.where(eq(formResponse.formId, params.id))
		.orderBy(desc(formResponse.submittedAt));
	return new Response(responsesCsv(responses.map(responseView)), {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="responses-${definition.id}.csv"`,
			'cache-control': 'no-store',
			'x-content-type-options': 'nosniff'
		}
	});
}
