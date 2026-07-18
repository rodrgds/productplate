import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('disposable demo route', () => {
	it('posts the confirmation page to a dedicated creation endpoint', async () => {
		const source = await readFile('src/routes/auth/demo/+page.svelte', 'utf8');

		expect(source).toContain("action={resolve('/auth/demo/create')}");
	});
});
