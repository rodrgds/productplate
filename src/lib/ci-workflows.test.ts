import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const buildOnlySecret = "BETTER_AUTH_SECRET: 'ci-build-only-secret-not-used-at-runtime'";

describe('CI workflow environment', () => {
	it.each(['code-quality.yml', 'cloudflare-pages.yml'])(
		'provides Better Auth with a non-production secret while building %s',
		async (workflow) => {
			const source = await readFile(`.github/workflows/${workflow}`, 'utf8');

			expect(source).toContain(buildOnlySecret);
		}
	);
});
