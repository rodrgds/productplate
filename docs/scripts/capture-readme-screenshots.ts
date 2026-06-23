import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from 'playwright';

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:5173';
const outputDir = 'docs/images/readme';
const routes = [
	'dashboard',
	'assistant',
	'billing',
	'settings',
	'editor',
	'flow',
	'threlte'
] as const;

async function screenshot(page: Page, name: string, selector = 'body', settleMs = 0) {
	await page.locator(selector).first().waitFor({ state: 'visible', timeout: 15_000 });
	if (settleMs > 0) {
		await page.waitForTimeout(settleMs);
	}
	await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: false });
	console.log(`captured ${name}.png`);
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch(
	process.env.PLAYWRIGHT_CHROME_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHROME_CHANNEL } : {}
);
const page = await browser.newPage({
	viewport: { width: 1440, height: 1100 },
	deviceScaleFactor: 1
});

try {
	await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
	await screenshot(page, 'landing', 'h1');

	await page.goto(`${baseUrl}/landing-components`, { waitUntil: 'domcontentloaded' });
	await screenshot(page, 'landing-components', 'h1', 900);

	await page.goto(`${baseUrl}/auth/sign-up`, { waitUntil: 'domcontentloaded' });
	await screenshot(page, 'sign-up', 'form');

	const stamp = Date.now();
	const email = `productplate-screenshot-${stamp}@example.com`;

	await page.getByLabel('Name').fill('Product Plate Demo');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('ProductPlate123!');
	await Promise.all([
		page.waitForResponse((response) => response.url().includes('/api/auth/sign-up/email')),
		page.getByRole('button', { name: /create account/i }).click()
	]);

	await page.waitForURL('**/onboarding');
	await page.locator('form').waitFor({ timeout: 15_000 });
	await screenshot(page, 'onboarding', 'form');

	await page.getByLabel(/display name/i).fill('Product Plate Demo');
	await page.getByLabel(/workspace/i).fill('Launch Workspace');
	await page.getByLabel(/what are you building/i).fill('Founder');
	await page.getByLabel(/short bio/i).fill('Building a focused SaaS launch with Product Plate.');
	await screenshot(page, 'onboarding-filled', 'form');
	await page.getByRole('button', { name: /finish onboarding/i }).click();

	for (const route of routes) {
		await page.goto(`${baseUrl}/${route}`, { waitUntil: 'domcontentloaded' });
		await page.waitForTimeout(2_000);
		if (page.url().includes('/auth/sign-in')) {
			throw new Error(
				`Route /${route} redirected to sign-in. Set Convex SITE_URL to ${baseUrl} and run Convex dev before capturing screenshots.`
			);
		}
		await screenshot(page, route);
	}
} finally {
	await browser.close();
}
