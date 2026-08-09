import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateProject, verifyTemplateChecksum } from './generator.ts';
import { resolveProfile } from './profiles.ts';
import { pruneUnusedDependencies } from './transforms.ts';
import { createManagedState } from './upgrade.ts';

const temporaryDirectories: Array<string> = [];

async function makeTemporaryDirectory(prefix: string) {
	const directory = await mkdtemp(join(tmpdir(), prefix));
	temporaryDirectories.push(directory);
	return directory;
}

async function runRepositoryPrettier(destination: string, mode: '--check' | '--write') {
	const repositoryRoot = join(import.meta.dir, '../../..');
	const child = Bun.spawn(
		[
			join(repositoryRoot, 'node_modules/.bin/prettier'),
			mode,
			'.',
			'--no-config',
			'--ignore-path',
			'.prettierignore',
			'--use-tabs',
			'--single-quote',
			'--trailing-comma',
			'none',
			'--print-width',
			'100',
			'--plugin',
			join(repositoryRoot, 'node_modules/prettier-plugin-svelte/plugin.js'),
			'--plugin',
			join(repositoryRoot, 'node_modules/prettier-plugin-tailwindcss/dist/index.mjs'),
			'--tailwind-stylesheet',
			'./src/app.css'
		],
		{ cwd: destination, stdout: 'pipe', stderr: 'pipe' }
	);
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
		child.exited
	]);
	return { exitCode, output: `${stdout}${stderr}` };
}

async function makeTemplate() {
	const template = await makeTemporaryDirectory('product-plate-template-');
	await mkdir(join(template, 'src/routes/auth/demo'), { recursive: true });
	await mkdir(join(template, 'src/routes/(app)/assistant'), { recursive: true });
	await mkdir(join(template, 'src/routes/(app)/workspace'), { recursive: true });
	await mkdir(join(template, 'src/routes/(app)/map'), { recursive: true });
	await mkdir(join(template, 'src/routes/api/chat'), { recursive: true });
	await mkdir(join(template, 'src/routes/api/waitlist'), { recursive: true });
	await mkdir(join(template, 'src/routes/legal/about'), { recursive: true });
	await mkdir(join(template, 'src/convex'), { recursive: true });
	await mkdir(join(template, 'src/convex/_generated/ai'), { recursive: true });
	await mkdir(join(template, 'src/lib/components/ai'), { recursive: true });
	await mkdir(join(template, 'scripts'), { recursive: true });
	await mkdir(join(template, 'static/screenshots'), { recursive: true });
	await mkdir(join(template, '_template_options'), { recursive: true });
	await mkdir(join(template, '.git'), { recursive: true });
	await writeFile(
		join(template, 'package.json'),
		JSON.stringify({
			name: 'productplate',
			private: true,
			version: '0.1.0',
			type: 'module',
			scripts: { dev: 'vite dev', build: 'vite build' },
			dependencies: {
				'better-auth': '1.0.0',
				'@useautumn/convex': '1.0.0',
				'@ai-sdk/svelte': '1.0.0',
				'@threlte/core': '1.0.0',
				'@xyflow/svelte': '1.0.0'
			},
			devDependencies: {
				'@edge-runtime/vm': '1.0.0',
				'@types/node': '1.0.0',
				'@vite-pwa/sveltekit': '1.0.0',
				'convex-test': '1.0.0',
				prettier: '1.0.0',
				'prettier-plugin-svelte': '1.0.0',
				typescript: '1.0.0',
				'vite-plugin-pwa': '1.0.0',
				vitest: '4.1.10',
				'workbox-window': '1.0.0'
			}
		})
	);
	await writeFile(join(template, 'bun.lock'), 'stale monorepo lock');
	await writeFile(
		join(template, '.prettierrc'),
		JSON.stringify({
			useTabs: true,
			singleQuote: true,
			trailingComma: 'none',
			printWidth: 100,
			plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
			overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
			tailwindStylesheet: './src/app.css'
		})
	);
	await writeFile(
		join(template, 'src/app.d.ts'),
		`/// <reference types="vite-plugin-pwa/svelte" />
/// <reference types="vite-plugin-pwa/info" />
declare global { namespace App {} }
export {};
`
	);
	await writeFile(join(template, 'src/routes/+page.svelte'), '<h1>Product Plate</h1>');
	await writeFile(
		join(template, 'src/app.html'),
		'<html data-product-plate-theme-pending><head><script src="https://analytics.example.com"></script>%sveltekit.head%</head><body>%sveltekit.body%</body></html>'
	);
	await writeFile(join(template, 'src/routes/auth/demo/+page.svelte'), 'demo');
	await writeFile(
		join(template, 'src/routes/(app)/assistant/+page.svelte'),
		"<script>import '@ai-sdk/svelte';</script><p>assistant</p>"
	);
	await writeFile(join(template, 'src/routes/(app)/workspace/+page.svelte'), 'workspace');
	await writeFile(join(template, 'src/routes/(app)/map/+page.svelte'), 'map');
	await writeFile(
		join(template, 'src/routes/api/waitlist/+server.ts'),
		'export const POST = () => new Response();'
	);
	await writeFile(
		join(template, 'src/routes/api/chat/+server.ts'),
		`const env = { OPENROUTER_API_KEY: '' };
export function POST({ locals }: { locals: { token: string } }) {
	if (!env.OPENROUTER_API_KEY) {
		return new Response('OPENROUTER_API_KEY is not configured.', { status: 503 });
	}
	if (!locals.token) return new Response('Unauthorized.', { status: 401 });
}
`
	);
	await writeFile(join(template, 'src/convex/waitlist.ts'), 'export const waitlist = true;');
	await writeFile(
		join(template, 'src/convex/waitlist.test.ts'),
		"// @vitest-environment edge-runtime\nimport 'convex-test';\nimport 'vitest';\n"
	);
	await writeFile(
		join(template, 'src/convex/branding.ts'),
		`export const PRODUCT_LABEL = 'Product Plate';
export const PRODUCT_SENTENCE = "Built for Product Plate.";
`
	);
	await writeFile(
		join(template, 'src/routes/legal/about/+page.svelte'),
		`<script lang="ts">
	const label = 'Product Plate';
</script>

<svelte:head><title>Product Plate</title></svelte:head>
<p aria-label="Product Plate">Product Plate</p>
`
	);
	await writeFile(
		join(template, 'src/convex/_generated/ai/guidelines.md'),
		"Example only: import { convexTest } from 'convex-test'; import '@edge-runtime/vm';"
	);
	await writeFile(join(template, 'src/lib/components/ai/chat.svelte'), 'chat');
	await writeFile(join(template, 'scripts/verify-profiles.ts'), 'root maintenance only');
	await writeFile(join(template, 'scripts/prepare-release-assets.ts'), 'root release only');
	await writeFile(join(template, 'static/screenshots/demo.png'), 'image');
	await writeFile(join(template, 'static/favicon.svg'), '<svg><title>Product Plate</title></svg>');
	await writeFile(join(template, 'static/pwa-192x192.png'), 'legacy pwa icon');
	await writeFile(join(template, 'static/pwa-512x512.png'), 'legacy pwa icon');
	await writeFile(join(template, '_template_options/README.md'), 'inactive');
	await writeFile(join(template, '.git/config'), 'secret history');
	await writeFile(join(template, '.npmrc'), '//registry.npmjs.org/:_authToken=source-secret');
	await writeFile(join(template, 'private.pem'), 'source-private-key');
	await writeFile(
		join(template, '.env.example'),
		'SITE_URL=http://localhost:5173\nBETTER_AUTH_SECRET=\n'
	);
	await writeFile(join(template, 'README.md'), '# Product Plate\n');
	await writeFile(join(template, 'START_HERE.md'), '# Product Plate Kickstart\n');
	await writeFile(join(template, 'AGENTS.md'), '# Product Plate agents\n');
	await writeFile(
		join(template, 'LICENSE'),
		'Copyright (c) 2026 Product Plate contributors\n\nProduct Plate is MIT licensed.\n'
	);
	return template;
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
	);
});

describe('profile graph', () => {
	test('resolves deterministic capabilities without unrelated features', () => {
		expect(resolveProfile('prelaunch').capabilities).toEqual([
			'landing',
			'waitlist',
			'legal',
			'seo',
			'analytics',
			'errors',
			'email'
		]);
		expect(resolveProfile('ai-saas').capabilities).toContain('ai-chat');
		expect(resolveProfile('ai-saas').capabilities).not.toContain('organizations');
		expect(resolveProfile('team-saas').capabilities).toContain('organizations');
		expect(resolveProfile('team-saas').capabilities).not.toContain('ai-chat');
	});
});

describe('project generation', () => {
	test('prunes documentation-only dependencies but preserves code, config, and script tools', async () => {
		const destination = await makeTemporaryDirectory('product-plate-dependency-pruning-');
		await mkdir(join(destination, 'src/_generated'), { recursive: true });
		await writeFile(
			join(destination, 'package.json'),
			JSON.stringify({
				scripts: { check: 'script-tool --check', test: 'vitest run' },
				dependencies: { 'code-used': '1.0.0', 'docs-only': '1.0.0' },
				devDependencies: {
					'@edge-runtime/vm': '5.0.0',
					'config-plugin': '1.0.0',
					'script-tool': '1.0.0',
					vitest: '4.1.10'
				}
			})
		);
		await writeFile(
			join(destination, 'src/app.ts'),
			"// @vitest-environment edge-runtime\nimport 'code-used';\n"
		);
		await writeFile(
			join(destination, 'src/_generated/guidelines.md'),
			"Example only: import 'docs-only';\n"
		);
		await writeFile(
			join(destination, '.prettierrc'),
			JSON.stringify({ plugins: ['config-plugin'] })
		);

		await pruneUnusedDependencies(destination);

		const packageJson = await Bun.file(join(destination, 'package.json')).json();
		expect(packageJson.dependencies).toEqual({ 'code-used': '1.0.0' });
		expect(packageJson.devDependencies).toEqual({
			'@edge-runtime/vm': '5.0.0',
			'config-plugin': '1.0.0',
			'script-tool': '1.0.0',
			vitest: '4.1.10'
		});
	});

	test('rejects a template archive with the wrong checksum', async () => {
		const directory = await makeTemporaryDirectory('product-plate-checksum-');
		const archive = join(directory, 'template.tar.gz');
		await writeFile(archive, 'not the released archive');
		await expect(verifyTemplateChecksum(archive, '0'.repeat(64))).rejects.toThrow('checksum');
	});

	test('refuses to overwrite a non-empty destination', async () => {
		const templatePath = await makeTemplate();
		const destination = await makeTemporaryDirectory('product-plate-destination-');
		await writeFile(join(destination, 'keep.txt'), 'user work');

		await expect(
			generateProject({
				destination,
				templatePath,
				profile: 'prelaunch',
				name: 'Launch List',
				description: 'Collect launch interest.',
				theme: 'neutral',
				install: false,
				git: false
			})
		).rejects.toThrow('empty');
		expect(await readFile(join(destination, 'keep.txt'), 'utf8')).toBe('user work');
	});

	test('ignores excluded cache symlinks but rejects symlinks in copied source', async () => {
		const ignoredTemplate = await makeTemplate();
		const ignoredTarget = await makeTemporaryDirectory('product-plate-symlink-target-');
		await mkdir(join(ignoredTemplate, '.devenv'), { recursive: true });
		await symlink(ignoredTarget, join(ignoredTemplate, '.devenv/bash-bash'));
		await mkdir(join(ignoredTemplate, 'dist/release'), { recursive: true });
		await symlink(ignoredTarget, join(ignoredTemplate, 'dist/release/cache'));
		await symlink(join(ignoredTemplate, 'AGENTS.md'), join(ignoredTemplate, 'CLAUDE.md'));
		const ignoredDestination = join(
			await makeTemporaryDirectory('product-plate-ignored-symlink-'),
			'app'
		);
		await generateProject({
			destination: ignoredDestination,
			templatePath: ignoredTemplate,
			profile: 'prelaunch',
			name: 'Ignored Cache',
			description: 'Excluded cache links stay excluded.',
			theme: 'neutral',
			install: false,
			git: false
		});
		await expect(stat(join(ignoredDestination, '.devenv/bash-bash'))).rejects.toThrow();
		await expect(stat(join(ignoredDestination, 'dist'))).rejects.toThrow();
		await expect(stat(join(ignoredDestination, 'CLAUDE.md'))).rejects.toThrow();

		const unsafeTemplate = await makeTemplate();
		await symlink(join(unsafeTemplate, 'README.md'), join(unsafeTemplate, 'linked-readme.md'));
		const unsafeDestination = join(
			await makeTemporaryDirectory('product-plate-unsafe-symlink-'),
			'app'
		);
		await expect(
			generateProject({
				destination: unsafeDestination,
				templatePath: unsafeTemplate,
				profile: 'prelaunch',
				name: 'Unsafe Link',
				description: 'Copied links are rejected.',
				theme: 'neutral',
				install: false,
				git: false
			})
		).rejects.toThrow('symbolic link');
		expect(await Bun.file(unsafeDestination).exists()).toBe(false);
	});

	test('tracks managed state while ignoring upgrade recovery artifacts', async () => {
		const destination = join(await makeTemporaryDirectory('product-plate-upgrade-ignore-'), 'app');
		await generateProject({
			destination,
			templatePath: join(import.meta.dir, '../../..'),
			profile: 'prelaunch',
			name: 'Recovery Ignore',
			description: 'Upgrade recovery ignore fixture.',
			theme: 'neutral',
			install: false,
			git: false
		});

		const gitignore = await Bun.file(join(destination, '.gitignore')).text();
		expect(gitignore).toContain('.product-plate/backups/');
		expect(gitignore).toContain('.product-plate/transactions/');
		expect(gitignore).not.toMatch(/^\.product-plate\/$/m);
		expect(await Bun.file(join(destination, '.product-plate/managed-files.json')).exists()).toBe(
			true
		);
		const devenv = await Bun.file(join(destination, 'devenv.nix')).text();
		expect(devenv).not.toContain('verify-full.exec');
		expect(devenv).not.toContain('verify-profiles.exec');
		expect(devenv).not.toContain('verify-full   Add');
		expect(devenv).not.toContain('verify-profiles  Generate');
		const encodedBanner = Array.from(
			new TextEncoder().encode('Recovery Ignore'),
			(byte) => `\\${byte.toString(8).padStart(3, '0')}`
		).join('');
		expect(devenv).not.toContain('echo "  Product Plate"');
		expect(devenv).toContain(`printf '  ${encodedBanner}\\n'`);
		const eslintConfig = await Bun.file(join(destination, 'eslint.config.js')).text();
		expect(eslintConfig).not.toContain('docs/svelte/advanced_state_management.md');
		expect(eslintConfig).toContain('Use a Svelte store only for state shared outside');
	});

	test('keeps no-install output formatted before recording managed hashes', async () => {
		const repositoryRoot = join(import.meta.dir, '../../..');
		const destination = join(
			await makeTemporaryDirectory('product-plate-no-install-format-'),
			'app'
		);
		await generateProject({
			destination,
			templatePath: repositoryRoot,
			profile: 'prelaunch',
			name: 'No Install Proof',
			description: 'No-install formatting proof.',
			theme: 'neutral',
			install: false,
			git: false
		});

		const recordedState = await Bun.file(
			join(destination, '.product-plate/managed-files.json')
		).json();
		const check = await runRepositoryPrettier(destination, '--check');
		expect(check.exitCode, check.output).toBe(0);

		const format = await runRepositoryPrettier(destination, '--write');
		expect(format.exitCode, format.output).toBe(0);
		const stateAfterDocumentedFormat = await createManagedState(
			destination,
			recordedState.templateVersion,
			Object.keys(recordedState.files),
			recordedState.profile
		);
		expect(stateAfterDocumentedFormat.files).toEqual(recordedState.files);
	}, 30_000);

	test('validates product input before downloading a template', async () => {
		const destination = join(await makeTemporaryDirectory('product-plate-invalid-'), 'invalid');
		let downloadCalled = false;

		await expect(
			generateProject(
				{
					destination,
					profile: 'prelaunch',
					name: '💥',
					description: 'Invalid product name.',
					theme: 'neutral',
					install: false,
					git: false
				},
				{
					downloadTemplate: async () => {
						downloadCalled = true;
						throw new Error('must not download');
					}
				}
			)
		).rejects.toThrow('letter or number');
		expect(downloadCalled).toBe(false);
	});

	test.each([
		'Line\nBreak',
		'Carriage\rReturn',
		'Unicode\u2028Separator',
		'Paragraph\u2029Separator'
	])('rejects line terminators in product names before downloading: %s', async (name) => {
		const destination = join(await makeTemporaryDirectory('product-plate-invalid-name-'), 'app');
		let downloadCalled = false;

		await expect(
			generateProject(
				{
					destination,
					profile: 'prelaunch',
					name,
					description: 'Invalid multiline product name.',
					theme: 'neutral',
					install: false,
					git: false
				},
				{
					downloadTemplate: async () => {
						downloadCalled = true;
						throw new Error('must not download');
					}
				}
			)
		).rejects.toThrow('single line');
		expect(downloadCalled).toBe(false);
	});

	test.each(['Null\0Byte', 'Escape\u001bCode', 'C1\u0085Control'])(
		'rejects control characters in product names before downloading: %s',
		async (name) => {
			const destination = join(
				await makeTemporaryDirectory('product-plate-invalid-control-name-'),
				'app'
			);
			let downloadCalled = false;
			await expect(
				generateProject(
					{
						destination,
						profile: 'prelaunch',
						name,
						description: 'Invalid control character product name.',
						theme: 'neutral',
						install: false,
						git: false
					},
					{
						downloadTemplate: async () => {
							downloadCalled = true;
							throw new Error('must not download');
						}
					}
				)
			).rejects.toThrow('control characters');
			expect(downloadCalled).toBe(false);
		}
	);

	test('cleans an owned download when template validation fails', async () => {
		const downloadedParent = await makeTemporaryDirectory('product-plate-downloaded-');
		const downloadedRoot = join(downloadedParent, 'download');
		const templatePath = join(downloadedRoot, 'template');
		await mkdir(templatePath, { recursive: true });
		const destination = join(downloadedParent, 'app');
		await expect(
			generateProject(
				{
					destination,
					profile: 'prelaunch',
					name: 'Cleanup Test',
					description: 'Cleanup a failed download.',
					theme: 'neutral',
					install: false,
					git: false
				},
				{
					downloadTemplate: async () => ({ path: templatePath, cleanup: downloadedRoot })
				}
			)
		).rejects.toThrow('package.json');
		await expect(stat(downloadedRoot)).rejects.toThrow();
	});

	test('keeps generated source when an optional finishing step fails', async () => {
		const templatePath = await makeTemplate();
		const destination = join(await makeTemporaryDirectory('product-plate-finishing-'), 'app');

		await expect(
			generateProject(
				{
					destination,
					templatePath,
					profile: 'prelaunch',
					name: 'Keep Me',
					description: 'Generated source should survive.',
					theme: 'neutral',
					install: true,
					git: false
				},
				{
					runCommand: async (command, _cwd, label) => {
						expect(command[0]).toBe(process.execPath);
						if (label === 'Generated source formatting') throw new Error('formatter failed');
					}
				}
			)
		).rejects.toThrow('source was kept');
		expect(await Bun.file(join(destination, 'product-plate.json')).exists()).toBe(true);
		expect(await Bun.file(join(destination, 'src/routes/+page.svelte')).exists()).toBe(true);
	});

	test('generates a lean prelaunch project and exact manifest', async () => {
		const templatePath = await makeTemplate();
		const parent = await makeTemporaryDirectory('product-plate-output-');
		const destination = join(parent, 'launch-list');

		const result = await generateProject({
			destination,
			templatePath,
			profile: 'prelaunch',
			name: 'Launch List',
			description: 'Collect launch interest.',
			theme: 'neutral',
			install: false,
			git: false,
			templateVersion: '0.2.0',
			generatorVersion: '0.2.0'
		});

		expect(result.manifest).toEqual({
			schemaVersion: 1,
			generatorVersion: '0.2.0',
			templateVersion: '0.2.0',
			profile: 'prelaunch',
			product: {
				name: 'Launch List',
				slug: 'launch-list',
				description: 'Collect launch interest.',
				productionUrl: null
			},
			theme: 'neutral',
			capabilities: ['landing', 'waitlist', 'legal', 'seo', 'analytics', 'errors', 'email'],
			providers: {
				data: 'convex',
				auth: 'none',
				billing: 'none',
				email: 'resend',
				analytics: 'posthog',
				errors: 'sentry',
				hosting: 'cloudflare-pages'
			}
		});
		expect(await Bun.file(join(destination, 'src/lib/constants.ts')).text()).toContain(
			'Launch List'
		);
		expect(await Bun.file(join(destination, 'src/lib/constants.ts')).text()).toContain(
			"APP_OG_IMAGE_PATH = '/og.svg'"
		);
		expect(await Bun.file(join(destination, 'product-plate.json')).json()).toEqual(result.manifest);
		expect(await Bun.file(join(destination, 'package.json')).json()).toMatchObject({
			name: 'launch-list',
			private: true
		});
		const localEnvironment = await Bun.file(join(destination, '.env.local')).text();
		expect(localEnvironment).toContain('PUBLIC_CONVEX_URL=https://your-project.convex.cloud');
		expect(localEnvironment).toContain('PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site');
		expect(localEnvironment).toMatch(/WAITLIST_FINGERPRINT_SECRET=.{32,}/);
		expect(await Bun.file(join(destination, 'src/routes/auth/demo/+page.svelte')).exists()).toBe(
			false
		);
		expect(
			await Bun.file(join(destination, 'src/routes/(app)/assistant/+page.svelte')).exists()
		).toBe(false);
		expect(await Bun.file(join(destination, '_template_options/README.md')).exists()).toBe(false);
		expect(await Bun.file(join(destination, '.git/config')).exists()).toBe(false);
		expect(await Bun.file(join(destination, '.npmrc')).exists()).toBe(false);
		expect(await Bun.file(join(destination, 'bun.lock')).exists()).toBe(false);
		const generatedReadme = await Bun.file(join(destination, 'README.md')).text();
		expect(generatedReadme).toContain('initialized with `--no-install`');
		expect(generatedReadme).toContain('run `bun install` and commit the new `bun.lock`');
		expect(generatedReadme).not.toContain('bun install && bun run format');
		expect(generatedReadme).toContain('generated CI uses a frozen lockfile');
		expect(await Bun.file(join(destination, 'private.pem')).exists()).toBe(false);
		expect(await Bun.file(join(destination, 'static/screenshots/demo.png')).exists()).toBe(false);
		const appHtml = await Bun.file(join(destination, 'src/app.html')).text();
		expect(appHtml).not.toContain('data-product-plate-theme-pending');
		expect(appHtml).not.toContain('analytics.example.com');
		const packageJson = await Bun.file(join(destination, 'package.json')).json();
		expect(packageJson.scripts.prepare).toBe('svelte-kit sync');
		expect(packageJson.dependencies).not.toHaveProperty('better-auth');
		expect(packageJson.dependencies).not.toHaveProperty('@useautumn/convex');
		expect(packageJson.dependencies).not.toHaveProperty('@ai-sdk/svelte');
		expect(packageJson.dependencies).not.toHaveProperty('@threlte/core');
		expect(packageJson.devDependencies).toHaveProperty('@edge-runtime/vm');
		expect(packageJson.devDependencies).toHaveProperty('convex-test');
		expect(packageJson.devDependencies).not.toHaveProperty('@vite-pwa/sveltekit');
		expect(packageJson.devDependencies).not.toHaveProperty('vite-plugin-pwa');
		expect(packageJson.devDependencies).not.toHaveProperty('workbox-window');
		expect(packageJson.devDependencies).toHaveProperty('prettier-plugin-svelte');
		expect(packageJson.devDependencies).toHaveProperty('typescript');
		expect(await Bun.file(join(destination, 'src/app.d.ts')).text()).not.toContain(
			'vite-plugin-pwa'
		);
		expect(await Bun.file(join(destination, 'LICENSE')).text()).toContain(
			'Copyright (c) 2026 Product Plate contributors'
		);
		expect(await Bun.file(join(destination, 'static/og.svg')).text()).toContain('Launch List');
		expect(await Bun.file(join(destination, 'static/og.png')).exists()).toBe(false);
		expect(await Bun.file(join(destination, 'static/pwa-192x192.png')).exists()).toBe(true);
		expect(await Bun.file(join(destination, 'static/pwa-512x512.png')).exists()).toBe(false);
		expect(await Bun.file(join(destination, 'src/app.html')).text()).toContain(
			'<link rel="apple-touch-icon" href="/pwa-192x192.png" />'
		);
		const managedState = await Bun.file(
			join(destination, '.product-plate/managed-files.json')
		).json();
		expect(Object.keys(managedState.files)).toEqual(
			expect.arrayContaining([
				'scripts/provision-runtime.ts',
				'src/convex/readiness.ts',
				'src/routes/api/health/+server.ts'
			])
		);
	});

	test('writes special-character product names safely in every generated format', async () => {
		const templatePath = await makeTemplate();
		const destination = join(await makeTemporaryDirectory('product-plate-replacement-'), 'app');
		const productName = `Bob's "R&D" <Lab> $&`;
		await generateProject({
			destination,
			templatePath,
			profile: 'prelaunch',
			name: productName,
			description: 'Literal replacement markers.',
			theme: 'neutral',
			install: false,
			git: false
		});

		expect((await Bun.file(join(destination, 'product-plate.json')).json()).product.name).toBe(
			productName
		);
		const constants = await Bun.file(join(destination, 'src/lib/constants.ts')).text();
		new Bun.Transpiler({ loader: 'ts' }).transformSync(constants);
		const constantsModule = await import(
			`${pathToFileURL(join(destination, 'src/lib/constants.ts')).href}?test=${Date.now()}`
		);
		expect(constantsModule.APP_NAME).toBe(productName);

		const branding = await Bun.file(join(destination, 'src/convex/branding.ts')).text();
		new Bun.Transpiler({ loader: 'ts' }).transformSync(branding);
		const brandingModule = await import(
			`${pathToFileURL(join(destination, 'src/convex/branding.ts')).href}?test=${Date.now()}`
		);
		expect(brandingModule.PRODUCT_LABEL).toBe(productName);
		expect(brandingModule.PRODUCT_SENTENCE).toBe(`Built for ${productName}.`);

		const escapedXml = 'Bob&apos;s &quot;R&amp;D&quot; &lt;Lab&gt; $&amp;';
		const page = await Bun.file(join(destination, 'src/routes/legal/about/+page.svelte')).text();
		expect(page).toContain(`const label = 'Bob\\'s "R&D" <Lab> $&';`);
		expect(page).toContain('aria-label="Bob&apos;s &quot;R&amp;D&quot; &lt;Lab&gt; $&amp;"');
		expect(page).toMatch(new RegExp(`>\\s*${escapedXml.replace('$', '\\$')}\\s*</p>`));

		expect(await Bun.file(join(destination, 'static/favicon.svg')).text()).toContain(escapedXml);
		expect(await Bun.file(join(destination, 'static/og.svg')).text()).toContain(escapedXml);

		const environment = await Bun.file(join(destination, '.env.example')).text();
		const expectedSender = `TRANSACTIONAL_EMAIL_FROM="Bob's \\"R&D\\" <Lab> $& <no-reply@example.com>"`;
		expect(environment).toContain(expectedSender);
		expect(await Bun.file(join(destination, '.env.server.example')).text()).toContain(
			expectedSender
		);
		expect(await Bun.file(join(destination, '.env.local')).text()).toContain(expectedSender);
		expect(await Bun.file(join(destination, 'README.md')).text()).toContain(
			`# Bob's "R&amp;D" &lt;Lab&gt; $&amp;`
		);
		expect(await Bun.file(join(destination, '.github/workflows/deploy.yml')).text()).not.toContain(
			productName
		);
	});

	test('keeps team features only for team SaaS', async () => {
		const templatePath = await makeTemplate();
		const parent = await makeTemporaryDirectory('product-plate-team-');
		const destination = join(parent, 'team-product');

		await generateProject({
			destination,
			templatePath,
			profile: 'team-saas',
			name: 'Team Product',
			description: 'Shared work for teams.',
			theme: 'claude',
			install: false,
			git: false
		});

		const localEnvironment = await Bun.file(join(destination, '.env.local')).text();
		expect(localEnvironment).toContain('PUBLIC_CONVEX_URL=https://your-project.convex.cloud');
		expect(localEnvironment).toMatch(/BETTER_AUTH_SECRET=.{32,}/);

		expect(
			await Bun.file(join(destination, 'src/routes/(app)/workspace/+page.svelte')).exists()
		).toBe(true);
		expect(
			await Bun.file(join(destination, 'src/routes/(app)/assistant/+page.svelte')).exists()
		).toBe(false);
		expect(await Bun.file(join(destination, 'src/routes/(app)/map/+page.svelte')).exists()).toBe(
			false
		);
	});

	test('generates all four profile contracts without cross-profile routes or branding', async () => {
		const templatePath = await makeTemplate();
		const parent = await makeTemporaryDirectory('product-plate-all-profiles-');
		for (const profile of ['prelaunch', 'solo-saas', 'team-saas', 'ai-saas'] as const) {
			const destination = join(parent, profile);
			await generateProject({
				destination,
				templatePath,
				profile,
				name: `Contract ${profile}`,
				description: 'Profile contract fixture.',
				theme: 'neutral',
				install: false,
				git: false
			});
			const generatedManifest = await Bun.file(join(destination, 'product-plate.json')).json();
			const generatedPackage = await Bun.file(join(destination, 'package.json')).json();
			expect(generatedManifest.profile).toBe(profile);
			expect(generatedPackage.devDependencies).toHaveProperty('vitest');
			if (profile === 'prelaunch') {
				expect(generatedPackage.devDependencies).toHaveProperty('@edge-runtime/vm', '1.0.0');
				expect(generatedPackage.devDependencies).toHaveProperty('convex-test', '1.0.0');
			} else {
				expect(generatedPackage.devDependencies).not.toHaveProperty('@edge-runtime/vm');
				expect(generatedPackage.devDependencies).not.toHaveProperty('convex-test');
			}
			expect(await Bun.file(join(destination, 'src/routes/auth/demo/+page.svelte')).exists()).toBe(
				false
			);
			expect(await Bun.file(join(destination, 'scripts/verify-profiles.ts')).exists()).toBe(false);
			expect(await Bun.file(join(destination, 'scripts/prepare-release-assets.ts')).exists()).toBe(
				false
			);
			expect(
				await Bun.file(join(destination, 'src/routes/(app)/workspace/+page.svelte')).exists()
			).toBe(profile === 'team-saas');
			expect(
				await Bun.file(join(destination, 'src/routes/(app)/assistant/+page.svelte')).exists()
			).toBe(profile === 'ai-saas');
			expect(await Bun.file(join(destination, 'src/routes/api/waitlist/+server.ts')).exists()).toBe(
				profile === 'prelaunch'
			);
			expect(await Bun.file(join(destination, 'static/favicon.svg')).text()).not.toContain(
				'Product Plate'
			);
			const browserTest = await Bun.file(join(destination, 'e2e/profile.test.ts')).text();
			if (profile === 'prelaunch') {
				expect(browserTest).toContain('landing and waitlist');
				expect(browserTest).toContain('touch-sized waitlist controls');
			} else {
				expect(browserTest).toContain('password recovery surfaces');
				expect(browserTest).toContain('touch-sized authentication controls');
			}
			if (profile === 'ai-saas') {
				expect(browserTest).toContain('unauthenticated AI request fails safely');
				expect(browserTest).toContain('expect(response.status()).toBe(401)');
				expect(browserTest).not.toContain('OPENROUTER_API_KEY is not configured');
				const chatRoute = await Bun.file(
					join(destination, 'src/routes/api/chat/+server.ts')
				).text();
				expect(chatRoute.indexOf('if (!locals.token)')).toBeLessThan(
					chatRoute.indexOf('if (!env.OPENROUTER_API_KEY)')
				);
			}
			const deployWorkflow = await Bun.file(
				join(destination, '.github/workflows/deploy.yml')
			).text();
			const generatedReadme = await Bun.file(join(destination, 'README.md')).text();
			expect(generatedReadme).toContain('TRANSACTIONAL_EMAIL_FROM');
			expect(generatedReadme).toContain('PUBLIC_POSTHOG_KEY');
			expect(generatedReadme).toContain('PUBLIC_SENTRY_DSN');
			expect(generatedReadme).toContain('SUPPORT_EMAIL');
			expect(generatedReadme).toContain('product.productionUrl');
			expect(generatedReadme).toContain('creates a missing project');
			expect(generatedReadme).not.toContain('derives `PRODUCT_NAME` and the default sender');
			expect(deployWorkflow.includes('WAITLIST_EXPORT_SECRET')).toBe(profile === 'prelaunch');
			expect(deployWorkflow.includes('BETTER_AUTH_SECRET')).toBe(profile !== 'prelaunch');
			expect(deployWorkflow.includes('AUTUMN_SECRET_KEY')).toBe(profile !== 'prelaunch');
			expect(deployWorkflow.includes('OPENROUTER_API_KEY')).toBe(profile === 'ai-saas');
			expect(deployWorkflow).toContain('environment: ${{');
			expect(deployWorkflow).toContain('DEPLOY_ENV: ${{');
			expect(deployWorkflow).toContain('CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}');
			expect(deployWorkflow).toContain(
				'TRANSACTIONAL_EMAIL_FROM: ${{ vars.TRANSACTIONAL_EMAIL_FROM }}'
			);
			expect(deployWorkflow).not.toContain('CONVEX_PRODUCTION_DEPLOY_KEY');
			expect(deployWorkflow).not.toContain('CONVEX_PREVIEW_DEPLOY_KEY');
			expect(deployWorkflow).not.toContain("format('https://{0}.{1}.pages.dev'");
			expect(deployWorkflow).toContain(
				"SITE_URL: ${{ github.event_name == 'pull_request' && 'http://localhost:5173' || vars.SITE_URL }}"
			);
			expect(deployWorkflow).toContain(
				"BETTER_AUTH_URL: ${{ github.event_name == 'pull_request' && 'http://localhost:5173' || vars.SITE_URL }}"
			);
			expect(deployWorkflow).not.toContain("github.event_name == 'pull_request' && ''");
			expect(deployWorkflow).toContain('steps.cloudflare.outputs.deployment-url');
			expect(deployWorkflow).toContain('- name: Preview launch doctor');
			expect(deployWorkflow).toContain("if: github.event_name == 'pull_request'");
			expect(deployWorkflow).toContain('- name: Strict production source preflight');
			expect(deployWorkflow).toContain("if: github.event_name != 'pull_request'");
			expect(deployWorkflow.match(/bun run doctor -- --strict/g)).toHaveLength(1);
			const convexDeployIndex = deployWorkflow.indexOf('bun convex deploy');
			const strictPreflightIndex = deployWorkflow.indexOf(
				'- name: Strict production source preflight'
			);
			const provisionIndex = deployWorkflow.indexOf(
				'bun scripts/provision-runtime.ts',
				convexDeployIndex
			);
			const cloudflareDeployIndex = deployWorkflow.indexOf('pages deploy');
			expect(convexDeployIndex).toBeGreaterThan(-1);
			expect(strictPreflightIndex).toBeGreaterThan(-1);
			expect(strictPreflightIndex).toBeLessThan(convexDeployIndex);
			expect(deployWorkflow.slice(strictPreflightIndex, convexDeployIndex)).toContain(
				'RUNTIME_TARGET: validate'
			);
			expect(deployWorkflow.slice(strictPreflightIndex, convexDeployIndex)).toContain(
				'bun scripts/provision-runtime.ts'
			);
			expect(provisionIndex).toBeGreaterThan(convexDeployIndex);
			expect(cloudflareDeployIndex).toBeGreaterThan(provisionIndex);

			const provisionRuntime = await Bun.file(
				join(destination, 'scripts/provision-runtime.ts')
			).text();
			expect(provisionRuntime).not.toContain("'--env', deployEnvironment");
			expect(provisionRuntime).toContain("'pages', 'project', 'list', '--json'");
			expect(provisionRuntime).toMatch(/'pages',\s*'project',\s*'create'/);
			expect(provisionRuntime).toMatch(/'pages',\s*'secret',\s*'put'/);
			expect(provisionRuntime).toContain("'convex', 'env', 'set'");
			expect(provisionRuntime).toContain("stdin: 'pipe'");
			expect(provisionRuntime).not.toContain('no-reply@example.com');
			expect(provisionRuntime.includes('WAITLIST_FINGERPRINT_SECRET')).toBe(
				profile === 'prelaunch'
			);
			expect(provisionRuntime.includes('BETTER_AUTH_SECRET')).toBe(profile !== 'prelaunch');
			expect(provisionRuntime.includes('OPENROUTER_API_KEY')).toBe(profile === 'ai-saas');
			const provisionModule = await import(
				`${pathToFileURL(join(destination, 'scripts/provision-runtime.ts')).href}?profile=${profile}`
			);
			const runtimeEnvironment = {
				DEPLOY_ENV: 'preview',
				CONVEX_DEPLOY_KEY: 'preview-deploy-key',
				CLOUDFLARE_PROJECT_NAME: 'runtime-project',
				PUBLIC_CONVEX_URL: 'https://preview.convex.cloud',
				PUBLIC_CONVEX_SITE_URL: 'https://preview.convex.site',
				SITE_URL: 'https://preview.runtime-project.pages.dev',
				BETTER_AUTH_URL: 'https://preview.runtime-project.pages.dev',
				BETTER_AUTH_SECRET: 'preview-auth-secret',
				AUTH_REQUIRE_EMAIL_VERIFICATION: 'false',
				AUTH_MAGIC_LINK_ENABLED: 'false',
				AUTUMN_SECRET_KEY: 'sandbox-autumn-key',
				RESEND_API_KEY: 'sandbox-resend-key',
				TRANSACTIONAL_EMAIL_FROM: 'Runtime <mail@runtime-product.dev>',
				PRODUCT_NAME: 'Runtime',
				OPENROUTER_API_KEY: 'sandbox-openrouter-key',
				WAITLIST_FINGERPRINT_SECRET: 'preview-fingerprint-secret',
				WAITLIST_EXPORT_SECRET: 'preview-export-secret'
			};
			const invocations: Array<{ command: Array<string>; input: string; label: string }> = [];
			await provisionModule.provisionRuntime({
				environment: runtimeEnvironment,
				projectExists: async () => false,
				run: async (invocation: { command: Array<string>; input: string; label: string }) => {
					invocations.push(invocation);
				}
			});
			expect(invocations.some(({ command }) => command.includes('convex'))).toBe(true);
			expect(invocations.some(({ command }) => command.includes('wrangler@4.110.0'))).toBe(true);
			const createProjectIndex = invocations.findIndex(({ command }) => command.includes('create'));
			const firstSecretIndex = invocations.findIndex(({ command }) => command.includes('secret'));
			expect(createProjectIndex).toBeGreaterThan(-1);
			expect(createProjectIndex).toBeLessThan(firstSecretIndex);
			expect(invocations[createProjectIndex]?.command.join(' ')).toContain(
				'pages project create runtime-project --production-branch main'
			);
			for (const invocation of invocations) {
				expect(invocation.command).not.toContain(invocation.input);
				if (invocation.command.includes('convex')) {
					expect(invocation.command.join(' ')).toContain('convex env set');
					expect(invocation.command).not.toContain('--deployment');
				} else if (invocation.command.includes('secret')) {
					expect(invocation.command.join(' ')).toContain('--project-name runtime-project');
					expect(invocation.command).not.toContain('--env');
				}
			}
			const existingProjectInvocations: Array<{
				command: Array<string>;
				input: string;
				label: string;
			}> = [];
			await provisionModule.provisionRuntime({
				environment: {
					...runtimeEnvironment,
					RUNTIME_TARGET: 'cloudflare'
				},
				projectExists: async (projectName: string) => projectName === 'runtime-project',
				run: async (invocation: { command: Array<string>; input: string; label: string }) => {
					existingProjectInvocations.push(invocation);
				}
			});
			expect(existingProjectInvocations.some(({ command }) => command.includes('create'))).toBe(
				false
			);
			expect(existingProjectInvocations.some(({ command }) => command.includes('secret'))).toBe(
				true
			);
			const validationInvocations: Array<{
				command: Array<string>;
				input: string;
				label: string;
			}> = [];
			await provisionModule.provisionRuntime({
				environment: { ...runtimeEnvironment, RUNTIME_TARGET: 'validate' },
				projectExists: async () => {
					throw new Error('validation must not call Cloudflare');
				},
				run: async (invocation: { command: Array<string>; input: string; label: string }) => {
					validationInvocations.push(invocation);
				}
			});
			expect(validationInvocations).toEqual([]);
			await expect(
				provisionModule.provisionRuntime({
					environment: {
						...runtimeEnvironment,
						RUNTIME_TARGET: 'cloudflare',
						TRANSACTIONAL_EMAIL_FROM: 'Runtime <no-reply@example.com>'
					},
					projectExists: async () => true,
					run: async () => undefined
				})
			).rejects.toThrow('valid, non-placeholder email address');

			const readinessRoute = await Bun.file(
				join(destination, 'src/routes/api/health/+server.ts')
			).text();
			expect(readinessRoute).toContain("makeFunctionReference<'query'");
			expect(readinessRoute).toContain("'readiness:check'");
			expect(readinessRoute).toContain('const runtimeEnvironment = {');
			expect(readinessRoute).not.toContain('publicEnv[name]');
			expect(readinessRoute).toContain('TRANSACTIONAL_EMAIL_FROM');
			expect(readinessRoute).not.toContain('missing }, { status: 503');
			const readinessQuery = await Bun.file(join(destination, 'src/convex/readiness.ts')).text();
			expect(readinessQuery).toContain('requiredEnvironment.every');

			const smokeDeploy = await Bun.file(join(destination, 'scripts/smoke-deploy.ts')).text();
			expect(smokeDeploy).toContain('/api/health');
			expect(smokeDeploy.includes('/api/waitlist')).toBe(profile === 'prelaunch');
			expect(smokeDeploy.includes('/api/auth/get-session')).toBe(profile !== 'prelaunch');
			expect(smokeDeploy.includes('/api/chat')).toBe(profile === 'ai-saas');
			if (profile === 'prelaunch') {
				const serverHooks = await Bun.file(join(destination, 'src/hooks.server.ts')).text();
				expect(serverHooks).toContain('initCloudflareSentryHandle');
				expect(serverHooks).not.toContain('init, sentryHandle');
				expect(serverHooks.match(/const resolved = await resolve\(event\);/g)).toHaveLength(1);
				expect(browserTest.match(/const emailBox/g)).toHaveLength(1);
			}
			const qualityWorkflow = await Bun.file(
				join(destination, '.github/workflows/quality.yml')
			).text();
			expect(qualityWorkflow).not.toContain('jobs:\njobs:');
			expect(qualityWorkflow).toContain('bun run test:e2e');
			expect(qualityWorkflow).toContain('bun-version: 1.3.13');
		}
	});
});
