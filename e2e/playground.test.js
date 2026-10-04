import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const backupEvent = {
	id: 'local-backup',
	title: '복원 행사',
	description: '활동 안내',
	location: '동아리방',
	startDate: '2026-10-01',
	endDate: '2026-10-02',
	time: '',
	category: 'event',
	pinned: true
};
const backup = JSON.stringify({ version: 1, events: [backupEvent], definition: null });

test('DB-free calendar creates, searches, exports, edits and deletes without server submissions', async ({
	page
}) => {
	const posts = [];
	page.on('request', (request) => {
		if (request.method() === 'POST') posts.push(request.url());
	});
	await page.goto('/playground');
	await expect(page.getByRole('heading', { name: '일정·설문 체험', exact: true })).toBeVisible();
	await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
	await page.getByLabel('일정 제목', { exact: true }).fill('동아리 모임');
	await page.getByLabel('시작일', { exact: true }).fill('2026-10-01');
	await page.getByLabel('종료일', { exact: true }).fill('2026-10-02');
	await page.getByLabel('장소', { exact: true }).fill('동아리방');
	await page.getByLabel('일정 종류', { exact: true }).first().selectOption('meeting');
	await page.getByRole('button', { name: '일정 등록', exact: true }).click();
	await expect(page.getByLabel('일정 제목', { exact: true })).toHaveValue('');
	await page.getByRole('button', { name: '목록 보기', exact: true }).click();
	await expect(page.locator('.calendar')).toContainText('동아리 모임');
	await page.getByLabel('일정 검색').fill('없는 일정');
	await expect(
		page.getByRole('button', { name: '현재 목록 내보내기 (.ics)', exact: true })
	).toBeDisabled();
	await page.getByLabel('일정 검색').fill('모임 동아리방');
	await page.getByLabel('일정 종류 필터', { exact: true }).selectOption('event');
	await expect(
		page.getByRole('button', { name: '현재 목록 내보내기 (.ics)', exact: true })
	).toBeDisabled();
	await page.getByLabel('일정 종류 필터', { exact: true }).selectOption('meeting');
	const exportPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: '현재 목록 내보내기 (.ics)', exact: true }).click();
	const exported = await exportPromise;
	const ics = await readFile(await exported.path(), 'utf8');
	expect(ics).toContain('DTEND;VALUE=DATE:20261003');
	expect(ics).toContain('SUMMARY:동아리 모임');
	await page.locator('.calendar .event-row').click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: '일정 수정·삭제', exact: true })
		.click();
	await expect(page.getByLabel('일정 제목', { exact: true })).toHaveValue('동아리 모임');
	await page.getByLabel('일정 제목', { exact: true }).fill('수정 모임');
	await page.getByRole('button', { name: '일정 수정 반영', exact: true }).click();
	await expect(page.locator('.calendar')).toContainText('수정 모임');
	const jsonPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: /백업 다운로드/ }).click();
	const json = JSON.parse(await readFile(await (await jsonPromise).path(), 'utf8'));
	expect(json.events).toHaveLength(1);
	expect(json.definition).toBeNull();
	await page.locator('.calendar .event-row').click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: '일정 수정·삭제', exact: true })
		.click();
	page.once('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: /일정 완전히 삭제/ }).click();
	await expect(page.getByRole('button', { name: /백업 다운로드/ })).toBeDisabled();
	expect(posts).toEqual([]);
});

test('local survey validates required checkbox responses and exports design without response data', async ({
	page
}) => {
	const posts = [];
	page.on('request', (request) => {
		if (request.method() === 'POST') posts.push(request.url());
	});
	await page.goto('/playground');
	await page.getByLabel('폼 제목', { exact: true }).fill('모임 신청');
	await page.getByRole('button', { name: '+ 질문 추가', exact: true }).click();
	const second = page.getByRole('region', { name: '질문 2 편집' });
	await second.getByLabel('질문 제목', { exact: true }).fill('참여 시간');
	await second.getByLabel('질문 유형').selectOption('checkbox');
	await second.getByLabel('선택지', { exact: false }).fill('오전\n오후');
	await second.getByLabel('필수 질문').check();
	await page.getByRole('button', { name: '설문 디자인 임시 적용', exact: true }).click();
	const trial = page.locator('.trial-form');
	await trial.getByLabel('이름', { exact: true }).fill('답변 개인정보');
	await trial.getByRole('button', { name: '응답 테스트 실행', exact: true }).click();
	await expect(trial.getByRole('alert')).toContainText('참여 시간');
	await trial.getByLabel('오전', { exact: true }).check();
	await trial.getByRole('button', { name: '응답 테스트 실행', exact: true }).click();
	await expect(trial.getByRole('status')).toContainText('로컬 검증을 통과');
	await expect(trial.getByLabel('이름', { exact: true })).toHaveValue('');
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: /백업 다운로드/ }).click();
	const raw = await readFile(await (await downloadPromise).path(), 'utf8');
	const json = JSON.parse(raw);
	expect(json.definition.questions[1]).toMatchObject({
		type: 'checkbox',
		options: ['오전', '오후'],
		required: true
	});
	expect(raw).not.toContain('답변 개인정보');
	await page.getByLabel('폼 제목', { exact: true }).fill('미적용 초안');
	page.once('dialog', (dialog) => dialog.accept());
	await page
		.getByLabel(/백업 가져오기/)
		.setInputFiles({ name: 'survey.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
	await expect(page.getByLabel('폼 제목', { exact: true })).toHaveValue('모임 신청');
	await expect(trial.getByLabel('오전', { exact: true })).toBeVisible();
	expect(posts).toEqual([]);
});

test('unsaved edits warn on departure and the event limit preserves existing work', async ({
	page
}) => {
	await page.goto('/playground');
	await page.getByLabel('일정 제목', { exact: true }).fill('미등록 초안');
	page.once('dialog', (dialog) => dialog.dismiss());
	await page.locator('header a[href="/"]').first().click();
	await expect(page).toHaveURL(/\/playground$/);
	await expect(page.getByLabel('일정 제목', { exact: true })).toHaveValue('미등록 초안');
	const events = Array.from({ length: 100 }, (_, index) => ({
		...backupEvent,
		id: 'local-' + index,
		pinned: false
	}));
	page.once('dialog', (dialog) => dialog.accept());
	await page.getByLabel(/백업 가져오기/).setInputFiles({
		name: 'full.json',
		mimeType: 'application/json',
		buffer: Buffer.from(JSON.stringify({ version: 1, events, definition: null }))
	});
	await page.getByLabel('일정 제목', { exact: true }).fill('추가 일정');
	await page.getByRole('button', { name: '일정 등록', exact: true }).click();
	await expect(page.locator('.editor-box').getByRole('alert')).toContainText('100개');
	await expect(page.getByLabel('일정 제목', { exact: true })).toHaveValue('추가 일정');
	page.once('dialog', (dialog) => dialog.accept());
	await page.reload();
	await expect(page.getByRole('button', { name: /백업 다운로드/ })).toBeDisabled();
	await expect(page.getByLabel('일정 제목', { exact: true })).toHaveValue('');
});

test('workspace restore is atomic, confirms replacement and works on 320px screens', async ({
	page
}) => {
	await page.goto('/playground');
	const fileInput = page.getByLabel(/백업 가져오기/);
	const upload = async (content) =>
		fileInput.setInputFiles({
			name: 'workspace.json',
			mimeType: 'application/json',
			buffer: Buffer.from(content)
		});
	await upload(backup);
	await page.getByRole('button', { name: '목록 보기', exact: true }).click();
	await expect(page.locator('.calendar')).toContainText('복원 행사');
	await upload(
		JSON.stringify({
			version: 1,
			events: [{ ...backupEvent, endDate: '2026-02-30' }],
			definition: null
		})
	);
	await expect(page.locator('.alert-banner')).toContainText('시작일과 종료일');
	await expect(page.locator('.calendar')).toContainText('복원 행사');
	await upload('x'.repeat(2_000_001));
	await expect(page.locator('.alert-banner')).toContainText('2MB');
	page.once('dialog', (dialog) => dialog.dismiss());
	await upload(JSON.stringify({ version: 1, events: [], definition: null }));
	await expect(page.locator('.calendar')).toContainText('복원 행사');
	await page.setViewportSize({ width: 320, height: 740 });
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
		.toBe(true);
	await page.screenshot({ path: '.svelte-kit/screenshots/playground-mobile.png', fullPage: true });
	page.once('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: /전체 초기화/ }).click();
	await expect(page.getByRole('button', { name: /백업 다운로드/ })).toBeDisabled();
	await expect(page.getByLabel('폼 제목', { exact: true })).toHaveValue('');
});
