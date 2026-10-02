import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/permissions';

export async function load({ locals }) {
	requireAdmin(locals);
	// 모든 사용자 정보를 불러오되, 비밀번호는 제외합니다.
	const users = await db.query.user.findMany({
		columns: {
			hashed_password: false
		}
	});
	return { users };
}
