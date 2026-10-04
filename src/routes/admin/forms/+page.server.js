import { count, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { customForm, formResponse } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';
export async function load({ locals }) {
	requireAdmin(locals);
	const [forms, counts] = await Promise.all([
		db
			.select({
				id: customForm.id,
				title: customForm.title,
				published: customForm.published,
				accepting: customForm.accepting
			})
			.from(customForm)
			.orderBy(desc(customForm.updatedAt)),
		db
			.select({ formId: formResponse.formId, value: count() })
			.from(formResponse)
			.groupBy(formResponse.formId)
	]);
	const byForm = new Map(counts.map((row) => [row.formId, row.value]));
	return { forms: forms.map((form) => ({ ...form, responseCount: byForm.get(form.id) || 0 })) };
}
