import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

interface ManagedState {
	schemaVersion: 1;
	templateVersion: string;
	files: Record<string, string>;
}

interface UpgradePlanOptions {
	cwd: string;
	fromVersion: string;
	toVersion: string;
	files: Record<string, string>;
}

export interface UpgradeReleaseManifest {
	schemaVersion: 1;
	version: string;
	migrations: Array<string>;
	securityFixes: Array<string>;
	files: Record<string, { url?: string; content?: string; sha256: string }>;
}

export interface UpgradePlan {
	cwd: string;
	fromVersion: string;
	toVersion: string;
	updates: Array<string>;
	conflicts: Array<string>;
	files: Record<string, string>;
}

function hash(content: string | Uint8Array) {
	return createHash('sha256').update(content).digest('hex');
}

async function currentHash(path: string) {
	try {
		return hash(await readFile(path));
	} catch {
		return null;
	}
}

export async function createManagedState(
	cwd: string,
	templateVersion: string,
	files: Array<string>
): Promise<ManagedState> {
	const checksums: Record<string, string> = {};
	for (const file of files) {
		const checksum = await currentHash(join(cwd, file));
		if (checksum) checksums[file] = checksum;
	}
	return { schemaVersion: 1, templateVersion, files: checksums };
}

export async function planUpgrade(options: UpgradePlanOptions): Promise<UpgradePlan> {
	const state = (await Bun.file(
		join(options.cwd, '.product-plate/managed-files.json')
	).json()) as ManagedState;
	if (state.schemaVersion !== 1) throw new Error('Unsupported managed-file state.');
	if (state.templateVersion !== options.fromVersion) {
		throw new Error(
			`Managed state is for ${state.templateVersion}, not requested source ${options.fromVersion}.`
		);
	}
	const updates: Array<string> = [];
	const conflicts: Array<string> = [];
	for (const [file, content] of Object.entries(options.files)) {
		const previousChecksum = state.files[file];
		const actualChecksum = await currentHash(join(options.cwd, file));
		if (!previousChecksum && actualChecksum === null) updates.push(file);
		else if (!previousChecksum || actualChecksum !== previousChecksum) conflicts.push(file);
		else if (actualChecksum !== hash(content)) updates.push(file);
	}
	return { ...options, updates, conflicts };
}

export async function loadUpgradeRelease(source?: string) {
	const location =
		source ??
		'https://github.com/rodrgds/productplate/releases/latest/download/product-plate-upgrade.json';
	const release = location.startsWith('http')
		? ((await (async () => {
				const response = await fetch(location);
				if (!response.ok) throw new Error(`Unable to load upgrade manifest (${response.status}).`);
				return await response.json();
			})()) as UpgradeReleaseManifest)
		: ((await Bun.file(location).json()) as UpgradeReleaseManifest);
	if (release.schemaVersion !== 1 || !/^\d+\.\d+\.\d+/.test(release.version)) {
		throw new Error('The upgrade release manifest is invalid.');
	}
	return release;
}

export async function downloadUpgradeFiles(release: UpgradeReleaseManifest) {
	const files: Record<string, string> = {};
	for (const [path, asset] of Object.entries(release.files)) {
		let content = asset.content;
		if (content === undefined) {
			if (!asset.url?.startsWith('https://'))
				throw new Error(`Upgrade asset URL is invalid: ${path}`);
			const response = await fetch(asset.url);
			if (!response.ok) throw new Error(`Unable to download managed file: ${path}`);
			content = await response.text();
		}
		if (hash(content) !== asset.sha256)
			throw new Error(`Checksum mismatch for managed file: ${path}`);
		files[path] = content;
	}
	return files;
}

function versionParts(version: string) {
	return version.split('-')[0].split('.').map(Number);
}

export function isNewerVersion(current: string, available: string) {
	const left = versionParts(current);
	const right = versionParts(available);
	for (let index = 0; index < 3; index += 1) {
		if ((right[index] ?? 0) > (left[index] ?? 0)) return true;
		if ((right[index] ?? 0) < (left[index] ?? 0)) return false;
	}
	return false;
}

export async function runUpgradeCommand(options: {
	cwd: string;
	apply: boolean;
	manifestSource?: string;
}) {
	const productManifestPath = join(options.cwd, 'product-plate.json');
	const productManifest = (await Bun.file(productManifestPath).json()) as {
		templateVersion: string;
		[key: string]: unknown;
	};
	const release = await loadUpgradeRelease(options.manifestSource);
	if (!isNewerVersion(productManifest.templateVersion, release.version)) {
		return { release, upToDate: true, plan: null, applied: false };
	}
	const files = await downloadUpgradeFiles(release);
	const plan = await planUpgrade({
		cwd: options.cwd,
		fromVersion: productManifest.templateVersion,
		toVersion: release.version,
		files
	});
	if (options.apply && plan.conflicts.length === 0) {
		await applyUpgrade(plan);
		productManifest.templateVersion = release.version;
		await writeFile(productManifestPath, `${JSON.stringify(productManifest, null, '\t')}\n`);
		return { release, upToDate: false, plan, applied: true };
	}
	return { release, upToDate: false, plan, applied: false };
}

export async function applyUpgrade(plan: UpgradePlan) {
	for (const file of plan.updates) {
		const target = join(plan.cwd, file);
		await mkdir(dirname(target), { recursive: true });
		await writeFile(target, plan.files[file]);
	}
	const state = await createManagedState(plan.cwd, plan.toVersion, [
		...plan.updates,
		...Object.keys(plan.files).filter((file) => !plan.conflicts.includes(file))
	]);
	await mkdir(join(plan.cwd, '.product-plate'), { recursive: true });
	await writeFile(
		join(plan.cwd, '.product-plate/managed-files.json'),
		`${JSON.stringify(state, null, '\t')}\n`
	);
	return plan;
}
