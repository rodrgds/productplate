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
		page.getByRole('heading', { name: /Build from a real product surface/i })
	).toBeVisible();
});

test('public routes have no horizontal overflow on a phone viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });

	for (const path of ['/', '/components', '/docs', '/auth/demo']) {
		await page.goto(path);
		const hasHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth
		);
		expect(hasHorizontalOverflow, `${path} should fit the viewport`).toBe(false);
	}
});

test('mobile landing navigation remains interactive', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await page.getByRole('button', { name: /open navigation/i }).click();
	await expect(page.locator('[data-slot="sheet-title"]')).toHaveText('Product Plate');
	await expect(page.getByRole('link', { name: /Components/i }).last()).toBeVisible();
});
