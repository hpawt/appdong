import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user as userTable, session as sessionTable } from '$lib/server/db/schema';
import { hashPassword, verifyPassword } from '$lib/server/passwords';
import { requireUser } from '$lib/server/permissions';
import { readText, profileError, validPassword, isUniqueViolation } from '$lib/server/validation';
import { deleteSessionTokenCookie } from '$lib/server/auth';

export async function load({ locals }) {
	const user = requireUser(locals);
	const fullUser = await db.query.user.findFirst({
		where: eq(userTable.id, user.id),
		columns: { hashed_password: false }
	});
	if (!fullUser) error(404, '사용자를 찾을 수 없습니다.');
	return { user: fullUser };
}

export const actions = {
	reauthenticate: async ({ request, locals }) => {
		const user = requireUser(locals);
		const form = await request.formData();
		const password = readText(form, 'password', { trim: false, max: 255 });
		const current = await db.query.user.findFirst({ where: eq(userTable.id, user.id) });
		if (!current || !password || !(await verifyPassword(current.hashed_password, password)))
			return fail(400, { step: 1, message: '비밀번호가 올바르지 않습니다.' });
		return { success: true, step: 2 };
	},
	updateProfile: async (event) => {
		const user = requireUser(event.locals);
		const form = await event.request.formData();
		const currentPassword = readText(form, 'current_password', { trim: false, max: 255 });
		const current = await db.query.user.findFirst({ where: eq(userTable.id, user.id) });
		if (
			!current ||
			!currentPassword ||
			!(await verifyPassword(current.hashed_password, currentPassword))
		)
			return fail(403, { step: 1, message: '현재 비밀번호를 다시 확인해주세요.' });
		const profile = {
			name: readText(form, 'name', { max: 255 }),
			department: readText(form, 'department', { max: 255 }),
			phone_number: ['phone1', 'phone2', 'phone3']
				.map((key) => readText(form, key, { max: 4 }))
				.join('')
		};
		const password = readText(form, 'password', { trim: false, max: 255 });
		const confirmation = readText(form, 'confirm_password', { trim: false, max: 255 });
		const message =
			profileError(profile) ||
			((password || confirmation) &&
				(!validPassword(password)
					? '새 비밀번호는 6~255글자로 입력해주세요.'
					: password !== confirmation
						? '새 비밀번호가 일치하지 않습니다.'
						: null));
		if (message) return fail(400, { step: 2, message });
		const updateData = {
			...profile,
			...(password ? { hashed_password: await hashPassword(password) } : {})
		};
		try {
			await db.transaction(async (tx) => {
				await tx.update(userTable).set(updateData).where(eq(userTable.id, user.id));
				if (password) await tx.delete(sessionTable).where(eq(sessionTable.userId, user.id));
				else if (event.locals.session)
					await tx.delete(sessionTable).where(eq(sessionTable.id, event.locals.session.id));
			});
		} catch (cause) {
			return fail(isUniqueViolation(cause) ? 400 : 500, {
				step: 2,
				message: isUniqueViolation(cause)
					? '이미 등록된 전화번호입니다.'
					: '정보 수정에 실패했습니다. 잠시 후 다시 시도해주세요.'
			});
		}
		deleteSessionTokenCookie(event);
		redirect(303, `/login?message=${password ? 'password_updated' : 'info_updated'}`);
	}
};
