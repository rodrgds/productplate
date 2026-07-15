import { expect, test } from '@playwright/test';

async function enterDemo(page: import('@playwright/test').Page) {
	await page.goto('/auth/demo');
	await page.getByRole('button', { name: /Create demo workspace/i }).click();
	await page.waitForURL('**/dashboard');
}

test('home page presents Product Plate and its starter capabilities', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Product Plate/);
	await expect(
		page.getByRole('heading', { name: /SvelteKit starter, ready to become your product/i })
	).toBeVisible();
	await expect(page.getByRole('img', { name: /Product Plate dashboard/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Open live demo/i }).first()).toHaveAttribute(
		'href',
		'/auth/demo'
	);
	await expect(page.getByRole('link', { name: /View source/i }).first()).toHaveAttribute(
		'href',
		'https://github.com/rodrgds/productplate'
	);
	await expect(
		page.getByRole('heading', { name: /A working product, not a feature checklist/i })
	).toBeVisible();
	await expect(
		page.getByRole('heading', { name: /Clone it. Brief it. Make it yours/i })
	).toBeVisible();
	await expect(page.getByRole('heading', { name: /Before you fork/i })).toBeVisible();
});

test('home entry points signed-in visitors back to the app', async ({ page }) => {
	await enterDemo(page);

	await page.goto('/');

	await expect(page.getByRole('link', { name: /Go to app/i }).first()).toHaveAttribute(
		'href',
		'/dashboard'
	);
	await expect(page.getByRole('button', { name: /^Enter$/i })).toHaveCount(0);
});

test('mobile landing navigation opens above the sticky header', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await page.getByRole('button', { name: /open navigation/i }).click();

	const sheetTitle = page.locator('[data-slot="sheet-title"]');
	await expect(sheetTitle).toHaveText('Product Plate');

	await expect
		.poll(async () =>
			sheetTitle.evaluate((node) => {
				const rect = node.getBoundingClientRect();
				const elementAtTitleCenter = document.elementFromPoint(
					rect.left + rect.width / 2,
					rect.top + rect.height / 2
				);

				return elementAtTitleCenter === node || node.contains(elementAtTitleCenter);
			})
		)
		.toBe(true);
});

test('landing component gallery presents reusable marketing sections', async ({ page }) => {
	await page.goto('/components');
	await expect(page).toHaveTitle(/Components/);
	await expect(page.getByRole('heading', { name: /Reusable landing sections/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Hero/i }).first()).toHaveAttribute(
		'href',
		'/components/hero'
	);
	await expect(page.getByRole('link', { name: /Pricing/i }).first()).toHaveAttribute(
		'href',
		'/components/pricing'
	);
});

test('demo entry opens the dashboard with sidebar navigation', async ({ page }) => {
	await enterDemo(page);

	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Assistant/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Editor/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Map/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Threlte/i })).toBeVisible();
});

test('demo workspace includes the map and interactive 3D starter routes', async ({ page }) => {
	await enterDemo(page);

	await page.goto('/map');
	await expect(page.getByRole('heading', { name: 'Map', exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: /Workspace map/i })).toBeVisible();
	await expect(page.getByRole('img', { name: /Berlin marker/i })).toBeVisible();
	await expect(page.getByRole('button', { name: /Zoom in/i })).toBeVisible();

	await page.goto('/threlte');
	await expect(page.getByRole('heading', { name: 'Threlte', exact: true })).toBeVisible();
	await expect(page.getByRole('group', { name: /Scene mode/i })).toBeVisible();
	await page.getByRole('button', { name: /Stack/i }).click();
	await expect(page.getByRole('button', { name: /Stack/i })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
});
