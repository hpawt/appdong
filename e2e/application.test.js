import { expect, test } from '@playwright/test';

test('public pages render without errors and recruitment stays closed', async ({ page }) => {
	/** @type {string[]} */ const errors = [];
	page.on('pageerror', (error) => errors.push(error.message));
	for (const path of [
		'/',
		'/about-us',
		'/about-us/members',
		'/accession',
		'/announce',
		'/login',
		'/signup',
		'/forgot-password'
	]) {
		await page.goto(path);
		await expect(page.locator('main')).toBeVisible();
	}
	await page.goto('/accession/application');
	await expect(page.getByRole('heading', { name: '현재는 모집 기간이 아닙니다' })).toBeVisible();
	await expect(page.locator('main form')).toHaveCount(0);
	await page.screenshot({
		path: '.svelte-kit/screenshots/application-desktop.png',
		fullPage: true
	});
	expect(errors).toEqual([]);
});

test('mobile menu closes on escape and route changes', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.getByRole('button', { name: '메뉴 열기/닫기' }).click();
	await expect(page.locator('.mobile-nav')).toHaveClass(/is-open/);
	await page.keyboard.press('Escape');
	await expect(page.locator('.mobile-nav')).not.toHaveClass(/is-open/);
	await page.getByRole('button', { name: '메뉴 열기/닫기' }).click();
	await page.locator('.mobile-nav').getByRole('link', { name: '동아리 소개', exact: true }).click();
	await expect(page).toHaveURL(/\/about-us$/);
	await expect(page.locator('.mobile-nav')).not.toHaveClass(/is-open/);
	await expect
		.poll(() => page.locator('.mobile-nav').evaluate((node) => node.getBoundingClientRect().left))
		.toBeGreaterThanOrEqual(389);
	await page.screenshot({ path: '.svelte-kit/screenshots/mobile.png', fullPage: true });
});

test('direct admin actions, upload and legacy password reset reject anonymous requests', async ({
	request
}) => {
	for (const path of [
		'/admin/users/target?/updateUser',
		'/admin/users/target?/resetPassword',
		'/admin/users/target?/deleteUser',
		'/admin/applications/target?/deleteApplication',
		'/admin/announcements/target/edit?/delete',
		'/api/upload',
		'/forgot-password?/resetPassword'
	]) {
		const response = await request.post(path, {
			headers: { origin: 'http://127.0.0.1:4173', accept: 'application/json' },
			form: { role: 'ADMIN', userId: 'target', password: 'password' }
		});
		if (path.startsWith('/forgot-password')) expect((await response.json()).status).toBe(403);
		else expect(response.status()).toBe(403);
	}
	const redirect = await request.get('/%61dmin/users', { maxRedirects: 0 });
	expect(redirect.status()).toBe(303);
	expect(redirect.headers().location).toBe('/login');
});

test('registration validation shows feedback without accessing the DB', async ({ page }) => {
	await page.goto('/signup');
	const values = {
		username: 'ab',
		name: '홍길동',
		student_id: '2026000001',
		department: '컴퓨터학부',
		phone1: '010',
		phone2: '1234',
		phone3: '5678',
		password: 'password',
		confirm_password: 'password'
	};
	for (const [key, value] of Object.entries(values))
		await page.locator(`[name=${key}]`).fill(value);
	await page.getByRole('button', { name: '가입하기', exact: true }).click();
	await expect(page.getByText('아이디는 3글자 이상이어야 합니다.')).toBeVisible();
});
