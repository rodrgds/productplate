import { createHash, randomUUID } from 'node:crypto';
import { copyFile, lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import {
	productPlateManifestSchema,
	productProfileSchema,
	semanticVersionSchema,
	type ProductPlateManifest,
	type ProductProfile
} from './types.ts';

const checksumSchema = z.string().regex(/^[a-f0-9]{64}$/);
const RELEASE_ASSET_BASE = 'https://github.com/rodrgds/productplate/releases/latest/download';
export const DEFAULT_UPGRADE_MANIFEST_URL = `${RELEASE_ASSET_BASE}/product-plate-upgrade-v2.json`;

export function releaseMigrationInstruction(version: string, repository = 'rodrgds/productplate') {
	const releaseVersion = semanticVersionSchema.parse(version);
	if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
		throw new Error('GitHub repository must use the owner/name format.');
	}
	return `Read https://github.com/${repository}/blob/v${releaseVersion}/docs/migrations/v${releaseVersion}.md before applying modified infrastructure by hand.`;
}

export interface LegacyUpgradeBootstrapManifest {
	schemaVersion: 1;
	version: string;
	migrations: Array<string>;
	securityFixes: Array<string>;
	files: Record<string, { content: string; sha256: string }>;
}

function isSafeManagedPath(path: string) {
	const hasControlCharacter = Array.from(path).some((character) => {
		const code = character.charCodeAt(0);
		return code <= 31 || code === 127;
	});
	if (!path || path.length > 512 || path.includes('\\') || hasControlCharacter) return false;
	if (path.startsWith('/') || isAbsolute(path) || /^[A-Za-z]:/.test(path)) return false;
	const segments = path.split('/');
	if (segments.some((segment) => !segment || segment === '.' || segment === '..')) return false;
	if (segments.some((segment) => segment.length > 255 || /[:*?"<>|]/.test(segment))) return false;
	if (segments.some((segment) => /[. ]$/.test(segment))) return false;
	if (segments.some((segment) => /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(segment)))
		return false;
	if (
		path === 'product-plate.json' ||
		path === '.product-plate' ||
		path.startsWith('.product-plate/')
	) {
		return false;
	}
	return true;
}

export const managedPathSchema = z
	.string()
	.refine(isSafeManagedPath, 'Unsafe managed path in upgrade manifest.');

const managedFilesSchema = z.record(managedPathSchema, checksumSchema);
const managedStateV1Schema = z
	.object({
		schemaVersion: z.literal(1),
		templateVersion: semanticVersionSchema,
		files: managedFilesSchema
	})
	.strict();
const managedStateV2Schema = z
	.object({
		schemaVersion: z.literal(2),
		templateVersion: semanticVersionSchema,
		profile: productProfileSchema,
		files: managedFilesSchema
	})
	.strict();
const managedStateSchema = z.union([managedStateV2Schema, managedStateV1Schema]);

export interface ManagedState {
	schemaVersion: 2;
	templateVersion: string;
	profile: ProductProfile;
	files: Record<string, string>;
}

interface UpgradePlanOptions {
	cwd: string;
	fromVersion: string;
	toVersion: string;
	profile: ProductProfile;
	files: Record<string, string>;
}

const upgradeAssetSchema = z
	.object({
		url: z.string().url().startsWith('https://').optional(),
		content: z.string().optional(),
		sha256: checksumSchema
	})
	.strict()
	.refine(
		(asset) => (asset.url === undefined) !== (asset.content === undefined),
		'Each managed asset must provide exactly one of url or content.'
	);
const upgradeProfileSchema = z
	.object({ files: z.record(managedPathSchema, upgradeAssetSchema) })
	.strict();

export const upgradeReleaseManifestSchema = z
	.object({
		schemaVersion: z.literal(2),
		version: semanticVersionSchema,
		compatibleProductSchemaVersions: z.array(z.number().int().positive()).min(1),
		migrations: z.array(z.string()),
		securityFixes: z.array(z.string()),
		profiles: z
			.object({
				prelaunch: upgradeProfileSchema,
				'solo-saas': upgradeProfileSchema,
				'team-saas': upgradeProfileSchema,
				'ai-saas': upgradeProfileSchema
			})
			.strict()
	})
	.strict();

export type UpgradeReleaseManifest = z.infer<typeof upgradeReleaseManifestSchema>;

export interface UpgradePlan {
	cwd: string;
	fromVersion: string;
	toVersion: string;
	profile: ProductProfile;
	updates: Array<string>;
	conflicts: Array<string>;
	files: Record<string, string>;
}

interface BackupEntry {
	path: string;
	existed: boolean;
	backupPath?: string;
}

function hash(content: string | Uint8Array) {
	return createHash('sha256').update(content).digest('hex');
}

export function createLegacyUpgradeBootstrap(version: string): LegacyUpgradeBootstrapManifest {
	semanticVersionSchema.parse(version);
	const content = `Product Plate ${version} uses profile-aware schema-v2 upgrades.\n`;
	return {
		schemaVersion: 1,
		version,
		migrations: [
			'Run `bun add --dev create-product-plate@latest`, then rerun `bunx product-plate upgrade --check`.'
		],
		securityFixes: [
			'This compatibility manifest intentionally blocks profile-blind v1 upgrade writes.'
		],
		files: {
			'.product-plate/managed-files.json': { content, sha256: hash(content) }
		}
	};
}

function formatZodError(prefix: string, error: z.ZodError) {
	const issue = error.issues[0];
	const nestedIssue =
		issue && 'issues' in issue && Array.isArray(issue.issues) ? issue.issues[0] : undefined;
	return `${prefix}: ${nestedIssue?.message ?? issue?.message ?? 'invalid data'}`;
}

function resolveManagedPath(cwd: string, managedPath: string) {
	const parsedPath = managedPathSchema.safeParse(managedPath);
	if (!parsedPath.success) throw new Error(parsedPath.error.issues[0]?.message);
	const root = resolve(cwd);
	const target = resolve(root, ...managedPath.split('/'));
	const containedPath = relative(root, target);
	if (
		containedPath === '' ||
		containedPath === '..' ||
		containedPath.startsWith(`..${sep}`) ||
		isAbsolute(containedPath)
	) {
		throw new Error(`Unsafe managed path: ${managedPath}`);
	}
	return target;
}

async function assertNoSymlinkComponents(cwd: string, managedPath: string) {
	let current = resolve(cwd);
	for (const segment of managedPath.split('/')) {
		current = join(current, segment);
		try {
			if ((await lstat(current)).isSymbolicLink()) {
				throw new Error(`Managed path crosses a symbolic link: ${managedPath}`);
			}
		} catch (error) {
			if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return;
			throw error;
		}
	}
}

async function currentHash(cwd: string, managedPath: string) {
	const target = resolveManagedPath(cwd, managedPath);
	await assertNoSymlinkComponents(cwd, managedPath);
	try {
		return hash(await readFile(target));
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
		throw error;
	}
}

async function readManagedState(cwd: string) {
	const statePath = join(cwd, '.product-plate/managed-files.json');
	let input: unknown;
	try {
		input = await Bun.file(statePath).json();
	} catch (error) {
		throw new Error('Unable to read .product-plate/managed-files.json.', { cause: error });
	}
	const state = managedStateSchema.safeParse(input);
	if (!state.success)
		throw new Error(formatZodError('Unsupported managed-file state', state.error));
	return state.data;
}

export async function createManagedState(
	cwd: string,
	templateVersion: string,
	files: Array<string>,
	profile: ProductProfile
): Promise<ManagedState> {
	semanticVersionSchema.parse(templateVersion);
	productProfileSchema.parse(profile);
	const checksums: Record<string, string> = {};
	for (const file of files) {
		const checksum = await currentHash(cwd, file);
		if (checksum) checksums[file] = checksum;
	}
	return { schemaVersion: 2, templateVersion, profile, files: checksums };
}

export async function planUpgrade(options: UpgradePlanOptions): Promise<UpgradePlan> {
	semanticVersionSchema.parse(options.fromVersion);
	semanticVersionSchema.parse(options.toVersion);
	productProfileSchema.parse(options.profile);
	const state = await readManagedState(options.cwd);
	if (state.templateVersion !== options.fromVersion) {
		throw new Error(
			`Managed state is for ${state.templateVersion}, not requested source ${options.fromVersion}.`
		);
	}
	if (state.schemaVersion === 2 && state.profile !== options.profile) {
		throw new Error(`Managed state is for ${state.profile}, not ${options.profile}.`);
	}
	const updates: Array<string> = [];
	const conflicts: Array<string> = [];
	for (const [file, content] of Object.entries(options.files)) {
		managedPathSchema.parse(file);
		const previousChecksum = state.files[file];
		const actualChecksum = await currentHash(options.cwd, file);
		if (!previousChecksum && actualChecksum === null) updates.push(file);
		else if (!previousChecksum || actualChecksum !== previousChecksum) conflicts.push(file);
		else if (actualChecksum !== hash(content)) updates.push(file);
	}
	return { ...options, updates, conflicts };
}

export async function loadUpgradeRelease(source?: string) {
	const location = source ?? DEFAULT_UPGRADE_MANIFEST_URL;
	let input: unknown;
	if (/^https?:\/\//.test(location)) {
		if (!location.startsWith('https://')) throw new Error('Upgrade manifest URL must use HTTPS.');
		let response: Response;
		try {
			response = await fetch(location, { signal: AbortSignal.timeout(30_000) });
		} catch (error) {
			throw new Error('Unable to load the upgrade manifest.', { cause: error });
		}
		if (!response.ok) throw new Error(`Unable to load upgrade manifest (${response.status}).`);
		input = await response.json();
	} else {
		input = await Bun.file(location).json();
	}
	const release = upgradeReleaseManifestSchema.safeParse(input);
	if (!release.success) {
		throw new Error(formatZodError('The upgrade release manifest is invalid', release.error));
	}
	return release.data;
}

export async function downloadUpgradeFiles(
	releaseInput: UpgradeReleaseManifest,
	profile: ProductProfile
) {
	const parsed = upgradeReleaseManifestSchema.safeParse(releaseInput);
	if (!parsed.success) {
		throw new Error(formatZodError('The upgrade release manifest is invalid', parsed.error));
	}
	const files: Record<string, string> = {};
	for (const [path, asset] of Object.entries(parsed.data.profiles[profile].files)) {
		let content = asset.content;
		if (content === undefined) {
			let response: Response;
			try {
				response = await fetch(asset.url!, { signal: AbortSignal.timeout(30_000) });
			} catch (error) {
				throw new Error(`Unable to download managed file: ${path}`, { cause: error });
			}
			if (!response.ok) throw new Error(`Unable to download managed file: ${path}`);
			content = await response.text();
		}
		if (hash(content) !== asset.sha256) {
			throw new Error(`Checksum mismatch for managed file: ${path}`);
		}
		files[path] = content;
	}
	return files;
}

interface ParsedVersion {
	major: number;
	minor: number;
	patch: number;
	prerelease: Array<string>;
}

function parseVersion(version: string): ParsedVersion {
	semanticVersionSchema.parse(version);
	const withoutBuild = version.split('+', 1)[0];
	const prereleaseDelimiter = withoutBuild.indexOf('-');
	const core =
		prereleaseDelimiter === -1 ? withoutBuild : withoutBuild.slice(0, prereleaseDelimiter);
	const prerelease = prereleaseDelimiter === -1 ? '' : withoutBuild.slice(prereleaseDelimiter + 1);
	const [major, minor, patch] = core.split('.').map(Number);
	return { major, minor, patch, prerelease: prerelease ? prerelease.split('.') : [] };
}

function comparePrerelease(left: Array<string>, right: Array<string>) {
	if (left.length === 0 && right.length === 0) return 0;
	if (left.length === 0) return 1;
	if (right.length === 0) return -1;
	for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
		const leftPart = left[index];
		const rightPart = right[index];
		if (leftPart === undefined) return -1;
		if (rightPart === undefined) return 1;
		if (leftPart === rightPart) continue;
		const leftNumeric = /^\d+$/.test(leftPart);
		const rightNumeric = /^\d+$/.test(rightPart);
		if (leftNumeric && rightNumeric) return Number(leftPart) < Number(rightPart) ? -1 : 1;
		if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
		return leftPart < rightPart ? -1 : 1;
	}
	return 0;
}

export function isNewerVersion(current: string, available: string) {
	const left = parseVersion(current);
	const right = parseVersion(available);
	for (const key of ['major', 'minor', 'patch'] as const) {
		if (right[key] > left[key]) return true;
		if (right[key] < left[key]) return false;
	}
	return comparePrerelease(left.prerelease, right.prerelease) < 0;
}

export async function runUpgradeCommand(options: {
	cwd: string;
	apply: boolean;
	manifestSource?: string;
}) {
	const productManifestPath = join(options.cwd, 'product-plate.json');
	const parsedManifest = productPlateManifestSchema.safeParse(
		await Bun.file(productManifestPath).json()
	);
	if (!parsedManifest.success) {
		throw new Error(formatZodError('product-plate.json is invalid', parsedManifest.error));
	}
	const productManifest = parsedManifest.data;
	const release = await loadUpgradeRelease(options.manifestSource);
	if (!release.compatibleProductSchemaVersions.includes(productManifest.schemaVersion)) {
		throw new Error(
			`Upgrade ${release.version} does not support product manifest schema ${productManifest.schemaVersion}.`
		);
	}
	if (!isNewerVersion(productManifest.templateVersion, release.version)) {
		return { release, upToDate: true, plan: null, applied: false };
	}
	const files = await downloadUpgradeFiles(release, productManifest.profile);
	const plan = await planUpgrade({
		cwd: options.cwd,
		fromVersion: productManifest.templateVersion,
		toVersion: release.version,
		profile: productManifest.profile,
		files
	});
	if (options.apply && plan.conflicts.length === 0) {
		await applyUpgrade(plan, productManifest);
		return { release, upToDate: false, plan, applied: true };
	}
	return { release, upToDate: false, plan, applied: false };
}

async function pathExists(path: string) {
	try {
		await lstat(path);
		return true;
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return false;
		throw error;
	}
}

async function stageBackup(target: string, backup: string, path: string): Promise<BackupEntry> {
	if (!(await pathExists(target))) return { path, existed: false };
	if ((await lstat(target)).isSymbolicLink()) {
		throw new Error(`Refusing to back up a symbolic link: ${path}`);
	}
	await mkdir(dirname(backup), { recursive: true });
	await copyFile(target, backup);
	return { path, existed: true, backupPath: backup };
}

async function atomicCopy(source: string, target: string) {
	await mkdir(dirname(target), { recursive: true });
	const temporaryTarget = join(dirname(target), `.${randomUUID()}.product-plate.tmp`);
	try {
		await copyFile(source, temporaryTarget);
		await rename(temporaryTarget, target);
	} finally {
		await rm(temporaryTarget, { force: true });
	}
}

export async function applyUpgrade(plan: UpgradePlan, productManifest?: ProductPlateManifest) {
	if (plan.conflicts.length > 0) {
		throw new Error('Cannot apply an upgrade while managed-file conflicts remain.');
	}
	const root = resolve(plan.cwd);
	const controlDirectory = join(root, '.product-plate');
	if ((await pathExists(controlDirectory)) && (await lstat(controlDirectory)).isSymbolicLink()) {
		throw new Error('.product-plate cannot be a symbolic link.');
	}
	await mkdir(controlDirectory, { recursive: true });
	const transactionId = `${Date.now()}-${randomUUID()}`;
	const stageDirectory = join(controlDirectory, 'transactions', transactionId);
	const backupDirectory = join(controlDirectory, 'backups', transactionId);
	const stagedFilesDirectory = join(stageDirectory, 'files');
	const backupEntries: Array<BackupEntry> = [];
	const appliedEntries: Array<BackupEntry> = [];
	try {
		await mkdir(stageDirectory, { recursive: true });
		for (const file of plan.updates) {
			const target = resolveManagedPath(root, file);
			await assertNoSymlinkComponents(root, file);
			const staged = join(stagedFilesDirectory, ...file.split('/'));
			const backup = join(backupDirectory, 'files', ...file.split('/'));
			await mkdir(dirname(staged), { recursive: true });
			await writeFile(staged, plan.files[file]);
			backupEntries.push(await stageBackup(target, backup, file));
		}

		const managedState: ManagedState = {
			schemaVersion: 2,
			templateVersion: plan.toVersion,
			profile: plan.profile,
			files: Object.fromEntries(
				Object.entries(plan.files).map(([file, content]) => [file, hash(content)])
			)
		};
		const stateTarget = join(controlDirectory, 'managed-files.json');
		const stateStage = join(stageDirectory, 'managed-files.json');
		await writeFile(stateStage, `${JSON.stringify(managedState, null, '\t')}\n`);
		backupEntries.push(
			await stageBackup(
				stateTarget,
				join(backupDirectory, 'managed-files.json'),
				'.product-plate/managed-files.json'
			)
		);

		let productStage: string | null = null;
		if (productManifest) {
			const nextProductManifest = productPlateManifestSchema.parse({
				...productManifest,
				templateVersion: plan.toVersion
			});
			productStage = join(stageDirectory, 'product-plate.json');
			await writeFile(productStage, `${JSON.stringify(nextProductManifest, null, '\t')}\n`);
			backupEntries.push(
				await stageBackup(
					join(root, 'product-plate.json'),
					join(backupDirectory, 'product-plate.json'),
					'product-plate.json'
				)
			);
		}

		await mkdir(backupDirectory, { recursive: true });
		await writeFile(
			join(backupDirectory, 'restore.json'),
			`${JSON.stringify(
				{
					schemaVersion: 1,
					fromVersion: plan.fromVersion,
					toVersion: plan.toVersion,
					createdAt: new Date().toISOString(),
					files: backupEntries
				},
				null,
				'\t'
			)}\n`
		);

		for (const file of plan.updates) {
			const entry = backupEntries.find((candidate) => candidate.path === file)!;
			await atomicCopy(
				join(stagedFilesDirectory, ...file.split('/')),
				resolveManagedPath(root, file)
			);
			appliedEntries.push(entry);
		}
		const stateEntry = backupEntries.find(
			(entry) => entry.path === '.product-plate/managed-files.json'
		)!;
		await atomicCopy(stateStage, stateTarget);
		appliedEntries.push(stateEntry);
		if (productStage) {
			const productEntry = backupEntries.find((entry) => entry.path === 'product-plate.json')!;
			await atomicCopy(productStage, join(root, 'product-plate.json'));
			appliedEntries.push(productEntry);
		}
		return plan;
	} catch (error) {
		for (const entry of appliedEntries.reverse()) {
			const target =
				entry.path === 'product-plate.json'
					? join(root, 'product-plate.json')
					: entry.path === '.product-plate/managed-files.json'
						? join(controlDirectory, 'managed-files.json')
						: resolveManagedPath(root, entry.path);
			if (entry.existed && entry.backupPath) await atomicCopy(entry.backupPath, target);
			else await rm(target, { force: true });
		}
		throw new Error('Upgrade failed and all applied files were rolled back.', { cause: error });
	} finally {
		await rm(stageDirectory, { recursive: true, force: true });
	}
}
