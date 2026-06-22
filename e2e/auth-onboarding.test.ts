import { expect, test } from '@playwright/test';

test('email signup and later sign-in reach the protected dashboard', async ({ page, context }) => {
	const stamp = Date.now();
	const email = `productplate-e2e-${stamp}@example.com`;

	await page.goto('/auth/sign-up');
	await page.getByLabel('Name').fill('Product Plate E2E');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('ProductPlate123!');
	await Promise.all([
		page.waitForResponse((response) => response.url().includes('/api/auth/sign-up/email')),
		page.getByRole('button', { name: /create account/i }).click()
	]);

	await page.waitForURL('**/onboarding');
	await expect(page.getByRole('heading', { name: /set up your workspace/i })).toBeVisible();

	await page.getByLabel(/display name/i).fill('Product Plate E2E');
	await page.getByLabel(/workspace/i).fill('Launch Workspace');
	await page.getByLabel(/what are you building/i).fill('Founder');
	await page.getByLabel(/short bio/i).fill('Building a focused SaaS launch with Product Plate.');
	await page.getByRole('button', { name: /finish onboarding/i }).click();

	await page.waitForURL('**/dashboard');
	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
	await expect(page.getByText(/Welcome back, Product Plate E2E!/)).toBeVisible();
	await expect(page.getByText(/AI workbench/i)).toBeVisible();

	await context.clearCookies();
	await page.goto('/auth/sign-in');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('ProductPlate123!');
	await page.getByRole('button', { name: /^sign in$/i }).click();

	await page.waitForURL('**/dashboard');
	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

	await page.goto('/onboarding');
	await page.waitForURL('**/dashboard');
	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
