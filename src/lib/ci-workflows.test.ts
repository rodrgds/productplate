import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const buildOnlySecret = "BETTER_AUTH_SECRET: 'ci-build-only-secret-not-used-at-runtime'";

describe('CI workflow environment', () => {
	it('provides public Convex configuration before Cloudflare typechecking', async () => {
		const source = await readFile('.github/workflows/cloudflare-pages.yml', 'utf8');
		const deployJob = source.match(/jobs:\n {2}deploy:[\s\S]*?\n {4}steps:/)?.[0];

		expect(deployJob).toContain('PUBLIC_CONVEX_URL: ${{ vars.PUBLIC_CONVEX_URL }}');
		expect(deployJob).toContain('PUBLIC_CONVEX_SITE_URL: ${{ vars.PUBLIC_CONVEX_SITE_URL }}');
	});

	it('syncs the demo creation secret before deploying Cloudflare Pages', async () => {
		const source = await readFile('.github/workflows/cloudflare-pages.yml', 'utf8');
		const secretStep = source.indexOf('- name: Configure demo creation secret');
		const deployStep = source.indexOf('- name: Deploy to Cloudflare Pages');

		expect(secretStep).toBeGreaterThan(-1);
		expect(deployStep).toBeGreaterThan(secretStep);
		expect(source).toContain('DEMO_CREATION_SECRET: ${{ secrets.DEMO_CREATION_SECRET }}');
		expect(source).toContain('wrangler pages secret put DEMO_CREATION_SECRET');
	});

	it.each(['code-quality.yml', 'cloudflare-pages.yml'])(
		'provides Better Auth with a non-production secret while building %s',
		async (workflow) => {
			const source = await readFile(`.github/workflows/${workflow}`, 'utf8');

			expect(source).toContain(buildOnlySecret);
		}
	);
});
