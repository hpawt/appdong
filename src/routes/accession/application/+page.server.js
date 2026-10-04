import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { application as appTable, user as userTable } from '$lib/server/db/schema';
import { readText, readChoices } from '$lib/server/validation';
import { siteFeatures } from '$lib/site-features';

export async function load({ locals }) {
	if (!siteFeatures.recruitment || !locals.user)
		return {
			recruitmentOpen: siteFeatures.recruitment,
			user: locals.user ?? null,
			alreadySubmitted: false,
			userData: null
		};
	const user = locals.user;
	const existingApplication = await db.query.application.findFirst({
		where: eq(appTable.userId, user.id)
	});
	const userData = await db.query.user.findFirst({
		where: eq(userTable.id, user.id),
		columns: { name: true, phone_number: true, department: true, student_id: true }
	});
	return {
		recruitmentOpen: true,
		user,
		alreadySubmitted: !!existingApplication,
		userData: userData ?? null
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		if (!siteFeatures.recruitment)
			return fail(403, { message: '현재는 모집 기간이 아닙니다. 지원서 접수가 종료되었습니다.' });
		const form = await request.formData();
		const fullName = readText(form, 'fullName', { max: 255 });
		const phoneNumber = readText(form, 'phoneNumber', { max: 11 });
		const university = readText(form, 'university', { max: 255 });
		const department = readText(form, 'department', { max: 255 });
		const studentId = readText(form, 'studentId', { max: 20 });
		const motivation = readText(form, 'motivation');
		const programmingExperience = readText(form, 'programmingExperience', { max: 50 });
		const githubExperience = readText(form, 'githubExperience', { max: 1 });
		const activityChoice = readText(form, 'activityChoice', { max: 255 });
		if (
			!fullName ||
			!university ||
			!department ||
			!studentId ||
			!motivation ||
			!/^\d{11}$/.test(phoneNumber)
		)
			return fail(400, { message: '필수 항목과 전화번호를 확인해주세요.' });
		if (
			!['거의 없음', '보통', '숙련자'].includes(programmingExperience) ||
			!['유', '무'].includes(githubExperience) ||
			!['Vibe 클래스', '스터디', '부트캠프 (일반)', '부트캠프 (멘토)'].includes(activityChoice)
		)
			return fail(400, { message: '경험과 참가 활동을 올바르게 선택해주세요.' });
		const studySubjects = readChoices(form, 'studySubjects', [
			'JavaScript',
			'Python',
			'Java',
			'C/C++',
			'Go'
		]);
		const memberLangs = readChoices(form, 'bootcampMemberLangs', [
			'JavaScript',
			'Python',
			'Java',
			'기타'
		]);
		const mentorLangs = readChoices(form, 'bootcampMentorLangs', [
			'JavaScript',
			'Python',
			'Java',
			'Swift',
			'Kotlin',
			'기타'
		]);
		const user = locals.user;
		try {
			await db.transaction(async (tx) => {
				if (user) {
					// 같은 계정의 동시 제출은 사용자 행 잠금으로 직렬화합니다.
					await tx
						.select({ id: userTable.id })
						.from(userTable)
						.where(eq(userTable.id, user.id))
						.for('update');
					const [existing] = await tx
						.select({ id: appTable.id })
						.from(appTable)
						.where(eq(appTable.userId, user.id));
					if (existing) throw new Error('ALREADY_SUBMITTED');
				}
				await tx.insert(appTable).values({
					id: `app_${crypto.randomUUID()}`,
					userId: user?.id ?? null,
					fullName,
					phoneNumber,
					university,
					department,
					studentId,
					motivation,
					programmingExperience,
					githubExperience: /** @type {'유' | '무'} */ (githubExperience),
					activityChoice,
					studySubjects: JSON.stringify(studySubjects),
					bootcampMemberLangs: JSON.stringify(memberLangs),
					bootcampMentorLangs: JSON.stringify(mentorLangs),
					vibeServiceIdea: readText(form, 'vibeServiceIdea'),
					bootcampProjectIdea: readText(form, 'bootcampProjectIdea'),
					bootcampMemberLangsOther: readText(form, 'bootcampMemberLangsOther', { max: 255 }),
					bootcampMentorLangsOther: readText(form, 'bootcampMentorLangsOther', { max: 255 }),
					mentorAvailableTime: readText(form, 'mentorAvailableTime'),
					mentorExperience: readText(form, 'mentorExperience'),
					knownFields: readText(form, 'knownFields'),
					specificExperience: readText(form, 'specificExperience'),
					finalWords: readText(form, 'finalWords')
				});
			});
		} catch (cause) {
			if (cause instanceof Error && cause.message === 'ALREADY_SUBMITTED')
				return fail(403, { message: '이미 지원서를 제출했습니다.' });
			if (cause && typeof cause === 'object' && 'status' in cause) throw cause;
			return fail(503, { message: '지원서 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' });
		}
		return { success: true };
	}
};
