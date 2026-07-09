import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from 'playwright';

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:5173';
const outputDir = 'static/screenshots';
const routes = [
	'dashboard',
	'assistant',
	'billing',
	'settings',
	'editor',
	'flow',
	'map',
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

function getSetCookieHeaders(headers: Headers) {
	const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
	const values = getSetCookie?.call(headers);
	if (values?.length) return values;

	const header = headers.get('set-cookie');
	return header ? [header] : [];
}

function toBrowserCookie(cookie: string, baseUrl: string) {
	const [nameValue] = cookie.split(';');
	const separatorIndex = nameValue.indexOf('=');
	return {
		name: nameValue.slice(0, separatorIndex),
		value: nameValue.slice(separatorIndex + 1),
		url: baseUrl
	};
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

	await page.goto(`${baseUrl}/components`, { waitUntil: 'domcontentloaded' });
	await screenshot(page, 'landing-components', 'body', 900);

	await page.goto(`${baseUrl}/auth/sign-up`, { waitUntil: 'domcontentloaded' });
	await screenshot(page, 'sign-up', 'form');

	const stamp = Date.now();
	const email = `productplate-screenshot-${stamp}@example.com`;

	await page.getByLabel('Name').fill('Product Plate Demo');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('ProductPlate123!');
	await page.getByRole('button', { name: /create account/i }).click();
	await page.waitForURL('**/onboarding');
	await page.locator('form').waitFor({ timeout: 15_000 });
	await screenshot(page, 'onboarding', 'form');

	await page.getByLabel(/display name/i).fill('Product Plate Demo');
	await page.getByLabel(/workspace/i).fill('Launch Workspace');
	await page.getByLabel(/what are you building/i).fill('Founder');
	await page.getByLabel(/short bio/i).fill('Building a focused SaaS launch with Product Plate.');
	await screenshot(page, 'onboarding-filled', 'form');

	await page.context().clearCookies();
	const demoResponse = await fetch(`${baseUrl}/auth/demo`, { redirect: 'manual' });
	if (demoResponse.status !== 303) {
		throw new Error(
			`Demo account setup failed with HTTP ${demoResponse.status}: ${await demoResponse.text()}`
		);
	}
	await page
		.context()
		.addCookies(
			getSetCookieHeaders(demoResponse.headers).map((cookie) => toBrowserCookie(cookie, baseUrl))
		);
	await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });

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
