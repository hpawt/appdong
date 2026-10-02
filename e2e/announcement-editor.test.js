import { expect, test } from '@playwright/test';

test('shared editor loads existing content and synchronizes edits and attachments', async ({
	page
}) => {
	await page.goto('http://127.0.0.1:4180/?edit');
	await expect(page.locator('.ql-editor')).toContainText('기존 내용');
	await expect(page.getByLabel('제목', { exact: true })).toHaveValue('기존 공지');
	await page.locator('.ql-editor').fill('수정한 내용');
	await expect(page.locator('[name=content]')).toHaveValue(/수정한 내용/);
	await expect(page.locator('[name=attachments]')).toHaveValue(/기존.pdf/);
	await page.getByRole('button', { name: '삭제', exact: true }).click();
	await expect(page.locator('[name=attachments]')).toHaveValue('[]');
	await page.screenshot({ path: '.svelte-kit/screenshots/editor.png', fullPage: true });
});

test('upload errors are visible and successful uploads update the form', async ({ page }) => {
	await page.goto('http://127.0.0.1:4180/');
	await expect(page.locator('.ql-editor')).toBeVisible();
	await page.route('**/api/upload', (route) => route.fulfill({ status: 502, body: 'failed' }));
	const file = { name: 'guide.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7') };
	await page.locator('input[type=file]').setInputFiles(file);
	await expect(page.getByRole('alert')).toContainText('업로드 실패');
	await expect(page.getByRole('button', { name: '공지 등록' })).toBeEnabled();
	await page.unroute('**/api/upload');
	await page.route('**/api/upload', (route) =>
		route.fulfill({ json: { url: 'https://example.test/new.pdf', name: 'guide.pdf' } })
	);
	await page.locator('input[type=file]').setInputFiles(file);
	await expect(page.locator('[name=attachments]')).toHaveValue(/new.pdf/);
	await expect(page.getByRole('alert')).toHaveCount(0);
});

test('pending upload blocks submission and unmount cancels work', async ({ page }) => {
	await page.goto('http://127.0.0.1:4180/');
	await expect(page.locator('.ql-editor')).toBeVisible();
	await page.route('**/api/upload', () => {});
	await page.locator('input[type=file]').setInputFiles({
		name: 'guide.pdf',
		mimeType: 'application/pdf',
		buffer: Buffer.from('%PDF-1.7')
	});
	await expect(page.getByRole('button', { name: '업로드 중...' })).toBeDisabled();
	await page.getByRole('button', { name: '편집기 종료' }).click();
	await expect(page.locator('.announcement-form')).toHaveCount(0);
});
