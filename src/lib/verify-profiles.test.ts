import { access, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
	PROFILE_NAMES,
	createProfileVerificationSteps,
	parseProfileArguments
} from '../../scripts/verify-profiles';

describe('generated profile verification', () => {
	it('runs every supported profile sequentially by default', () => {
		expect(parseProfileArguments([])).toEqual({
			profiles: PROFILE_NAMES,
			keep: false,
			installBrowser: true
		});
	});

	it('accepts a focused profile run and local debugging options', () => {
		expect(parseProfileArguments(['solo-saas', '--keep', '--skip-browser-install'])).toEqual({
			profiles: ['solo-saas'],
			keep: true,
			installBrowser: false
		});
	});

	it('rejects unknown profiles before creating temporary apps', () => {
		expect(() => parseProfileArguments(['enterprise-saas'])).toThrow(
			'Unknown profile "enterprise-saas"'
		);
	});

	it('uses the release gates without launching competing preview servers', () => {
		const steps = createProfileVerificationSteps('/tmp/generated-profile', true);

		expect(steps.map((step) => step.label)).toEqual([
			'Prove frozen installation',
			'Install matching Playwright Chromium',
			'Lint',
			'Typecheck',
			'Unit tests',
			'Dependency audit',
			'Production build',
			'Browser smoke',
			'Launch doctor'
		]);
		expect(steps.find((step) => step.label === 'Prove frozen installation')?.args).toContain(
			'--ignore-scripts'
		);
		expect(
			steps.find((step) => step.label === 'Install matching Playwright Chromium')
		).toMatchObject({
			command: process.execPath,
			args: ['x', 'playwright', 'install', 'chromium'],
			cwd: '/tmp/generated-profile'
		});
		expect(steps.find((step) => step.label === 'Browser smoke')?.env).toEqual({
			PLAYWRIGHT_PREBUILT: 'true'
		});
		expect(steps.every((step) => step.cwd === '/tmp/generated-profile')).toBe(true);
		expect(
			createProfileVerificationSteps('/tmp/generated-profile', false).some(
				(step) => step.label === 'Install matching Playwright Chromium'
			)
		).toBe(false);
	});

	it('keeps generated dependency audits on fixed transitive versions', async () => {
		const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
			overrides?: Record<string, string>;
		};
		const lockfile = await readFile('bun.lock', 'utf8');

		expect(packageJson.dependencies?.nanoid).toBe('5.1.16');
		// Bun overrides are global. Forcing brace-expansion 5 would break the
		// CommonJS API expected by minimatch 3 and 5 on a fresh installation.
		expect(packageJson.overrides?.['brace-expansion']).toBeUndefined();
		expect(lockfile).toContain('brace-expansion@1.1.18');
		expect(lockfile).toContain('brace-expansion@2.1.4');
		expect(lockfile).toContain('brace-expansion@5.0.9');
		expect(packageJson.overrides?.['fast-uri']).toBe('3.1.5');
		expect(packageJson.overrides?.['js-yaml']).toBe('4.3.1');
		expect(packageJson.overrides?.nanoid).toBe('5.1.16');
		expect(packageJson.overrides?.postcss).toBe('8.5.23');
		// Autumn's Convex component has an exact React 19.1.1 peer. Letting Bun
		// select a second React peer context duplicates Convex's nominal types.
		expect(packageJson.devDependencies?.atmn).toBeUndefined();
		expect(packageJson.overrides?.react).toBe('19.1.1');
		expect(packageJson.overrides?.undici).toBe('7.29.0');
	});

	it('uses the same platform-neutral Bun release locally, in CI, and in generated apps', async () => {
		const expectedVersion = '1.3.13';
		const devenv = await readFile('devenv.nix', 'utf8');
		expect(devenv).toContain('rawBun = pkgs.bun;');
		expect(devenv).not.toContain('bun-linux-');
		expect(devenv).not.toContain('autoPatchelfHook');

		for (const path of [
			'package.json',
			'README.md',
			'.github/workflows/code-quality.yml',
			'.github/workflows/cloudflare-pages.yml',
			'.github/workflows/profile-matrix.yml',
			'.github/workflows/release.yml',
			'packages/create-product-plate/src/transforms.ts'
		]) {
			const content = await readFile(path, 'utf8');
			expect(content, path).toContain(expectedVersion);
			expect(content, path).not.toContain('1.3.3');
		}
	});

	it('keeps one active ESLint config for Svelte and reusable UI components', async () => {
		const eslintConfig = await readFile('eslint.config.js', 'utf8');
		const hasLegacyConfig = await access('.eslintrc.cjs').then(
			() => true,
			() => false
		);
		expect(hasLegacyConfig).toBe(false);
		expect(eslintConfig).not.toContain("'src/lib/components/ui/**'");
		expect(eslintConfig).toContain("'_template_options/**'");
		expect(eslintConfig).toContain("'no-restricted-imports'");
		expect(eslintConfig).toContain("'svelte/valid-compile'");
		expect(eslintConfig).toContain("'svelte/require-store-reactive-access'");
	});
});
