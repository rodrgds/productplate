import { cp, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { resolveProfile } from './profiles.ts';
import {
	applyProfileTransforms,
	pruneUnusedDependencies,
	pruneUnreachableLibraryFiles,
	stripGeneratedDemoCode
} from './transforms.ts';
import type { GenerateProjectOptions, ProductPlateManifest } from './types.ts';
import { createManagedState } from './upgrade.ts';

export const GENERATOR_VERSION = '1.0.0';
const DEFAULT_REPOSITORY = 'rodrgds/productplate';

interface ReleaseManifest {
	archiveUrl: string;
	sha256: string;
}

async function pathExists(path: string) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

async function ensureSafeDestination(destination: string) {
	if (!(await pathExists(destination))) return;
	const entries = await readdir(destination);
	if (entries.length > 0) {
		throw new Error(`The destination must be empty: ${destination}`);
	}
}

function shouldCopyTemplateSource(source: string, templatePath: string) {
	const relativePath = source.slice(templatePath.length).replace(/^\/+/, '');
	if (!relativePath) return true;
	const segments = relativePath.split('/');
	const excludedSegments = new Set([
		'.devenv',
		'.git',
		'.svelte-kit',
		'.wrangler',
		'node_modules',
		'packages',
		'playwright-report',
		'test-results'
	]);
	if (segments.some((segment) => excludedSegments.has(segment))) return false;
	const name = segments.at(-1) ?? '';
	if (
		name === '.env' ||
		name === '.env.local' ||
		(name.startsWith('.env.') && name !== '.env.example')
	) {
		return false;
	}
	if (
		[
			'.dev.vars',
			'.DS_Store',
			'.npmrc',
			'.pre-commit-config.yaml',
			'.yarnrc',
			'bunfig.toml',
			'credentials.json',
			'result',
			'service-account.json'
		].includes(name) ||
		/\.(?:key|p12|pem)$/.test(name)
	)
		return false;
	return true;
}

export function slugify(value: string) {
	const slug = value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64);
	if (!slug) throw new Error('Product name must contain at least one letter or number.');
	return slug;
}

async function sha256(path: string) {
	const hash = createHash('sha256');
	hash.update(await readFile(path));
	return hash.digest('hex');
}

export async function verifyTemplateChecksum(path: string, expected: string) {
	const actual = await sha256(path);
	if (actual !== expected) throw new Error('Product Plate template checksum verification failed.');
}

async function downloadTemplate(templateVersion: string) {
	const releaseUrl = `https://github.com/${DEFAULT_REPOSITORY}/releases/download/v${templateVersion}/product-plate-template.json`;
	const response = await fetch(releaseUrl);
	if (!response.ok) {
		throw new Error(`Unable to load Product Plate template metadata for v${templateVersion}.`);
	}
	const release = (await response.json()) as ReleaseManifest;
	if (!/^https:\/\//.test(release.archiveUrl) || !/^[a-f0-9]{64}$/.test(release.sha256)) {
		throw new Error('The Product Plate release manifest is invalid.');
	}
	const archiveResponse = await fetch(release.archiveUrl);
	if (!archiveResponse.ok)
		throw new Error('Unable to download the Product Plate template archive.');
	const temporaryDirectory = await mkdtemp(join(tmpdir(), 'product-plate-download-'));
	const archivePath = join(temporaryDirectory, 'template.tar.gz');
	await writeFile(archivePath, new Uint8Array(await archiveResponse.arrayBuffer()));
	try {
		await verifyTemplateChecksum(archivePath, release.sha256);
	} catch (error) {
		await rm(temporaryDirectory, { recursive: true });
		throw error;
	}
	const extractPath = join(temporaryDirectory, 'template');
	await mkdir(extractPath);
	const process = Bun.spawn(
		['tar', '-xzf', archivePath, '--strip-components=1', '-C', extractPath],
		{
			stdout: 'pipe',
			stderr: 'pipe'
		}
	);
	if ((await process.exited) !== 0) {
		throw new Error(
			`Unable to extract Product Plate template: ${await new Response(process.stderr).text()}`
		);
	}
	return { path: extractPath, cleanup: temporaryDirectory };
}

async function removePaths(destination: string, paths: Array<string>) {
	for (const relativePath of paths) {
		const target = resolve(destination, relativePath);
		if (!target.startsWith(`${resolve(destination)}/`) && target !== resolve(destination)) {
			throw new Error(`Unsafe generated path: ${relativePath}`);
		}
		await rm(target, { recursive: true, force: true });
	}
}

async function rewriteTextFiles(directory: string, replacements: Array<[RegExp, string]>) {
	const textExtensions = new Set([
		'.css',
		'.html',
		'.js',
		'.json',
		'.jsonc',
		'.md',
		'.svelte',
		'.svg',
		'.ts',
		'.txt',
		'.xml',
		'.yml',
		'.yaml'
	]);
	const visit = async (path: string) => {
		for (const entry of await readdir(path, { withFileTypes: true })) {
			const target = join(path, entry.name);
			if (entry.isDirectory()) {
				await visit(target);
				continue;
			}
			const extension = entry.name.includes('.') ? `.${entry.name.split('.').pop()}` : '';
			if (!textExtensions.has(extension) && !['AGENTS.md', 'LICENSE'].includes(entry.name))
				continue;
			let contents = await readFile(target, 'utf8');
			for (const [pattern, replacement] of replacements) {
				contents = contents.replace(pattern, replacement);
			}
			await writeFile(target, contents);
		}
	};
	await visit(directory);
}

function generatedReadme(manifest: ProductPlateManifest) {
	const authRecipe =
		manifest.providers.auth === 'better-auth'
			? '\n\nProduction examples require email verification and configured delivery. Magic-link sign-in is available as an opt-in Better Auth recipe: set `AUTH_MAGIC_LINK_ENABLED=true`, configure Resend, and add a deliberate magic-link control to the sign-in screen. It is disabled by default.'
			: '';
	return `# ${manifest.product.name}\n\n${manifest.product.description}\n\n## Start locally\n\n\`\`\`sh\nbun install\nbun convex dev\nbun run dev\n\`\`\`\n\nCopy \`.env.example\` to \`.env.local\` and fill the required values. Run \`bun run doctor\` at any time, and \`bun run verify:launch\` before a production deploy.${authRecipe}\n\n## Product profile\n\nThis app was generated with the \`${manifest.profile}\` Product Plate profile. Its selected capabilities are recorded in \`product-plate.json\`.\n`;
}

function generatedStartHere(manifest: ProductPlateManifest) {
	return `# ${manifest.product.name}: product kickstart\n\nThe generator has already selected the \`${manifest.profile}\` profile and removed unrelated starter surfaces. Build the first complete product loop without adding back excluded showcases.\n\n## Active capabilities\n\n${manifest.capabilities.map((capability) => `- ${capability}`).join('\n')}\n\nUpdate \`product-plate.json\`, README, product copy, tests, environment examples, and deployment checks whenever the selected product loop changes.\n`;
}

function generatedAgents(manifest: ProductPlateManifest) {
	return `# ${manifest.product.name} project guidance\n\n- Use Bun for package and script commands.\n- The active profile is \`${manifest.profile}\`. Do not restore excluded Product Plate demo surfaces.\n- The selected capabilities are: ${manifest.capabilities.join(', ')}.\n- Keep Convex backend changes backward compatible during deployment.\n- Use TDD for testable behavior.\n- Run \`bun run verify:launch\` before production deployment.\n- Do not commit or deploy without explicit authorization.\n`;
}

async function rewritePackageJson(
	destination: string,
	manifest: ProductPlateManifest,
	removeDependencies: Array<string>,
	generatorSpecifier: string
) {
	const packagePath = join(destination, 'package.json');
	const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as Record<string, unknown> & {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
		scripts?: Record<string, string>;
	};
	packageJson.name = manifest.product.slug;
	packageJson.version = '0.1.0';
	packageJson.private = true;
	delete packageJson.workspaces;
	delete packageJson.repository;
	for (const dependency of removeDependencies) {
		delete packageJson.dependencies?.[dependency];
		delete packageJson.devDependencies?.[dependency];
	}
	packageJson.devDependencies = {
		...packageJson.devDependencies,
		'create-product-plate': generatorSpecifier
	};
	packageJson.scripts = {
		dev: 'vite dev',
		build: 'vite build',
		preview: 'vite preview',
		prepare: "svelte-kit sync || echo ''",
		check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
		format: 'prettier --write .',
		'format:check': 'prettier --check .',
		lint: 'prettier --check . && eslint .',
		'test:unit': 'vitest run',
		'test:e2e': 'playwright test',
		audit: 'bun audit --audit-level high',
		...(manifest.profile === 'prelaunch'
			? { 'waitlist:export': 'bun scripts/waitlist-export.ts' }
			: {}),
		verify: 'bun run lint && bun run check && bun run test:unit',
		doctor: 'product-plate doctor',
		'verify:launch':
			'bun run lint && bun run check && bun run test:unit && bun run audit && bun run build && bun run test:e2e && bun run doctor -- --strict'
	};
	await writeFile(packagePath, `${JSON.stringify(packageJson, null, '\t')}\n`);
}

async function writeGeneratedConfiguration(destination: string, manifest: ProductPlateManifest) {
	await writeFile(
		join(destination, 'product-plate.json'),
		`${JSON.stringify(manifest, null, '\t')}\n`
	);
	await writeFile(join(destination, 'README.md'), generatedReadme(manifest));
	await writeFile(join(destination, 'START_HERE.md'), generatedStartHere(manifest));
	await writeFile(join(destination, 'AGENTS.md'), generatedAgents(manifest));
	await writeFile(
		join(destination, 'src/app.html'),
		`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
`
	);
	const localEnvironment = [
		'# Local secrets. This file is ignored by Git.',
		...(manifest.profile === 'prelaunch'
			? [
					`WAITLIST_FINGERPRINT_SECRET=${randomBytes(32).toString('base64url')}`,
					`WAITLIST_EXPORT_SECRET=${randomBytes(32).toString('base64url')}`
				]
			: [`BETTER_AUTH_SECRET=${randomBytes(32).toString('base64url')}`]),
		''
	].join('\n');
	await writeFile(join(destination, '.env.local'), localEnvironment, { mode: 0o600 });
	await writeManagedState(destination, manifest.templateVersion);
}

async function writeManagedState(destination: string, templateVersion: string) {
	await mkdir(join(destination, '.product-plate'), { recursive: true });
	const managedState = await createManagedState(destination, templateVersion, [
		'.github/workflows/deploy.yml',
		'.github/workflows/quality.yml',
		'scripts/build-for-convex.ts',
		'scripts/smoke-deploy.ts'
	]);
	await writeFile(
		join(destination, '.product-plate/managed-files.json'),
		`${JSON.stringify(managedState, null, '\t')}\n`
	);
}

async function runCommand(command: Array<string>, cwd: string, label: string) {
	const process = Bun.spawn(command, {
		cwd,
		stdin: 'inherit',
		stdout: 'inherit',
		stderr: 'inherit'
	});
	if ((await process.exited) !== 0) throw new Error(`${label} failed.`);
}

export async function generateProject(options: GenerateProjectOptions) {
	const destination = resolve(options.destination);
	const destinationExisted = await pathExists(destination);
	await ensureSafeDestination(destination);
	const definition = resolveProfile(options.profile);
	const templateVersion = options.templateVersion ?? GENERATOR_VERSION;
	const generatorVersion = options.generatorVersion ?? GENERATOR_VERSION;
	const downloaded = options.templatePath ? null : await downloadTemplate(templateVersion);
	const templatePath = resolve(options.templatePath ?? downloaded!.path);
	if (!(await pathExists(join(templatePath, 'package.json')))) {
		throw new Error(`Template path does not contain a package.json: ${templatePath}`);
	}
	const productSlug = slugify(options.name);
	const manifest: ProductPlateManifest = {
		schemaVersion: 1,
		generatorVersion,
		templateVersion,
		profile: options.profile,
		product: {
			name: options.name.trim(),
			slug: productSlug,
			description: options.description.trim(),
			productionUrl: options.productionUrl ?? null
		},
		theme: options.theme,
		capabilities: definition.capabilities,
		providers: definition.providers
	};

	try {
		await mkdir(dirname(destination), { recursive: true });
		await cp(templatePath, destination, {
			recursive: true,
			verbatimSymlinks: true,
			filter: (source) => shouldCopyTemplateSource(source, templatePath)
		});
		await removePaths(destination, definition.removePaths);
		await rewriteTextFiles(destination, [
			[/Product Plate/g, manifest.product.name],
			[/productplate\.pages\.dev/g, `${productSlug}.pages.dev`],
			[/productplate/g, productSlug]
		]);
		await rewritePackageJson(
			destination,
			manifest,
			definition.removeDependencies,
			options.templatePath ? `file:${resolve(import.meta.dir, '..')}` : `^${generatorVersion}`
		);
		await applyProfileTransforms(destination, manifest);
		if (manifest.providers.auth === 'better-auth') await stripGeneratedDemoCode(destination);
		await pruneUnreachableLibraryFiles(destination);
		await pruneUnusedDependencies(destination);
		await writeGeneratedConfiguration(destination, manifest);
		if (options.install) {
			await runCommand(['bun', 'install'], destination, 'Dependency install');
			await runCommand(['bun', 'run', 'format'], destination, 'Generated source formatting');
			await writeManagedState(destination, manifest.templateVersion);
		}
		if (options.git) {
			await runCommand(['git', 'init'], destination, 'Git initialization');
		}
		return { destination, manifest };
	} catch (error) {
		await rm(destination, { recursive: true, force: true });
		if (destinationExisted) await mkdir(destination, { recursive: true });
		throw error;
	} finally {
		if (downloaded) await rm(downloaded.cleanup, { recursive: true, force: true });
	}
}
