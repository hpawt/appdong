import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customForm } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/permissions';
import { boundedFormData, readDefinition, inputFailure } from '$lib/server/modu-validation';
export const actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		let definition;
		try {
			definition = readDefinition(await boundedFormData(request));
		} catch (cause) {
			return inputFailure(cause);
		}
		const id = crypto.randomUUID();
		await db.insert(customForm).values({ id, ...definition, version: crypto.randomUUID() });
		redirect(303, '/admin/forms/' + id);
	}
};
