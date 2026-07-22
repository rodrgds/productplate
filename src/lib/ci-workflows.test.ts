import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const buildOnlySecret = "BETTER_AUTH_SECRET: 'ci-build-only-secret-not-used-at-runtime'";

describe('CI workflow environment', () => {
	it('uses isolated Convex deploy keys for previews and production', async () => {
		const source = await readFile('.github/workflows/cloudflare-pages.yml', 'utf8');
		const environment = source.indexOf('    environment:');
		const deployKey = source.indexOf('CONVEX_DEPLOY_KEY:');

		expect(source).toContain('secrets.CONVEX_PREVIEW_DEPLOY_KEY');
		expect(source).toContain('secrets.CONVEX_PRODUCTION_DEPLOY_KEY');
		expect(source).toContain('Preview and production Convex deploy keys must differ.');
		expect(source).toContain('--preview-name');
		expect(environment).toBeGreaterThan(-1);
		expect(deployKey).toBeGreaterThan(environment);
		expect(source).toContain('PUBLIC_CONVEX_URL: ${{ vars.PUBLIC_CONVEX_URL }}');
		expect(source).toContain('PUBLIC_CONVEX_SITE_URL: ${{ vars.PUBLIC_CONVEX_SITE_URL }}');
	});

	it('builds through Convex before Cloudflare and smokes the public result', async () => {
		const source = await readFile('.github/workflows/cloudflare-pages.yml', 'utf8');
		const convexStep = source.indexOf('- name: Build, then deploy Convex');
		const cloudflareStep = source.indexOf('- name: Deploy built artifact to Cloudflare Pages');
		const smokeStep = source.indexOf('- name: Smoke deployed profile');

		expect(convexStep).toBeGreaterThan(-1);
		expect(cloudflareStep).toBeGreaterThan(convexStep);
		expect(smokeStep).toBeGreaterThan(cloudflareStep);
		expect(source).toContain('bun convex deploy --cmd "bun scripts/build-for-convex.ts"');
		expect(source).toContain('bun scripts/smoke-deploy.ts');
		expect(source).toContain('Rollback:');
	});

	it('bundles the Cloudflare worker before Convex activates the backend', async () => {
		const source = await readFile('scripts/build-for-convex.ts', 'utf8');

		expect(source).toContain("from 'esbuild'");
		expect(source).toContain("conditions: ['worker', 'browser']");
		expect(source).toContain("external: ['cloudflare:*', 'node:*']");
	});

	it.each(['code-quality.yml', 'cloudflare-pages.yml'])(
		'provides Better Auth with a non-production secret while building %s',
		async (workflow) => {
			const source = await readFile(`.github/workflows/${workflow}`, 'utf8');

			expect(source).toContain(buildOnlySecret);
		}
	);

	it('gates stable publication on the reusable four-profile matrix', async () => {
		const matrix = await readFile('.github/workflows/profile-matrix.yml', 'utf8');
		const release = await readFile('.github/workflows/release.yml', 'utf8');

		expect(matrix).toContain('workflow_call:');
		expect(release).toContain('uses: ./.github/workflows/profile-matrix.yml');
		expect(release).toContain('needs: profiles');
		expect(release).toContain('bun run verify:full');
	});
});
