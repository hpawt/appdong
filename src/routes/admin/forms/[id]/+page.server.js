import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customForm } from '$lib/server/db/schema';
import { formView } from '$lib/server/forms';
import { requireAdmin } from '$lib/server/permissions';
import { boundedFormData, readDefinition, inputFailure } from '$lib/server/modu-validation';
export async function load({ params, locals }) {
	requireAdmin(locals);
	const form = await db.query.customForm.findFirst({ where: eq(customForm.id, params.id) });
	if (!form) error(404, '폼을 찾을 수 없습니다.');
	return { definition: formView(form) };
}
export const actions = {
	save: async ({ request, params, locals }) => {
		requireAdmin(locals);
		try {
			const fields = await boundedFormData(request);
			const definition = readDefinition(fields);
			await db.transaction(async (tx) => {
				const [row] = await tx
					.select()
					.from(customForm)
					.where(eq(customForm.id, params.id))
					.for('update');
				if (!row) error(404, '폼을 찾을 수 없습니다.');
				if (row.version !== fields.get('version'))
					error(409, '다른 곳에서 폼이 수정되었습니다. 새로고침 후 다시 편집해주세요.');
				await tx
					.update(customForm)
					.set({ ...definition, version: crypto.randomUUID(), updatedAt: new Date() })
					.where(eq(customForm.id, params.id));
			});
		} catch (cause) {
			return inputFailure(cause);
		}
		redirect(303, '/admin/forms/' + params.id + '?saved=1');
	},
	delete: async ({ params, locals }) => {
		requireAdmin(locals);
		const deleted = await db
			.delete(customForm)
			.where(eq(customForm.id, params.id))
			.returning({ id: customForm.id });
		if (!deleted.length) error(404, '폼을 찾을 수 없습니다.');
		redirect(303, '/admin/forms');
	}
};
