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
});
