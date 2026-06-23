import { expect, test } from '@playwright/test';

test('home page presents Product Plate and its starter capabilities', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Product Plate/);
	await expect(
		page.getByRole('heading', { name: /Ship the product, not the setup/i })
	).toBeVisible();
	await expect(page.getByRole('link', { name: /Open demo/i }).first()).toHaveAttribute(
		'href',
		'/auth/demo'
	);
	await expect(page.getByRole('heading', { name: /Everything around your idea/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: /Questions, answered/i })).toBeVisible();
});

test('landing component gallery presents reusable marketing sections', async ({ page }) => {
	await page.goto('/landing-components');
	await expect(page).toHaveTitle(/Landing Components/);
	await expect(page.getByRole('heading', { name: /Landing component library/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: /Hero patterns/i })).toBeVisible();
	await expect(page.getByText('Conversion sections')).toBeVisible();
	await expect(page.getByRole('heading', { name: /Pricing and FAQ/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /Back to home/i })).toHaveAttribute('href', '/');
});
