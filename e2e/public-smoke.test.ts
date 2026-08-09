import { expect, test } from '@playwright/test';

test('public starter routes render with truthful navigation', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle(/Product Plate/);
	await expect(
		page.getByRole('heading', { name: /SvelteKit starter, ready to become your product/i })
	).toBeVisible();
	await expect(page.getByRole('link', { name: /Open full demo/i }).first()).toHaveAttribute(
		'href',
		'/auth/demo'
	);

	await page.goto('/components');
	await expect(page.getByRole('heading', { name: /Reusable landing sections/i })).toBeVisible();

	await page.goto('/docs');
	await expect(page.getByRole('heading', { name: /Build from a working product/i })).toBeVisible();
});

test('public routes have no horizontal overflow on a phone viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });

	for (const path of [
		'/',
		'/components',
		'/components/hero',
		'/components/features',
		'/components/proof',
		'/components/pricing',
		'/components/faq',
		'/components/cta',
		'/components/utility',
		'/components/showcase',
		'/docs',
		'/auth/demo'
	]) {
		await page.goto(path);
		const hasHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth
		);
		expect(hasHorizontalOverflow, `${path} should fit the viewport`).toBe(false);
	}
});

test('current landing component categories render bounded variants', async ({ page }) => {
	const categories = [
		{ path: '/components/hero', title: 'Hero components', variants: 2 },
		{ path: '/components/features', title: 'Features components', variants: 5 },
		{ path: '/components/proof', title: 'Proof components', variants: 2 },
		{ path: '/components/pricing', title: 'Pricing components', variants: 3 },
		{ path: '/components/faq', title: 'FAQ components', variants: 1 },
		{ path: '/components/cta', title: 'Call to action components', variants: 2 },
		{ path: '/components/utility', title: 'Utility components', variants: 4 },
		{ path: '/components/showcase', title: 'Showcase components', variants: 2 }
	] as const;

	for (const { path, title, variants } of categories) {
		await page.goto(path);
		await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();

		const previews = page.locator('section.variant');
		await expect(previews).toHaveCount(variants);
		expect(
			await previews.evaluateAll((sections) =>
				sections.every((section) => section.scrollWidth <= section.clientWidth)
			),
			`${path} variants should not overflow their gallery frames`
		).toBe(true);
	}
});

test('mobile landing navigation remains interactive', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await page.getByRole('button', { name: /open navigation/i }).click();
	await expect(page.locator('[data-slot="sheet-title"]')).toHaveText('Product Plate');
	await expect(page.getByRole('link', { name: /Components/i }).last()).toBeVisible();
});

test('waitlist controls remain touch-sized and aligned on a phone viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	const email = page.getByLabel('Email address');
	const submit = page.getByRole('button', { name: 'Join waitlist' });
	await expect(email).toBeVisible();
	await expect(submit).toBeVisible();

	const emailBox = await email.boundingBox();
	const submitBox = await submit.boundingBox();
	expect(emailBox?.height).toBeGreaterThanOrEqual(44);
	expect(submitBox?.height).toBeGreaterThanOrEqual(44);
	expect(Math.abs((emailBox?.width ?? 0) - (submitBox?.width ?? 0))).toBeLessThanOrEqual(1);
});

test('authentication inputs remain touch-sized on a phone viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/auth/sign-up');

	for (const label of ['Name', 'Email', 'Password']) {
		const field = page.getByLabel(label, { exact: true });
		await expect(field).toBeVisible();
		expect(
			(await field.boundingBox())?.height,
			`${label} should be touch-sized`
		).toBeGreaterThanOrEqual(44);
	}
});

test('protected profile routes redirect signed-out visitors before backend access', async ({
	page
}) => {
	await page.goto('/profile/not-a-real-user');
	await expect(page).toHaveURL(/\/auth\/sign-in$/);
});
