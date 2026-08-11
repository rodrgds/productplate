import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const buildOnlySecret = "BETTER_AUTH_SECRET: 'ci-build-only-secret-not-used-at-runtime'";

describe('CI workflow environment', () => {
	it('installs workspace dependencies before running the source initializer', async () => {
		const workflow = await readFile('.github/workflows/profile-matrix.yml', 'utf8');
		const installStep = workflow.indexOf('run: bun install --frozen-lockfile');
		const generateStep = workflow.indexOf('- name: Generate profile');

		expect(installStep).toBeGreaterThan(-1);
		expect(generateStep).toBeGreaterThan(installStep);
	});

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

	it('uses the deployed Pages preview origin for Cloudflare and Convex auth', async () => {
		const workflow = await readFile('.github/workflows/cloudflare-pages.yml', 'utf8');
		const hooks = await readFile('src/hooks.server.ts', 'utf8');
		const cloudflareStep = workflow.indexOf('- name: Deploy built artifact to Cloudflare Pages');
		const authOriginStep = workflow.indexOf('- name: Configure preview auth origin');

		expect(workflow).not.toContain("format('https://{0}.{1}.pages.dev'");
		expect(workflow).toContain(
			"SITE_URL: ${{ github.event_name == 'pull_request' && 'http://localhost:5173' || vars.SITE_URL }}"
		);
		expect(authOriginStep).toBeGreaterThan(cloudflareStep);
		expect(workflow).toContain(
			'DEPLOYED_URL: ${{ steps.cloudflare-deploy.outputs.deployment-url }}'
		);
		expect(workflow).toContain(`printf '%s' "$DEPLOYED_URL" | bun convex env set SITE_URL`);
		expect(workflow).toContain(`printf '%s' "$DEPLOYED_URL" | bun convex env set BETTER_AUTH_URL`);
		expect(hooks).toContain('env.CF_PAGES_URL ?? env.SITE_URL ?? origin');
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

	it('uploads the matching GitHub release assets before publishing the CLI', async () => {
		const release = await readFile('.github/workflows/release.yml', 'utf8');
		const githubRelease = release.indexOf('- name: Create GitHub release');
		const verifyAssets = release.indexOf('- name: Verify GitHub release assets');
		const npmPublish = release.indexOf('- name: Publish create-product-plate');

		expect(githubRelease).toBeGreaterThan(-1);
		expect(verifyAssets).toBeGreaterThan(githubRelease);
		expect(npmPublish).toBeGreaterThan(verifyAssets);
		expect(release).toContain('product-plate-upgrade-v2.json');
		expect(release).toContain('sha256sum --check SHA256SUMS');
	});

	it('exchanges GitHub OIDC for a short-lived npm token before Bun publishes', async () => {
		const release = await readFile('.github/workflows/release.yml', 'utf8');
		const exchange = release.indexOf('- name: Exchange npm trusted-publishing token');
		const publish = release.indexOf('- name: Publish create-product-plate');

		expect(exchange).toBeGreaterThan(-1);
		expect(publish).toBeGreaterThan(exchange);
		expect(release).toContain('audience=npm:registry.npmjs.org');
		expect(release).toContain('/-/npm/v1/oidc/token/exchange/package/create-product-plate');
		expect(release).toContain('NPM_CONFIG_TOKEN: ${{ steps.npm-auth.outputs.token }}');
		expect(release).not.toContain('secrets.NPM_TOKEN');
	});
});
