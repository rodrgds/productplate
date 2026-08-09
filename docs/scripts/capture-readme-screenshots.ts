import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from '@playwright/test';

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:5173';
const outputDir = 'static/screenshots';
const parsedBaseUrl = new URL(baseUrl);
const isLocalBaseUrl = ['localhost', '127.0.0.1', '[::1]'].includes(parsedBaseUrl.hostname);
const routes = ['dashboard', 'assistant', 'editor', 'flow', 'map', 'threlte'] as const;

if (!isLocalBaseUrl && process.env.ALLOW_REMOTE_SCREENSHOT_MUTATIONS !== 'true') {
	throw new Error(
		'README capture creates an account. Use a local SCREENSHOT_BASE_URL, or set ALLOW_REMOTE_SCREENSHOT_MUTATIONS=true explicitly.'
	);
}

async function screenshot(page: Page, name: string, selector = 'body', settleMs = 0) {
	await page.locator(selector).first().waitFor({ state: 'visible', timeout: 15_000 });
	if (settleMs > 0) {
		await page.waitForTimeout(settleMs);
	}
	await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: false });
	console.log(`captured ${name}.png`);
}

async function captureSocialCard(page: Page) {
	await page.setViewportSize({ width: 1200, height: 630 });
	await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
	await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
	await page.locator('main').first().waitFor({ state: 'visible', timeout: 15_000 });
	await page.evaluate(async () => document.fonts.ready);
	await page.screenshot({ path: 'static/og.png', animations: 'disabled' });
	console.log('captured og.png');

	await page.setViewportSize({ width: 1440, height: 1100 });
	await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
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
	await captureSocialCard(page);
	await page.goto(`${baseUrl}/auth/sign-up`, { waitUntil: 'domcontentloaded' });

	const stamp = Date.now().toString(36);
	const email = `demo-${stamp}@example.com`;

	await page.getByLabel('Name').fill('Product Plate Demo');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('ProductPlate123!');
	await page.getByRole('button', { name: /create account/i }).click();
	await page.waitForURL('**/onboarding');
	await page.locator('form').waitFor({ timeout: 15_000 });

	await page.getByLabel(/display name/i).fill('Product Plate Demo');
	await page.getByLabel(/workspace/i).fill('Launch Workspace');
	await page.getByLabel(/what are you building/i).fill('Founder');
	await page.getByLabel(/short bio/i).fill('Building a focused SaaS launch with Product Plate.');
	await screenshot(page, 'onboarding-filled', 'form');
	await page.getByRole('button', { name: /finish onboarding/i }).click();
	await page.waitForURL('**/dashboard', {
		waitUntil: 'domcontentloaded',
		timeout: 20_000
	});

	for (const route of routes) {
		await page.goto(`${baseUrl}/${route}`, { waitUntil: 'domcontentloaded' });
		await page.waitForTimeout(2_000);
		if (page.url().includes('/auth/sign-in')) {
			throw new Error(
				`Route /${route} redirected to sign-in. Set Convex SITE_URL to ${baseUrl} and run Convex dev before capturing screenshots.`
			);
		}
		if (page.url().includes('/onboarding')) {
			throw new Error(`Route /${route} redirected to onboarding instead of the app screen.`);
		}
		await screenshot(page, route);
	}
} finally {
	await browser.close();
}
