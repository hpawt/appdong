import { expect, test } from '@playwright/test';

test('closed recruitment cannot be submitted through a direct request and menus hide unready features', async ({
	page,
	request
}) => {
	await page.goto('/');
	await expect(
		page.locator(
			'a[href="/accession"], a[href="/accession/application"], a[href="/calendar"], a[href="/forms"]'
		)
	).toHaveCount(0);
	await expect(page.getByRole('link', { name: '동아리 알아보기', exact: true })).toBeVisible();
	const response = await request.post('/accession/application', {
		headers: { origin: 'http://127.0.0.1:4173', accept: 'application/json' },
		form: { fullName: '우회 제출' }
	});
	expect((await response.json()).status).toBe(403);
	await page.goto('/accession');
	await expect(page.getByRole('heading', { name: '현재는 모집 기간이 아닙니다' })).toBeVisible();
	await expect(page.getByText('2025-2학기', { exact: false })).toHaveCount(0);
});

test('mobile pages fit 320px and menu keeps keyboard focus inside until Escape', async ({
	page
}) => {
	await page.setViewportSize({ width: 320, height: 780 });
	for (const path of [
		'/',
		'/about-us',
		'/about-us/members',
		'/login',
		'/signup',
		'/accession/application'
	]) {
		await page.goto(path);
		const outside = await page
			.locator('main h1, main h2, main input, main textarea, .hero-section, .auth-container')
			.evaluateAll((elements) =>
				elements
					.filter((element) => {
						const box = element.getBoundingClientRect();
						return box.width > 0 && (box.left < -0.5 || box.right > window.innerWidth + 0.5);
					})
					.map((element) => element.tagName)
			);
		expect(outside).toEqual([]);
		if (path !== '/')
			await page.screenshot({
				path: `.svelte-kit/screenshots/improved-${path === '/accession/application' ? 'closed' : path.slice(1)}-320.png`,
				fullPage: true
			});
	}
	for (const width of [390, 768, 820, 1024, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto('/');
		const fits = await page
			.locator('.text-content')
			.evaluate((node) => node.scrollWidth <= node.clientWidth + 1);
		expect(fits, `Home heading fits ${width}px`).toBe(true);
	}
	await page.setViewportSize({ width: 320, height: 780 });
	await page.goto('/');
	const toggle = page.getByRole('button', { name: '메뉴 열기/닫기' });
	await toggle.click();
	await expect(page.locator('.mobile-nav a').first()).toBeFocused();
	await page.keyboard.press('Shift+Tab');
	await expect(toggle).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.locator('.mobile-nav a').first()).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(toggle).toBeFocused();
	await expect(page.locator('.mobile-nav')).toHaveAttribute('inert', '');
	await page.screenshot({ path: '.svelte-kit/screenshots/improved-home-320.png', fullPage: true });
});

test('sharing metadata follows client navigation, strips queries, and optimized illustration loads', async ({
	page
}) => {
	await page.goto('/');
	await expect
		.poll(() =>
			page.locator('.graphic-content img').evaluate((node) => new URL(node.currentSrc).pathname)
		)
		.toBe('/optimized/apdomk.webp');
	await expect
		.poll(() => page.locator('.graphic-content img').evaluate((node) => node.naturalWidth))
		.toBeGreaterThan(0);
	await page.getByRole('link', { name: '동아리 알아보기', exact: true }).click();
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
		'content',
		'동아리 소개 · APPDONG'
	);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://www.appdong.com/about-us'
	);
	await page.goto('/login?message=password_updated');
	await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
		'content',
		'https://www.appdong.com/login'
	);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
	await page.goto('/about-us/members');
	for (const photo of await page.locator('.member-photo picture:has(source) img').all()) {
		await photo.scrollIntoViewIfNeeded();
		await expect.poll(() => photo.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
		await expect
			.poll(() => photo.evaluate((node) => new URL(node.currentSrc).pathname.endsWith('.webp')))
			.toBe(true);
	}
	await page.screenshot({ path: '.svelte-kit/screenshots/improved-members.png', fullPage: true });
});

test('announcement content keeps rich text formatting after styles leave the global bundle', async ({
	page
}) => {
	await page.goto('http://127.0.0.1:4180/?component=announcement');
	await expect(page.getByText('오른쪽 정렬', { exact: true })).toHaveCSS('text-align', 'right');
	const sizes = await page.locator('.ql-size-large').evaluate((node) => ({
		large: parseFloat(getComputedStyle(node).fontSize),
		normal: parseFloat(getComputedStyle(node.parentElement).fontSize)
	}));
	expect(sizes.large).toBeGreaterThan(sizes.normal);
	expect(
		await page
			.getByText('목록 항목', { exact: true })
			.evaluate((node) => getComputedStyle(node, '::before').content)
	).toContain('•');
});

test('login shows pending state, rejects another submission, preserves input, then focuses the error', async ({
	page
}) => {
	await page.goto('/login');
	let submissions = 0;
	let release;
	const gate = new Promise((resolve) => (release = resolve));
	await page.route('**/login', async (route) => {
		if (route.request().method() !== 'POST') return route.continue();
		submissions++;
		await gate;
		await route.continue();
	});
	await page.getByLabel('아이디', { exact: true }).fill('test-user');
	await page.getByLabel('비밀번호', { exact: true }).fill('test-password');
	await page.getByRole('button', { name: '로그인', exact: true }).click();
	await expect(page.getByRole('button', { name: '처리 중…' })).toBeDisabled();
	await page.locator('main form').evaluate((node) => node.requestSubmit());
	release();
	await expect(page.getByRole('alert')).toContainText('로그인 서비스를 사용할 수 없습니다');
	await expect(page.getByRole('alert')).toBeFocused();
	await expect(page.getByLabel('아이디', { exact: true })).toHaveValue('test-user');
	await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeEnabled();
	expect(submissions).toBe(1);
});

test('future recruitment editor saves long answers only with consent, restores explicitly, and clears after submitting', async ({
	page
}) => {
	const url = 'http://127.0.0.1:4180/?component=application';
	await page.goto(url);
	await page.getByLabel('성명', { exact: true }).fill('개인정보');
	await page.getByLabel('지원 동기', { exact: true }).fill('보관할 긴 답변');
	expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
	await page.getByLabel('긴 답변을 이 탭에 임시 저장').check();
	let saved = await page.evaluate(() =>
		JSON.parse(sessionStorage.getItem('appdong:application:guest'))
	);
	expect(saved.answers.motivation).toBe('보관할 긴 답변');
	expect(saved.answers).not.toHaveProperty('fullName');
	page.once('dialog', (dialog) => dialog.accept());
	await page.reload();
	await expect(page.getByLabel('지원 동기', { exact: true })).toHaveValue('');
	await page.getByRole('button', { name: '저장한 답변 복원' }).click();
	await expect(page.getByLabel('지원 동기', { exact: true })).toHaveValue('보관할 긴 답변');
	await page.getByRole('button', { name: 'English', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Application Form' })).toBeVisible();
	for (const [name, value] of Object.entries({
		fullName: '홍길동',
		phoneNumber: '01012345678',
		university: '경북대학교',
		department: '컴퓨터학부',
		studentId: '2026000001'
	}))
		await page.locator(`[name="${name}"]`).fill(value);
	await page.locator('[name="programmingExperience"]').selectOption('거의 없음');
	await page
		.locator('.radio-group label')
		.filter({ has: page.locator('[name="githubExperience"][value="무"]') })
		.click();
	await page.locator('[name="activityChoice"]').selectOption('스터디');
	await page.getByRole('button', { name: 'Submit', exact: true }).click();
	await expect
		.poll(() => page.evaluate(() => sessionStorage.getItem('appdong:application:guest')))
		.toBeNull();
	await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
});

test('draft expiry, unavailable storage and cancelling navigation keep the future editor usable', async ({
	page
}) => {
	await page.addInitScript(() =>
		sessionStorage.setItem(
			'appdong:application:guest',
			JSON.stringify({ savedAt: Date.now() - 86400001, answers: { motivation: '만료된 답변' } })
		)
	);
	await page.goto('http://127.0.0.1:4180/?component=application');
	await page.getByRole('button', { name: '저장한 답변 복원' }).click();
	await expect(page.getByLabel('지원 동기', { exact: true })).toHaveValue('');
	expect(await page.evaluate(() => sessionStorage.getItem('appdong:application:guest'))).toBeNull();
	await page.evaluate(() =>
		Object.defineProperty(Storage.prototype, 'setItem', {
			value() {
				throw new Error('Storage unavailable');
			}
		})
	);
	await page.getByLabel('긴 답변을 이 탭에 임시 저장').check();
	await expect(page.locator('[data-draft-status]')).toContainText('임시 저장을 사용할 수 없습니다');
	await page.getByLabel('지원 동기', { exact: true }).fill('저장 없이도 작성 가능');
	page.once('dialog', (dialog) => dialog.dismiss());
	expect(
		await page.evaluate(() => {
			let cancelled = false;
			window.fixtureBeforeNavigate({
				cancel() {
					cancelled = true;
				}
			});
			return cancelled;
		})
	).toBe(true);
	await page.getByRole('button', { name: '제출하기', exact: true }).click();
	await expect(page.getByLabel('성명', { exact: true })).toBeFocused();
	await expect(page.locator('form')).not.toHaveAttribute('aria-busy', 'true');
});
