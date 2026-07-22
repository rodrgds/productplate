import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateProject, verifyTemplateChecksum } from './generator.ts';
import { resolveProfile } from './profiles.ts';

const temporaryDirectories: Array<string> = [];

async function makeTemporaryDirectory(prefix: string) {
	const directory = await mkdtemp(join(tmpdir(), prefix));
	temporaryDirectories.push(directory);
	return directory;
}

async function makeTemplate() {
	const template = await makeTemporaryDirectory('product-plate-template-');
	await mkdir(join(template, 'src/routes/auth/demo'), { recursive: true });
	await mkdir(join(template, 'src/routes/(app)/assistant'), { recursive: true });
	await mkdir(join(template, 'src/routes/(app)/workspace'), { recursive: true });
	await mkdir(join(template, 'src/routes/(app)/map'), { recursive: true });
	await mkdir(join(template, 'src/routes/api/waitlist'), { recursive: true });
	await mkdir(join(template, 'src/convex'), { recursive: true });
	await mkdir(join(template, 'src/lib/components/ai'), { recursive: true });
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
			}
		})
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
	await writeFile(join(template, 'src/convex/waitlist.ts'), 'export const waitlist = true;');
	await writeFile(join(template, 'src/lib/components/ai/chat.svelte'), 'chat');
	await writeFile(join(template, 'static/screenshots/demo.png'), 'image');
	await writeFile(join(template, 'static/favicon.svg'), '<svg><title>Product Plate</title></svg>');
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
		expect(await Bun.file(join(destination, 'product-plate.json')).json()).toEqual(result.manifest);
		expect(await Bun.file(join(destination, 'package.json')).json()).toMatchObject({
			name: 'launch-list',
			private: true
		});
		expect(await Bun.file(join(destination, '.env.local')).text()).toMatch(
			/WAITLIST_FINGERPRINT_SECRET=.{32,}/
		);
		expect(await Bun.file(join(destination, 'src/routes/auth/demo/+page.svelte')).exists()).toBe(
			false
		);
		expect(
			await Bun.file(join(destination, 'src/routes/(app)/assistant/+page.svelte')).exists()
		).toBe(false);
		expect(await Bun.file(join(destination, '_template_options/README.md')).exists()).toBe(false);
		expect(await Bun.file(join(destination, '.git/config')).exists()).toBe(false);
		expect(await Bun.file(join(destination, '.npmrc')).exists()).toBe(false);
		expect(await Bun.file(join(destination, 'private.pem')).exists()).toBe(false);
		expect(await Bun.file(join(destination, 'static/screenshots/demo.png')).exists()).toBe(false);
		const appHtml = await Bun.file(join(destination, 'src/app.html')).text();
		expect(appHtml).not.toContain('data-product-plate-theme-pending');
		expect(appHtml).not.toContain('analytics.example.com');
		const packageJson = await Bun.file(join(destination, 'package.json')).json();
		expect(packageJson.dependencies).not.toHaveProperty('better-auth');
		expect(packageJson.dependencies).not.toHaveProperty('@useautumn/convex');
		expect(packageJson.dependencies).not.toHaveProperty('@ai-sdk/svelte');
		expect(packageJson.dependencies).not.toHaveProperty('@threlte/core');
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
			expect(generatedManifest.profile).toBe(profile);
			expect(await Bun.file(join(destination, 'src/routes/auth/demo/+page.svelte')).exists()).toBe(
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
			if (profile === 'prelaunch') expect(browserTest).toContain('landing and waitlist');
			else expect(browserTest).toContain('password recovery surfaces');
			if (profile === 'ai-saas') expect(browserTest).toContain('missing AI provider');
			const deployWorkflow = await Bun.file(
				join(destination, '.github/workflows/deploy.yml')
			).text();
			expect(deployWorkflow.includes('WAITLIST_EXPORT_SECRET')).toBe(profile === 'prelaunch');
			expect(deployWorkflow.includes('BETTER_AUTH_SECRET')).toBe(profile !== 'prelaunch');
			expect(deployWorkflow.includes('AUTUMN_SECRET_KEY')).toBe(profile !== 'prelaunch');
			expect(deployWorkflow.includes('OPENROUTER_API_KEY')).toBe(profile === 'ai-saas');
			const qualityWorkflow = await Bun.file(
				join(destination, '.github/workflows/quality.yml')
			).text();
			expect(qualityWorkflow).not.toContain('jobs:\njobs:');
			expect(qualityWorkflow).toContain('bun run test:e2e');
		}
	});
});
