import { expect, test } from '@playwright/test';

test('form builder changes types/options, reorders, previews and saves outside preview fields', async ({
	page
}) => {
	const errors = [];
	page.on('pageerror', (cause) => errors.push(cause.message));
	await page.goto('http://127.0.0.1:4180/?component=builder');
	await page.getByLabel('폼 제목', { exact: true }).fill('가을 모임 신청');
	await page.getByLabel('폼 설명').fill('함께 참여해주세요.');
	await page.getByLabel('링크로 공개').check();
	await page.getByRole('button', { name: '+ 질문 추가', exact: true }).click();
	const second = page.getByRole('region', { name: '질문 2 편집' });
	await second.getByLabel('질문 제목', { exact: true }).fill('참여 시간');
	await second.getByLabel('질문 유형').selectOption('checkbox');
	await expect(second.getByLabel('선택지', { exact: false })).toHaveValue('선택지 1\n선택지 2');
	await second.getByLabel('선택지', { exact: false }).fill('오전\n오후');
	await second.getByLabel('필수 질문').check();
	await page.getByRole('button', { name: '질문 2 위로', exact: true }).click();
	const hidden = page.locator('[name=definition]');
	await expect(hidden).toHaveValue(/"title":"참여 시간"/);
	await page.getByRole('button', { name: '미리보기', exact: true }).click();
	await expect(page.getByText('미리보기 응답은 저장되지 않습니다.')).toBeVisible();
	await page.getByRole('button', { name: '저장', exact: true }).click();
	const serialized = await page.evaluate(() => window.fixtureSubmitted?.definition);
	const submitted = JSON.parse(serialized);
	expect(submitted.questions[0]).toMatchObject({
		title: '참여 시간',
		type: 'checkbox',
		options: ['오전', '오후'],
		required: true
	});
	expect(submitted.published).toBe(true);
	await expect(page.getByRole('button', { name: '저장', exact: true })).toBeEnabled();
	await page.setViewportSize({ width: 390, height: 844 });
	await page.getByLabel('폼 제목', { exact: true }).scrollIntoViewIfNeeded();
	await expect(page.getByLabel('폼 제목', { exact: true })).toBeInViewport();
	await page.screenshot({ path: '.svelte-kit/screenshots/modu-form-builder.png', fullPage: true });
	expect(errors).toEqual([]);
});

test('calendar covers month-spanning events, day selection, list, detail and month navigation', async ({
	page
}) => {
	await page.goto('http://127.0.0.1:4180/?component=calendar');
	await expect(page.getByRole('button', { name: '2026-10-01, 일정 1개' })).toBeVisible();
	await page.getByRole('button', { name: '2026-09-30, 일정 1개' }).click();
	await expect(page.getByRole('heading', { name: '2026-09-30 · 일정 1개' })).toBeVisible();
	await page.getByRole('button', { name: '2026-10-01, 일정 1개' }).click();
	await expect(page.getByRole('heading', { name: '2026-10-01 · 일정 1개' })).toBeVisible();
	await page
		.locator('.selected-day')
		.getByRole('button', { name: /월 경계 행사/ })
		.click();
	await expect(page.getByRole('dialog')).toContainText('동아리방');
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await page.getByRole('button', { name: '목록 보기', exact: true }).click();
	await expect(page.locator('.calendar')).toContainText('2026-09-30 ~ 2026-10-02');
	await page.getByRole('button', { name: '다음 달', exact: true }).click();
	await expect
		.poll(() => page.evaluate(() => window.fixtureNavigation))
		.toBe('/admin/calendar?month=2026-11');
	await page.setViewportSize({ width: 390, height: 844 });
	await page.getByRole('button', { name: '월간 보기', exact: true }).click();
	await page.screenshot({
		path: '.svelte-kit/screenshots/modu-calendar-mobile.png',
		fullPage: true
	});
});

test('all six question types render with usable labels and response controls', async ({ page }) => {
	await page.goto('http://127.0.0.1:4180/?component=questions');
	await page.getByLabel('이름', { exact: true }).fill('김테스트');
	await page.getByLabel('이메일', { exact: true }).fill('test@example.com');
	await page.getByLabel('남길 말', { exact: true }).fill('반갑습니다');
	await page.getByLabel('현장', { exact: true }).check();
	await page.getByLabel('오전', { exact: true }).check();
	await page.getByLabel('식사', { exact: true }).selectOption('신청');
	await expect(page.locator('[name=radio]:checked')).toHaveValue('현장');
	await expect(page.locator('[name=checkbox]:checked')).toHaveValue('오전');
});

test('event editor keeps end dates valid when the start date advances and serializes the event', async ({
	page
}) => {
	await page.goto('http://127.0.0.1:4180/?component=event');
	await page.getByLabel('일정 제목', { exact: true }).fill('새 동아리 행사');
	await page.getByLabel('시작일', { exact: true }).fill('2099-10-03');
	await page.getByLabel('시작일', { exact: true }).blur();
	await expect(page.getByLabel('종료일', { exact: true })).toHaveValue('2099-10-03');
	await page.getByLabel('일정 종류', { exact: true }).selectOption('event');
	await page.getByLabel('중요한 공지로 고정').check();
	await page.getByRole('button', { name: '일정 등록', exact: true }).click();
	await expect
		.poll(() => page.evaluate(() => window.fixtureSubmitted))
		.toMatchObject({
			title: '새 동아리 행사',
			startDate: '2099-10-03',
			endDate: '2099-10-03',
			pinned: 'on',
			category: 'event'
		});
});

test('public calendar/forms show service state and every new admin entry rejects anonymous writes', async ({
	page,
	request
}) => {
	for (const path of ['/calendar', '/forms', '/forms/target']) {
		const response = await page.goto(path);
		expect(response.status()).toBe(404);
	}
	for (const path of [
		'/admin/calendar/new?/save',
		'/admin/calendar/target?/save',
		'/admin/calendar/target?/delete',
		'/admin/forms/new?/save',
		'/admin/forms/target?/save',
		'/admin/forms/target?/delete',
		'/admin/forms/target/responses?/delete'
	]) {
		const response = await request.post(path, {
			form: { role: 'ADMIN' },
			headers: { origin: 'http://127.0.0.1:4173' }
		});
		expect(response.status()).toBe(403);
	}
	const exportResponse = await request.get('/admin/forms/target/responses/export', {
		maxRedirects: 0
	});
	expect(exportResponse.status()).toBe(303);
});
