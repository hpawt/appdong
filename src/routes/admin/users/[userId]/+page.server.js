import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user as userTable, session as sessionTable } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/passwords';
import { requireAdmin } from '$lib/server/permissions';
import { readText, profileError, isUniqueViolation, validPassword } from '$lib/server/validation';

export async function load({ params, locals }) {
	requireAdmin(locals);
	const user = await db.query.user.findFirst({
		where: eq(userTable.id, params.userId),
		columns: { hashed_password: false }
	});
	if (!user) error(404, '사용자를 찾을 수 없습니다.');
	return { user };
}

export const actions = {
	resetPassword: async ({ request, params, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const password = readText(form, 'password', { trim: false, max: 255 });
		const confirmation = readText(form, 'confirm_password', { trim: false, max: 255 });
		if (!validPassword(password) || password !== confirmation)
			return fail(400, { message: '새 비밀번호와 확인을 6~255글자로 동일하게 입력해주세요.' });
		const hashed_password = await hashPassword(password);
		await db.transaction(async (tx) => {
			const updated = await tx
				.update(userTable)
				.set({ hashed_password })
				.where(eq(userTable.id, params.userId))
				.returning({ id: userTable.id });
			if (!updated.length) error(404, '사용자를 찾을 수 없습니다.');
			await tx.delete(sessionTable).where(eq(sessionTable.userId, params.userId));
		});
		return {
			success: true,
			message: '비밀번호를 재설정하고 해당 회원의 모든 세션을 종료했습니다.'
		};
	},
	updateUser: async ({ request, params, locals }) => {
		const admin = requireAdmin(locals);
		const form = await request.formData();
		const profile = {
			name: readText(form, 'name', { max: 255 }),
			department: readText(form, 'department', { max: 255 }),
			phone_number: readText(form, 'phone_number', { max: 11 })
		};
		const student_id = readText(form, 'student_id', { max: 10 });
		const role = readText(form, 'role', { max: 5 });
		const message =
			profileError(profile) ||
			(!/^\d{10}$/.test(student_id)
				? '학번은 숫자 10자리로 입력해주세요.'
				: !['USER', 'ADMIN'].includes(role)
					? '역할이 올바르지 않습니다.'
					: null);
		if (message) return fail(400, { message });
		if (params.userId === admin.id && role !== 'ADMIN')
			return fail(400, { message: '자신의 관리자 권한은 해제할 수 없습니다.' });
		let updated;
		try {
			updated = await db
				.update(userTable)
				.set({ ...profile, student_id, role: /** @type {'USER' | 'ADMIN'} */ (role) })
				.where(eq(userTable.id, params.userId))
				.returning({ id: userTable.id });
		} catch (cause) {
			return fail(isUniqueViolation(cause) ? 400 : 500, {
				message: isUniqueViolation(cause)
					? '이미 등록된 학번 또는 전화번호입니다.'
					: '회원 정보 수정에 실패했습니다.'
			});
		}
		if (!updated.length) error(404, '사용자를 찾을 수 없습니다.');
		return { success: true, message: '성공적으로 수정되었습니다.' };
	},
	deleteUser: async ({ params, locals }) => {
		const admin = requireAdmin(locals);
		if (params.userId === admin.id)
			return fail(400, { message: '현재 로그인한 관리자 계정은 삭제할 수 없습니다.' });
		const deleted = await db
			.delete(userTable)
			.where(eq(userTable.id, params.userId))
			.returning({ id: userTable.id });
		if (!deleted.length) error(404, '삭제할 사용자를 찾을 수 없습니다.');
		redirect(303, '/admin/users');
	}
};
