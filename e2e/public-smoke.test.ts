import { expect, test } from '@playwright/test';

test('public starter routes render with truthful navigation', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle(/Product Plate/);
	await expect(
		page.getByRole('heading', { name: /SvelteKit starter, ready to become your product/i })
	).toBeVisible();
	await expect(page.getByRole('link', { name: /Open live demo/i }).first()).toHaveAttribute(
		'href',
		'/auth/demo'
	);

	await page.goto('/components');
	await expect(page.getByRole('heading', { name: /Reusable landing sections/i })).toBeVisible();

	await page.goto('/docs');
	await expect(
		page.getByRole('heading', { name: /Build from a working product/i })
	).toBeVisible();
});

test('public routes have no horizontal overflow on a phone viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });

	for (const path of [
		'/',
		'/components',
		'/components/hero',
		'/components/features',
		'/components/proof',
		'/components/conversion',
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

test('ROI calculator updates the visible business case', async ({ page }) => {
	await page.goto('/components/conversion');

	const sliderTracks = page.locator('[data-slot="slider-track"]');
	await expect(sliderTracks).toHaveCount(3);
	for (const track of await sliderTracks.all()) {
		const box = await track.boundingBox();
		expect(box?.height, 'slider tracks should remain visibly rendered').toBeGreaterThanOrEqual(4);
	}

	const teamSize = page.locator('[aria-label="People doing the work"] [role="slider"]');
	await expect(teamSize).toHaveAttribute('aria-valuenow', '12');
	await teamSize.press('ArrowRight');

	await expect(teamSize).toHaveAttribute('aria-valuenow', '13');
	await expect(page.getByText('$114,270', { exact: true })).toBeVisible();
});

test('new landing sections remain present, bounded, and paint-safe', async ({ page }) => {
	const sectionsByRoute = {
		'/components/hero': ['dashboard-hero'],
		'/components/features': [
			'problem-solution',
			'workflow-steps',
			'use-case-switcher',
			'feature-spotlight'
		],
		'/components/proof': ['case-study', 'trust-center', 'release-timeline'],
		'/components/conversion': ['roi-calculator', 'migration-plan']
	} as const;

	for (const [path, sectionKeys] of Object.entries(sectionsByRoute)) {
		await page.goto(path);

		for (const key of sectionKeys) {
			const section = page.locator(`[aria-labelledby="${key}-heading"]`);
			await expect(section).toBeVisible();
			expect(
				await section.evaluate((element) => element.scrollWidth <= element.clientWidth),
				`${key} should not overflow its gallery frame`
			).toBe(true);
		}
	}

	await page.goto('/components/features');
	const featureBento = page.getByTestId('feature-bento');
	await expect(featureBento).toBeVisible();
	expect(
		await featureBento
			.locator('*')
			.evaluateAll((elements) =>
				elements.every((element) => getComputedStyle(element).backdropFilter === 'none')
			),
		'the feature bento should not create scroll-bound backdrop-filter paint layers'
	).toBe(true);
});

test('mobile landing navigation remains interactive', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await page.getByRole('button', { name: /open navigation/i }).click();
	await expect(page.locator('[data-slot="sheet-title"]')).toHaveText('Product Plate');
	await expect(page.getByRole('link', { name: /Components/i }).last()).toBeVisible();
});

test('protected profile routes redirect signed-out visitors before backend access', async ({
	page
}) => {
	await page.goto('/profile/not-a-real-user');
	await expect(page).toHaveURL(/\/auth\/sign-in$/);
});
