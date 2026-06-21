import { expect, test } from '@playwright/test';

test('home page presents Product Plate and its starter capabilities', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Product Plate/);
	await expect(
		page.getByRole('heading', { name: /Ship the product, not the setup/i })
	).toBeVisible();
	await expect(page.getByRole('link', { name: /Start building/i }).first()).toHaveAttribute(
		'href',
		'/auth/sign-up'
	);
	await expect(page.getByRole('heading', { name: /Everything around your idea/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: /Questions, answered/i })).toBeVisible();
});
