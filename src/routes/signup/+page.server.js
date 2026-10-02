import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/passwords';
import { readText, profileError, validPassword, isUniqueViolation } from '$lib/server/validation';

export const actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const username = readText(form, 'username', { max: 255 });
		const student_id = readText(form, 'student_id', { max: 10 });
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
			username.length < 3
				? '아이디는 3글자 이상이어야 합니다.'
				: !/^\d{10}$/.test(student_id)
					? '학번은 숫자 10자리로 입력해주세요.'
					: profileError(profile) ||
						(!validPassword(password)
							? '비밀번호는 6~255글자로 입력해주세요.'
							: password !== confirmation
								? '비밀번호가 일치하지 않습니다.'
								: null);
		if (message) return fail(400, { message });
		try {
			await db.insert(userTable).values({
				id: `user_${crypto.randomUUID()}`,
				username,
				student_id,
				...profile,
				hashed_password: await hashPassword(password),
				role: 'USER'
			});
		} catch (cause) {
			return fail(isUniqueViolation(cause) ? 400 : 500, {
				message: isUniqueViolation(cause)
					? '이미 등록된 아이디, 학번 또는 전화번호입니다.'
					: '회원가입을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.'
			});
		}
		return { success: true, message: '회원가입에 성공했습니다! 잠시 후 홈페이지로 이동합니다.' };
	}
};
