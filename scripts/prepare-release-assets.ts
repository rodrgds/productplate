#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateProject, GENERATOR_VERSION } from '../packages/create-product-plate/src/generator';

interface PackageManifest {
	version: string;
}

function sha256(content: string | Uint8Array) {
	return createHash('sha256').update(content).digest('hex');
}

async function run(command: Array<string>) {
	const process = Bun.spawn(command, { stdout: 'inherit', stderr: 'inherit' });
	if ((await process.exited) !== 0) throw new Error(`Command failed: ${command.join(' ')}`);
}

const version = process.argv[2] ?? process.env.RELEASE_VERSION;
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
	throw new Error('Pass a semantic version, for example: bun run release:assets -- 1.0.0');
}

const rootPackage = (await Bun.file('package.json').json()) as PackageManifest;
const generatorPackage = (await Bun.file(
	'packages/create-product-plate/package.json'
).json()) as PackageManifest;
const changelog = await readFile('CHANGELOG.md', 'utf8');
if (
	rootPackage.version !== version ||
	generatorPackage.version !== version ||
	GENERATOR_VERSION !== version
) {
	throw new Error(
		'Root, generator package, and generator source versions must match the release version.'
	);
}
if (!changelog.includes(`## [${version}]`)) {
	throw new Error(`CHANGELOG.md does not contain a ${version} release section.`);
}
if (!(await Bun.file(`docs/migrations/v${version}.md`).exists())) {
	throw new Error(`docs/migrations/v${version}.md is required for the release.`);
}

const repository = process.env.GITHUB_REPOSITORY ?? 'rodrgds/productplate';
const outputDirectory = 'dist/release';
await mkdir(outputDirectory, { recursive: true });
const archiveName = `product-plate-v${version}.tar.gz`;
const archivePath = join(outputDirectory, archiveName);
await run([
	'git',
	'archive',
	'--format=tar.gz',
	`--prefix=product-plate-v${version}/`,
	'-o',
	archivePath,
	'HEAD'
]);
const archiveChecksum = sha256(await readFile(archivePath));
const releaseBase = `https://github.com/${repository}/releases/download/v${version}`;
await writeFile(
	join(outputDirectory, 'product-plate-template.json'),
	`${JSON.stringify({ schemaVersion: 1, version, archiveUrl: `${releaseBase}/${archiveName}`, sha256: archiveChecksum }, null, 2)}\n`
);

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'product-plate-release-'));
try {
	const generated = join(temporaryDirectory, 'generated');
	await generateProject({
		destination: generated,
		templatePath: '.',
		profile: 'prelaunch',
		name: 'Release Profile',
		description: 'Release asset fixture.',
		theme: 'neutral',
		templateVersion: version,
		generatorVersion: version,
		install: false,
		git: false
	});
	const managedPaths = [
		'.github/workflows/deploy.yml',
		'.github/workflows/quality.yml',
		'scripts/build-for-convex.ts',
		'scripts/smoke-deploy.ts'
	];
	const files: Record<string, { content: string; sha256: string }> = {};
	for (const path of managedPaths) {
		const content = await readFile(join(generated, path), 'utf8');
		files[path] = { content, sha256: sha256(content) };
	}
	await writeFile(
		join(outputDirectory, 'product-plate-upgrade.json'),
		`${JSON.stringify(
			{
				schemaVersion: 1,
				version,
				migrations: [
					`Read docs/migrations/v${version}.md before applying modified infrastructure by hand.`
				],
				securityFixes: ['Review the release changelog for dependency and deployment hardening.'],
				files
			},
			null,
			2
		)}\n`
	);
} finally {
	await rm(temporaryDirectory, { recursive: true, force: true });
}

const gitShaProcess = Bun.spawn(['git', 'rev-parse', 'HEAD'], { stdout: 'pipe' });
const gitSha = (await new Response(gitShaProcess.stdout).text()).trim();
if ((await gitShaProcess.exited) !== 0) throw new Error('Unable to resolve the release Git SHA.');
await writeFile(
	join(outputDirectory, 'provenance.json'),
	`${JSON.stringify({ schemaVersion: 1, version, gitSha, repository, builder: 'scripts/prepare-release-assets.ts' }, null, 2)}\n`
);

const assetNames = [
	archiveName,
	'product-plate-template.json',
	'product-plate-upgrade.json',
	'provenance.json'
];
const checksums = [];
for (const name of assetNames) {
	checksums.push(`${sha256(await readFile(join(outputDirectory, name)))}  ${name}`);
}
await writeFile(join(outputDirectory, 'SHA256SUMS'), `${checksums.join('\n')}\n`);
console.log(`Prepared Product Plate v${version} release assets in ${outputDirectory}.`);
