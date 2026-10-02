import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/permissions';

export async function load({ locals }) {
	requireAdmin(locals);
	// 모든 지원서 정보를 불러옵니다.
	const applications = await db.query.application.findMany();
	return { applications };
}
