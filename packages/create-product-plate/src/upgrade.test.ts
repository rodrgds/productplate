import { afterEach, describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	applyUpgrade,
	createLegacyUpgradeBootstrap,
	createManagedState,
	DEFAULT_UPGRADE_MANIFEST_URL,
	downloadUpgradeFiles,
	isNewerVersion,
	loadUpgradeRelease,
	planUpgrade,
	releaseMigrationInstruction,
	runUpgradeCommand
} from './upgrade.ts';
import type { ProductPlateManifest } from './types.ts';

const temporaryDirectories: Array<string> = [];

function sha256(content: string) {
	return createHash('sha256').update(content).digest('hex');
}

interface ReleasedV1UpgradeManifest {
	schemaVersion: 1;
	version: string;
	migrations: Array<string>;
	securityFixes: Array<string>;
	files: Record<string, { content?: string; url?: string; sha256: string }>;
}

function parseWithReleasedV1Client(input: unknown) {
	const release = input as ReleasedV1UpgradeManifest;
	if (release.schemaVersion !== 1 || !/^\d+\.\d+\.\d+/.test(release.version)) {
		throw new Error('The upgrade release manifest is invalid.');
	}
	return release;
}

async function planWithReleasedV1Client(cwd: string, release: ReleasedV1UpgradeManifest) {
	const state = (await Bun.file(join(cwd, '.product-plate/managed-files.json')).json()) as {
		files: Record<string, string>;
	};
	const updates: Array<string> = [];
	const conflicts: Array<string> = [];
	for (const [file, asset] of Object.entries(release.files)) {
		const content = asset.content ?? '';
		expect(sha256(content)).toBe(asset.sha256);
		const previousChecksum = state.files[file];
		const actual = (await Bun.file(join(cwd, file)).exists())
			? sha256(await Bun.file(join(cwd, file)).text())
			: null;
		if (!previousChecksum && actual === null) updates.push(file);
		else if (!previousChecksum || actual !== previousChecksum) conflicts.push(file);
		else if (actual !== sha256(content)) updates.push(file);
	}
	return { updates, conflicts };
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
	);
});

describe('managed upgrades', () => {
	test('links conflict recovery to the tagged migration guide', () => {
		expect(releaseMigrationInstruction('1.2.3', 'rodrgds/productplate')).toBe(
			'Read https://github.com/rodrgds/productplate/blob/v1.2.3/docs/migrations/v1.2.3.md before applying modified infrastructure by hand.'
		);
	});

	test('keeps the latest legacy endpoint parseable but unable to apply profile-blind files', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-v1-bootstrap-'));
		temporaryDirectories.push(cwd);
		await mkdir(join(cwd, '.product-plate'), { recursive: true });
		await writeFile(join(cwd, 'product-plate.json'), '{"templateVersion":"1.0.0"}\n');
		await writeFile(
			join(cwd, '.product-plate/managed-files.json'),
			JSON.stringify({ schemaVersion: 1, templateVersion: '1.0.0', files: {} })
		);

		const bootstrap = parseWithReleasedV1Client(createLegacyUpgradeBootstrap('1.1.0'));
		const plan = await planWithReleasedV1Client(cwd, bootstrap);
		expect(plan).toEqual({
			updates: [],
			conflicts: ['.product-plate/managed-files.json']
		});
		expect(bootstrap.migrations.join(' ')).toContain('create-product-plate@latest');
		expect(DEFAULT_UPGRADE_MANIFEST_URL).toEndWith('product-plate-upgrade-v2.json');
	});

	test('compares versions and rejects tampered release assets', async () => {
		expect(isNewerVersion('0.3.9', '0.4.0')).toBe(true);
		expect(isNewerVersion('1.0.0', '0.4.0')).toBe(false);
		expect(isNewerVersion('1.0.0-beta.1', '1.0.0')).toBe(true);
		expect(isNewerVersion('1.0.0-beta.2', '1.0.0-beta.10')).toBe(true);
		expect(isNewerVersion('1.0.0', '1.0.0-beta.1')).toBe(false);
		expect(isNewerVersion('1.0.0-alpha', '1.0.0-alpha-beta')).toBe(true);
		expect(isNewerVersion('1.0.0-alpha-beta.2', '1.0.0-alpha-beta.10')).toBe(true);
		expect(isNewerVersion('1.0.0-alpha-beta+build.1', '1.0.0-alpha-beta+build.2')).toBe(false);
		await expect(
			downloadUpgradeFiles(
				{
					schemaVersion: 2,
					version: '0.3.0',
					compatibleProductSchemaVersions: [1],
					migrations: [],
					securityFixes: [],
					profiles: {
						prelaunch: {
							files: { 'managed.txt': { content: 'tampered', sha256: '0'.repeat(64) } }
						},
						'solo-saas': { files: {} },
						'team-saas': { files: {} },
						'ai-saas': { files: {} }
					}
				},
				'prelaunch'
			)
		).rejects.toThrow('Checksum mismatch');
	});

	test.each(['../escaped.txt', '..\\escaped.txt', '/tmp/escaped.txt', 'bad\0path'])(
		'rejects unsafe managed manifest path %s',
		async (unsafePath) => {
			const cwd = await mkdtemp(join(tmpdir(), 'product-plate-release-'));
			temporaryDirectories.push(cwd);
			const manifestPath = join(cwd, 'release.json');
			await writeFile(
				manifestPath,
				JSON.stringify({
					schemaVersion: 2,
					version: '1.1.0',
					compatibleProductSchemaVersions: [1],
					migrations: [],
					securityFixes: [],
					profiles: {
						prelaunch: {
							files: {
								[unsafePath]: { content: 'escape', sha256: '0'.repeat(64) }
							}
						},
						'solo-saas': { files: {} },
						'team-saas': { files: {} },
						'ai-saas': { files: {} }
					}
				})
			);

			await expect(loadUpgradeRelease(manifestPath)).rejects.toThrow('managed path');
		}
	);

	test('rejects managed files below symlinked directories', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-symlink-'));
		const outside = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-outside-'));
		temporaryDirectories.push(cwd, outside);
		await mkdir(join(cwd, '.product-plate'), { recursive: true });
		await symlink(outside, join(cwd, 'managed'));
		await writeFile(
			join(cwd, '.product-plate/managed-files.json'),
			JSON.stringify({
				schemaVersion: 2,
				templateVersion: '1.0.0',
				profile: 'prelaunch',
				files: {}
			})
		);

		await expect(
			planUpgrade({
				cwd,
				fromVersion: '1.0.0',
				toVersion: '1.1.0',
				profile: 'prelaunch',
				files: { 'managed/outside.txt': 'unsafe' }
			})
		).rejects.toThrow('symbolic link');
		expect(await Bun.file(join(outside, 'outside.txt')).exists()).toBe(false);
	});

	test('updates unchanged managed files but refuses modified product files', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-'));
		temporaryDirectories.push(cwd);
		await mkdir(join(cwd, '.product-plate'), { recursive: true });
		await writeFile(join(cwd, 'managed.txt'), 'old managed\n');
		await writeFile(join(cwd, 'product.txt'), 'old product\n');
		const state = await createManagedState(
			cwd,
			'0.2.0',
			['managed.txt', 'product.txt'],
			'prelaunch'
		);
		await writeFile(join(cwd, '.product-plate/managed-files.json'), JSON.stringify(state));
		await writeFile(join(cwd, 'product.txt'), 'founder changed this\n');

		const plan = await planUpgrade({
			cwd,
			fromVersion: '0.2.0',
			toVersion: '0.3.0',
			profile: 'prelaunch',
			files: {
				'managed.txt': 'new managed\n',
				'product.txt': 'new product\n'
			}
		});

		expect(plan.updates).toEqual(['managed.txt']);
		expect(plan.conflicts).toEqual(['product.txt']);
		await expect(applyUpgrade(plan)).rejects.toThrow('conflicts');
		expect(await readFile(join(cwd, 'managed.txt'), 'utf8')).toBe('old managed\n');
		expect(await readFile(join(cwd, 'product.txt'), 'utf8')).toBe('founder changed this\n');
	});

	test('adds runtime readiness files when upgrading a legacy four-file managed state', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-runtime-'));
		temporaryDirectories.push(cwd);
		const legacyFiles = {
			'.github/workflows/deploy.yml': 'legacy deploy\n',
			'.github/workflows/quality.yml': 'legacy quality\n',
			'scripts/build-for-convex.ts': 'legacy build\n',
			'scripts/smoke-deploy.ts': 'legacy smoke\n'
		};
		await mkdir(join(cwd, '.product-plate'), { recursive: true });
		await writeFile(
			join(cwd, 'product-plate.json'),
			JSON.stringify({ product: { name: 'Customer Product' }, templateVersion: '1.0.0' })
		);
		for (const [path, content] of Object.entries(legacyFiles)) {
			await mkdir(join(cwd, path, '..'), { recursive: true });
			await writeFile(join(cwd, path), content);
		}
		await writeFile(
			join(cwd, '.product-plate/managed-files.json'),
			JSON.stringify({
				schemaVersion: 1,
				templateVersion: '1.0.0',
				files: Object.fromEntries(
					Object.entries(legacyFiles).map(([path, content]) => [path, sha256(content)])
				)
			})
		);
		const nextFiles = {
			...legacyFiles,
			'.github/workflows/deploy.yml': 'managed product-neutral workflow\n',
			'scripts/provision-runtime.ts': 'provision runtime\n',
			'src/convex/readiness.ts': 'backend readiness\n',
			'src/routes/api/health/+server.ts': 'runtime health\n'
		};
		const plan = await planUpgrade({
			cwd,
			fromVersion: '1.0.0',
			toVersion: '1.1.0',
			profile: 'prelaunch',
			files: nextFiles
		});

		expect(plan.conflicts).toEqual([]);
		expect(plan.updates).toEqual([
			'.github/workflows/deploy.yml',
			'scripts/provision-runtime.ts',
			'src/convex/readiness.ts',
			'src/routes/api/health/+server.ts'
		]);
		await applyUpgrade(plan);
		for (const path of plan.updates) {
			expect(await Bun.file(join(cwd, path)).exists()).toBe(true);
		}
		expect(await Bun.file(join(cwd, 'product-plate.json')).json()).toMatchObject({
			product: { name: 'Customer Product' }
		});
		expect(await Bun.file(join(cwd, '.product-plate/managed-files.json')).json()).toMatchObject({
			schemaVersion: 2,
			profile: 'prelaunch',
			files: {
				'scripts/provision-runtime.ts': sha256('provision runtime\n'),
				'src/convex/readiness.ts': sha256('backend readiness\n'),
				'src/routes/api/health/+server.ts': sha256('runtime health\n')
			}
		});
	});

	test('stages a conflict-free upgrade and records a recoverable backup', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-transaction-'));
		temporaryDirectories.push(cwd);
		await mkdir(join(cwd, '.product-plate'), { recursive: true });
		await writeFile(join(cwd, 'managed.txt'), 'old managed\n');
		const state = await createManagedState(cwd, '1.0.0', ['managed.txt'], 'solo-saas');
		await writeFile(join(cwd, '.product-plate/managed-files.json'), JSON.stringify(state));
		const plan = await planUpgrade({
			cwd,
			fromVersion: '1.0.0',
			toVersion: '1.1.0',
			profile: 'solo-saas',
			files: { 'managed.txt': 'new managed\n' }
		});

		await applyUpgrade(plan);
		expect(await readFile(join(cwd, 'managed.txt'), 'utf8')).toBe('new managed\n');
		expect(await Bun.file(join(cwd, '.product-plate/managed-files.json')).json()).toMatchObject({
			schemaVersion: 2,
			templateVersion: '1.1.0',
			profile: 'solo-saas'
		});
		const backupDirectories = await Array.fromAsync(
			new Bun.Glob('*/restore.json').scan({ cwd: join(cwd, '.product-plate/backups') })
		);
		expect(backupDirectories).toHaveLength(1);
	});

	test('advances version metadata when managed file contents already match', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-no-content-changes-'));
		temporaryDirectories.push(cwd);
		await mkdir(join(cwd, '.product-plate'), { recursive: true });
		await writeFile(join(cwd, 'managed.txt'), 'current managed\n');
		const productManifest: ProductPlateManifest = {
			schemaVersion: 1,
			generatorVersion: '1.0.0',
			templateVersion: '1.0.0',
			profile: 'solo-saas',
			product: {
				name: 'Solo Product',
				slug: 'solo-product',
				description: 'A solo product.',
				productionUrl: null
			},
			theme: 'neutral',
			capabilities: ['landing'],
			providers: {
				data: 'convex',
				auth: 'better-auth',
				billing: 'autumn',
				email: 'resend',
				analytics: 'posthog',
				errors: 'sentry',
				hosting: 'cloudflare-pages'
			}
		};
		await writeFile(join(cwd, 'product-plate.json'), JSON.stringify(productManifest));
		const state = await createManagedState(cwd, '1.0.0', ['managed.txt'], 'solo-saas');
		await writeFile(join(cwd, '.product-plate/managed-files.json'), JSON.stringify(state));
		const plan = await planUpgrade({
			cwd,
			fromVersion: '1.0.0',
			toVersion: '1.1.0',
			profile: 'solo-saas',
			files: { 'managed.txt': 'current managed\n' }
		});

		expect(plan.updates).toEqual([]);
		expect(plan.conflicts).toEqual([]);
		await applyUpgrade(plan, productManifest);
		expect(await readFile(join(cwd, 'managed.txt'), 'utf8')).toBe('current managed\n');
		expect(await Bun.file(join(cwd, '.product-plate/managed-files.json')).json()).toMatchObject({
			templateVersion: '1.1.0'
		});
		expect(await Bun.file(join(cwd, 'product-plate.json')).json()).toMatchObject({
			templateVersion: '1.1.0'
		});
	});

	test('selects only the current profile assets and updates version metadata together', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-profile-'));
		temporaryDirectories.push(cwd);
		await mkdir(join(cwd, '.product-plate'), { recursive: true });
		await writeFile(join(cwd, 'managed.txt'), 'old managed\n');
		await writeFile(
			join(cwd, 'product-plate.json'),
			JSON.stringify({
				schemaVersion: 1,
				generatorVersion: '1.0.0',
				templateVersion: '1.0.0',
				profile: 'solo-saas',
				product: {
					name: 'Solo Product',
					slug: 'solo-product',
					description: 'A solo product.',
					productionUrl: null
				},
				theme: 'neutral',
				capabilities: ['landing'],
				providers: {
					data: 'convex',
					auth: 'better-auth',
					billing: 'autumn',
					email: 'resend',
					analytics: 'posthog',
					errors: 'sentry',
					hosting: 'cloudflare-pages'
				}
			})
		);
		const state = await createManagedState(cwd, '1.0.0', ['managed.txt'], 'solo-saas');
		await writeFile(join(cwd, '.product-plate/managed-files.json'), JSON.stringify(state));
		const releasePath = join(cwd, 'release.json');
		await writeFile(
			releasePath,
			JSON.stringify({
				schemaVersion: 2,
				version: '1.1.0',
				compatibleProductSchemaVersions: [1],
				migrations: [],
				securityFixes: [],
				profiles: {
					prelaunch: {
						files: {
							'managed.txt': {
								content: 'prelaunch content\n',
								sha256: sha256('prelaunch content\n')
							}
						}
					},
					'solo-saas': {
						files: {
							'managed.txt': {
								content: 'solo content\n',
								sha256: sha256('solo content\n')
							}
						}
					},
					'team-saas': { files: {} },
					'ai-saas': { files: {} }
				}
			})
		);

		const result = await runUpgradeCommand({ cwd, apply: true, manifestSource: releasePath });
		expect(result.applied).toBe(true);
		expect(await readFile(join(cwd, 'managed.txt'), 'utf8')).toBe('solo content\n');
		expect(await Bun.file(join(cwd, 'product-plate.json')).json()).toMatchObject({
			templateVersion: '1.1.0',
			profile: 'solo-saas'
		});
	});

	test('rejects a release that excludes the current product schema', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-compatibility-'));
		temporaryDirectories.push(cwd);
		await writeFile(
			join(cwd, 'product-plate.json'),
			JSON.stringify({
				schemaVersion: 1,
				generatorVersion: '1.0.0',
				templateVersion: '1.0.0',
				profile: 'prelaunch',
				product: {
					name: 'Launch List',
					slug: 'launch-list',
					description: 'A launch list.',
					productionUrl: null
				},
				theme: 'neutral',
				capabilities: ['landing'],
				providers: {
					data: 'convex',
					auth: 'none',
					billing: 'none',
					email: 'resend',
					analytics: 'posthog',
					errors: 'sentry',
					hosting: 'cloudflare-pages'
				}
			})
		);
		const releasePath = join(cwd, 'release.json');
		await writeFile(
			releasePath,
			JSON.stringify({
				schemaVersion: 2,
				version: '1.1.0',
				compatibleProductSchemaVersions: [2],
				migrations: [],
				securityFixes: [],
				profiles: {
					prelaunch: { files: {} },
					'solo-saas': { files: {} },
					'team-saas': { files: {} },
					'ai-saas': { files: {} }
				}
			})
		);
		await expect(
			runUpgradeCommand({ cwd, apply: false, manifestSource: releasePath })
		).rejects.toThrow('does not support product manifest schema 1');
	});
});
