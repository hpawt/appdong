import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/passwords';
import { readText } from '$lib/server/validation';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';

export const actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const username = readText(form, 'username', { max: 255 });
		const password = readText(form, 'password', { trim: false, max: 255 });
		if (!username || !password)
			return fail(400, { message: '아이디와 비밀번호를 모두 입력해주세요.' });
		let existingUser;
		try {
			[existingUser] = await db.select().from(userTable).where(eq(userTable.username, username));
		} catch {
			return fail(503, {
				message: '로그인 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
			});
		}
		if (!existingUser || !(await verifyPassword(existingUser.hashed_password, password)))
			return fail(400, { message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
		const token = generateSessionToken();
		const session = await createSession(token, existingUser.id);
		setSessionTokenCookie(event, token, session.expiresAt);
		redirect(303, '/');
	}
};
