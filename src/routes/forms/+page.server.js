import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { customForm } from '$lib/server/db/schema';
export async function load() {
	try {
		const forms = await db
			.select({
				id: customForm.id,
				title: customForm.title,
				description: customForm.description,
				accepting: customForm.accepting
			})
			.from(customForm)
			.where(eq(customForm.published, true))
			.orderBy(desc(customForm.createdAt));
		return { forms, unavailable: false };
	} catch {
		return { forms: [], unavailable: true };
	}
}
