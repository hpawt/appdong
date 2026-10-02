import { count } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/permissions';
import {
	user as userTable,
	application as appTable,
	announcement as annTable
} from '$lib/server/db/schema';

export async function load({ locals }) {
	requireAdmin(locals);
	const [userCountResult] = await db.select({ value: count() }).from(userTable);
	const [appCountResult] = await db.select({ value: count() }).from(appTable);
	// 👇 총 공지사항 수를 계산합니다.
	const [annCountResult] = await db.select({ value: count() }).from(annTable);

	const recentUsers = await db.query.user.findMany({
		limit: 5,
		orderBy: (users, { desc }) => [desc(users.id)],
		columns: { id: true, username: true, name: true }
	});

	const recentApps = await db.query.application.findMany({
		limit: 5,
		orderBy: (apps, { desc }) => [desc(apps.submittedAt)]
	});

	// 👇 최근 공지사항 5개를 가져옵니다.
	const recentAnns = await db.query.announcement.findMany({
		limit: 5,
		orderBy: (anns, { desc }) => [desc(anns.createdAt)]
	});

	return {
		stats: {
			totalUsers: userCountResult.value,
			totalApps: appCountResult.value,
			totalAnns: annCountResult.value // 👇 추가
		},
		recentUsers,
		recentApps,
		recentAnns // 👇 추가
	};
}
