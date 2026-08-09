import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('disposable demo route', () => {
	it('posts the confirmation page to a dedicated creation endpoint', async () => {
		const source = await readFile('src/routes/auth/demo/+page.svelte', 'utf8');

		expect(source).toContain("action={resolve('/auth/demo/create')}");
	});

	it('uses the build-time public Convex URL in the server handler', async () => {
		const source = await readFile('src/routes/auth/demo/create/+server.ts', 'utf8');

		expect(source).toContain("import { PUBLIC_CONVEX_URL } from '$env/static/public';");
		expect(source).toContain('new ConvexHttpClient(PUBLIC_CONVEX_URL)');
	});

	it('authenticates demo reservations with a dedicated shared secret', async () => {
		const route = await readFile('src/routes/auth/demo/create/+server.ts', 'utf8');
		const mutation = await readFile('src/convex/demo.ts', 'utf8');

		expect(route).toContain('privateEnv.DEMO_CREATION_SECRET');
		expect(mutation).toContain('process.env.DEMO_CREATION_SECRET');
		expect(route).not.toContain('secret: privateEnv.BETTER_AUTH_SECRET');
	});

	it('keeps README screenshot capture on its local onboarding account', async () => {
		const source = await readFile('docs/scripts/capture-readme-screenshots.ts', 'utf8');

		expect(source).toContain("from '@playwright/test'");
		expect(source).toContain('ALLOW_REMOTE_SCREENSHOT_MUTATIONS');
		expect(source).toContain("getByRole('button', { name: /finish onboarding/i })");
		expect(source).not.toContain('fetch(`${baseUrl}/auth/demo`');
		for (const unusedCapture of ['landing', 'landing-components', 'sign-up', 'onboarding']) {
			expect(source).not.toContain(`screenshot(page, '${unusedCapture}'`);
		}
		expect(source).not.toContain("'billing',");
		expect(source).not.toContain("'settings',");
	});
});
