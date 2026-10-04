import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customForm } from '$lib/server/db/schema';
import { formView, submitResponse } from '$lib/server/forms';
import { boundedFormData, inputFailure } from '$lib/server/modu-validation';
export async function load({ params, locals }) {
	const form = await db.query.customForm.findFirst({ where: eq(customForm.id, params.id) });
	if (!form || (!form.published && locals.user?.role !== 'ADMIN'))
		error(404, '폼을 찾을 수 없습니다.');
	return { definition: formView(form) };
}
export const actions = {
	submit: async ({ request, params }) => {
		try {
			const fields = await boundedFormData(request);
			const version = fields.get('version');
			if (typeof version !== 'string' || version.length > 36) error(400, '폼을 새로고침해주세요.');
			return await submitResponse(db, params.id, version, fields);
		} catch (cause) {
			return inputFailure(cause);
		}
	}
};
