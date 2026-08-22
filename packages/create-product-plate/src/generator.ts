import {
	cp,
	lstat,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	stat,
	writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { execPath } from 'node:process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
	format as formatWithPrettier,
	getFileInfo,
	type Options as PrettierOptions
} from 'prettier';
import * as sveltePrettierPlugin from 'prettier-plugin-svelte';
import * as tailwindPrettierPlugin from 'prettier-plugin-tailwindcss';
import { z } from 'zod';
import { resolveProfile } from './profiles.ts';
import {
	applyProfileTransforms,
	pruneUnusedDependencies,
	pruneUnreachableLibraryFiles,
	stripGeneratedDemoCode
} from './transforms.ts';
import {
	productPlateManifestSchema,
	semanticVersionSchema,
	type GenerateProjectOptions,
	type ProductPlateManifest
} from './types.ts';
import { createManagedState } from './upgrade.ts';

export const GENERATOR_VERSION = '1.1.0';
const DEFAULT_REPOSITORY = 'rodrgds/productplate';

const releaseManifestSchema = z
	.object({
		schemaVersion: z.literal(1),
		version: semanticVersionSchema,
		archiveUrl: z.string().url().startsWith('https://'),
		sha256: z.string().regex(/^[a-f0-9]{64}$/)
	})
	.strict();

const MAX_TEMPLATE_ARCHIVE_BYTES = 100 * 1024 * 1024;

interface DownloadedTemplate {
	path: string;
	cleanup: string;
}

interface GeneratorDependencies {
	downloadTemplate: (templateVersion: string) => Promise<DownloadedTemplate>;
	runCommand: (command: Array<string>, cwd: string, label: string) => Promise<void>;
}

async function pathExists(path: string) {
	try {
		await stat(path);
		return true;
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return false;
		throw error;
	}
}

async function ensureSafeDestination(destination: string) {
	if (!(await pathExists(destination))) return;
	const destinationEntry = await lstat(destination);
	if (destinationEntry.isSymbolicLink()) {
		throw new Error(`The destination cannot be a symbolic link: ${destination}`);
	}
	if (!destinationEntry.isDirectory()) {
		throw new Error(`The destination must be a directory: ${destination}`);
	}
	const entries = await readdir(destination);
	if (entries.length > 0) {
		throw new Error(`The destination must be empty: ${destination}`);
	}
}

function shouldCopyTemplateSource(source: string, templatePath: string) {
	const relativePath = relative(templatePath, source);
	if (!relativePath) return true;
	const segments = relativePath.split(/[\\/]+/);
	const excludedSegments = new Set([
		'.devenv',
		'.git',
		'.svelte-kit',
		'.wrangler',
		'dist',
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
			'CLAUDE.md',
			'credentials.json',
			'result',
			'service-account.json'
		].includes(name) ||
		/\.(?:key|p12|pem)$/.test(name)
	)
		return false;
	return true;
}

async function assertTemplateHasNoSymlinks(templatePath: string) {
	if ((await lstat(templatePath)).isSymbolicLink()) {
		throw new Error('The template directory cannot be a symbolic link.');
	}
	const visit = async (directory: string) => {
		for (const entry of await readdir(directory, { withFileTypes: true })) {
			const target = join(directory, entry.name);
			if (!shouldCopyTemplateSource(target, templatePath)) continue;
			if (entry.isSymbolicLink()) {
				throw new Error(
					`Template contains an unsafe symbolic link: ${relative(templatePath, target)}`
				);
			}
			if (entry.isDirectory()) await visit(target);
		}
	};
	await visit(templatePath);
}

async function formatGeneratedProject(destination: string) {
	const ignorePaths = [
		join(destination, '.gitignore'),
		join(destination, '.prettierignore')
	].filter((path) => existsSync(path));
	const plugins = [sveltePrettierPlugin, tailwindPrettierPlugin];
	const tailwindStylesheet = join(destination, 'src/app.css');
	const visit = async (directory: string) => {
		for (const entry of await readdir(directory, { withFileTypes: true })) {
			const target = join(directory, entry.name);
			if (entry.isDirectory()) {
				await visit(target);
				continue;
			}
			const fileInfo = await getFileInfo(target, {
				ignorePath: ignorePaths,
				plugins,
				withNodeModules: false
			});
			if (fileInfo.ignored || !fileInfo.inferredParser) continue;
			// Match the shipped .oxfmtrc.json contract so generated files survive
			// both the generator pass and any later prettier-based proof run.
			const options: PrettierOptions & { tailwindStylesheet: string } = {
				filepath: target,
				plugins,
				tailwindStylesheet,
				useTabs: true,
				singleQuote: true,
				trailingComma: 'none',
				printWidth: 100
			};
			const contents = await readFile(target, 'utf8');
			const formatted = await formatWithPrettier(contents, options);
			if (formatted !== contents) await writeFile(target, formatted);
		}
	};
	await visit(destination);
}

function assertSeparateTemplateAndDestination(templatePath: string, destination: string) {
	const destinationFromTemplate = relative(templatePath, destination);
	const templateFromDestination = relative(destination, templatePath);
	const isContained = (path: string) =>
		path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
	if (isContained(destinationFromTemplate) || isContained(templateFromDestination)) {
		throw new Error('Template and destination directories must not contain one another.');
	}
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

async function fetchReleaseAsset(url: string, label: string) {
	let response: Response;
	try {
		response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
	} catch (error) {
		throw new Error(`${label} could not be downloaded.`, { cause: error });
	}
	if (!response.ok) throw new Error(`${label} could not be downloaded (${response.status}).`);
	return response;
}

async function downloadTemplate(templateVersion: string): Promise<DownloadedTemplate> {
	const releaseUrl = `https://github.com/${DEFAULT_REPOSITORY}/releases/download/v${templateVersion}/product-plate-template.json`;
	const response = await fetchReleaseAsset(
		releaseUrl,
		`Product Plate template metadata for v${templateVersion}`
	);
	const parsedRelease = releaseManifestSchema.safeParse(await response.json());
	if (!parsedRelease.success) throw new Error('The Product Plate release manifest is invalid.');
	const release = parsedRelease.data;
	if (release.version !== templateVersion) {
		throw new Error('The Product Plate release manifest version does not match the request.');
	}
	const archiveResponse = await fetchReleaseAsset(
		release.archiveUrl,
		'Product Plate template archive'
	);
	const declaredLength = Number(archiveResponse.headers.get('content-length') ?? '0');
	if (declaredLength > MAX_TEMPLATE_ARCHIVE_BYTES) {
		throw new Error('The Product Plate template archive is unexpectedly large.');
	}
	const temporaryDirectory = await mkdtemp(join(tmpdir(), 'product-plate-download-'));
	try {
		const archive = new Uint8Array(await archiveResponse.arrayBuffer());
		if (archive.byteLength > MAX_TEMPLATE_ARCHIVE_BYTES) {
			throw new Error('The Product Plate template archive is unexpectedly large.');
		}
		const archivePath = join(temporaryDirectory, 'template.tar.gz');
		await writeFile(archivePath, archive);
		await verifyTemplateChecksum(archivePath, release.sha256);
		const extractPath = join(temporaryDirectory, 'template');
		await mkdir(extractPath);
		const child = Bun.spawn(
			['tar', '-xzf', archivePath, '--strip-components=1', '-C', extractPath],
			{
				stdout: 'ignore',
				stderr: 'pipe'
			}
		);
		const stderr = new Response(child.stderr).text();
		const exitCode = await child.exited;
		const errorOutput = await stderr;
		if (exitCode !== 0) {
			throw new Error(`Unable to extract Product Plate template: ${errorOutput.trim()}`);
		}
		await assertTemplateHasNoSymlinks(extractPath);
		return { path: extractPath, cleanup: temporaryDirectory };
	} catch (error) {
		await rm(temporaryDirectory, { recursive: true, force: true });
		throw error;
	}
}

async function removePaths(destination: string, paths: Array<string>) {
	const root = resolve(destination);
	for (const relativePath of paths) {
		const target = resolve(root, relativePath);
		const targetRelative = relative(root, target);
		if (
			targetRelative === '..' ||
			targetRelative.startsWith(`..${sep}`) ||
			isAbsolute(targetRelative)
		) {
			throw new Error(`Unsafe generated path: ${relativePath}`);
		}
		await rm(target, { recursive: true, force: true });
	}
}

const TEMPLATE_PRODUCT_NAME = 'Product Plate';

function escapeCodeString(value: string, quote: "'" | '"' | '`') {
	const escaped = value.replaceAll('\\', '\\\\');
	if (quote === '`') {
		return escaped.replaceAll('`', '\\`').replaceAll('${', '\\${');
	}
	return escaped.replaceAll(quote, `\\${quote}`);
}

function replaceProductNameInCode(contents: string, productName: string) {
	let result = '';
	let index = 0;
	let state: 'normal' | 'single' | 'double' | 'template' | 'line-comment' | 'block-comment' =
		'normal';
	while (index < contents.length) {
		const character = contents[index];
		const next = contents[index + 1];
		if (state === 'normal') {
			if (character === '/' && next === '/') {
				result += '//';
				index += 2;
				state = 'line-comment';
				continue;
			}
			if (character === '/' && next === '*') {
				result += '/*';
				index += 2;
				state = 'block-comment';
				continue;
			}
			if (character === "'") state = 'single';
			else if (character === '"') state = 'double';
			else if (character === '`') state = 'template';
			result += character;
			index += 1;
			continue;
		}
		if (state === 'line-comment') {
			result += character;
			index += 1;
			if (character === '\n' || character === '\r') state = 'normal';
			continue;
		}
		if (state === 'block-comment') {
			result += character;
			index += 1;
			if (character === '*' && next === '/') {
				result += '/';
				index += 1;
				state = 'normal';
			}
			continue;
		}
		const quote = state === 'single' ? "'" : state === 'double' ? '"' : '`';
		if (contents.startsWith(TEMPLATE_PRODUCT_NAME, index)) {
			result += escapeCodeString(productName, quote);
			index += TEMPLATE_PRODUCT_NAME.length;
			continue;
		}
		result += character;
		index += 1;
		if (character === '\\' && index < contents.length) {
			result += contents[index];
			index += 1;
			continue;
		}
		if (character === quote) state = 'normal';
	}
	return result;
}

function replaceProductNameInSvelte(contents: string, productName: string) {
	let result = '';
	let offset = 0;
	for (const match of contents.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)) {
		const matchIndex = match.index;
		const block = match[0];
		const openEnd = block.indexOf('>') + 1;
		const closeStart = block.lastIndexOf('</script>');
		result += contents
			.slice(offset, matchIndex)
			.replaceAll(TEMPLATE_PRODUCT_NAME, () => escapeXml(productName));
		result += block.slice(0, openEnd);
		result += replaceProductNameInCode(block.slice(openEnd, closeStart), productName);
		result += block.slice(closeStart);
		offset = matchIndex + block.length;
	}
	result += contents.slice(offset).replaceAll(TEMPLATE_PRODUCT_NAME, () => escapeXml(productName));
	return result;
}

function escapeMarkdownInline(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replace(/([\\`*_[\]{}()#+.!|~-])/g, '\\$1');
}

function replaceProductName(contents: string, extension: string, productName: string) {
	if (extension === '.svelte') return replaceProductNameInSvelte(contents, productName);
	if (['.ts', '.js', '.json', '.jsonc'].includes(extension)) {
		return replaceProductNameInCode(contents, productName);
	}
	if (['.html', '.svg', '.xml'].includes(extension)) {
		return contents.replaceAll(TEMPLATE_PRODUCT_NAME, () => escapeXml(productName));
	}
	if (['.md', '.txt'].includes(extension)) {
		return contents.replaceAll(TEMPLATE_PRODUCT_NAME, () => escapeMarkdownInline(productName));
	}
	return contents.replaceAll(TEMPLATE_PRODUCT_NAME, () => productName);
}

function generatedDeploymentGuide(manifest: ProductPlateManifest) {
	const profileSecrets =
		manifest.profile === 'prelaunch'
			? ['WAITLIST_FINGERPRINT_SECRET', 'WAITLIST_EXPORT_SECRET']
			: [
					'BETTER_AUTH_SECRET',
					'AUTUMN_SECRET_KEY',
					...(manifest.profile === 'ai-saas' ? ['OPENROUTER_API_KEY'] : [])
				];
	const secrets = [
		'CONVEX_DEPLOY_KEY',
		'CLOUDFLARE_API_TOKEN',
		'CLOUDFLARE_ACCOUNT_ID',
		'RESEND_API_KEY',
		...profileSecrets
	];
	return `\n\n## Deployment configuration\n\nCreate protected GitHub environments named \`preview\` and \`production\`. Add these secrets to each environment with environment-specific values: ${secrets.map((name) => `\`${name}\``).join(', ')}. The preview environment's \`CONVEX_DEPLOY_KEY\` must be a Convex preview deploy key; production must use its production deploy key. In each environment, add \`CLOUDFLARE_PROJECT_NAME\`, \`PUBLIC_POSTHOG_KEY\`, \`PUBLIC_SENTRY_DSN\`, \`SUPPORT_EMAIL\`, and a real sender such as \`Product <mail@your-domain.com>\` in \`TRANSACTIONAL_EMAIL_FROM\`. Set \`PUBLIC_POSTHOG_HOST\` too when the project does not use PostHog's default host. In production only, set \`SITE_URL\` and set \`product.productionUrl\` in \`product-plate.json\` to the same final HTTPS origin. Preview auth uses the URL returned by Cloudflare. The strict production doctor treats the final URL and provider values as launch requirements. Use a different Cloudflare Pages project name in each GitHub environment so preview and production runtime secrets cannot overlap; the workflow creates a missing project with \`main\` as its production branch.\n\nThe generated workflow provisions encrypted Cloudflare Pages bindings and Convex deployment variables before it reports success. It derives only \`PRODUCT_NAME\` from \`product-plate.json\`, serializes preview and production Pages updates, and checks \`/api/health\` plus the selected profile's real API route after deployment. Missing, invalid, and reserved example-domain sender addresses fail before runtime configuration changes.\n`;
}

async function rewriteTextFiles(
	directory: string,
	productName: string,
	replacements: Array<[RegExp, string]>
) {
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
			if (!textExtensions.has(extension) && entry.name !== 'AGENTS.md') continue;
			let contents = await readFile(target, 'utf8');
			for (const [pattern, replacement] of replacements) {
				contents = contents.replace(pattern, () => replacement);
			}
			contents = replaceProductName(contents, extension, productName);
			await writeFile(target, contents);
		}
	};
	await visit(directory);
}

function generatedReadme(manifest: ProductPlateManifest) {
	const productName = escapeMarkdownInline(manifest.product.name);
	const deploymentGuide = generatedDeploymentGuide(manifest);
	const authRecipe =
		manifest.providers.auth === 'better-auth'
			? '\n\nProduction examples require email verification and configured delivery. Magic-link sign-in is available as an opt-in Better Auth recipe: set `AUTH_MAGIC_LINK_ENABLED=true`, configure Resend, and add a deliberate magic-link control to the sign-in screen. It is disabled by default.'
			: '';
	return `# ${productName}\n\n${manifest.product.description}\n\n## Start locally\n\n\`\`\`sh\nbun install\nbun convex dev\nbun run dev\n\`\`\`\n\nThe generator created an ignored \`.env.local\` with secure local secrets and safe placeholder provider values. Replace those values as you connect services. If you initialized with \`--no-install\`, run \`bun install\` and commit the new \`bun.lock\` before pushing; generated CI uses a frozen lockfile and checks formatting. Run \`bun run doctor\` at any time, and \`bun run verify:launch\` before a production deploy.${authRecipe}\n\n## Product profile\n\nThis app was generated with the \`${manifest.profile}\` Product Plate profile. Its selected capabilities are recorded in \`product-plate.json\`.${deploymentGuide}\n`;
}

function generatedStartHere(manifest: ProductPlateManifest) {
	return `# ${escapeMarkdownInline(manifest.product.name)}: product kickstart\n\nThe generator has already selected the \`${manifest.profile}\` profile and removed unrelated starter surfaces. Build the first complete product loop without adding back excluded showcases.\n\n## Active capabilities\n\n${manifest.capabilities.map((capability) => `- ${capability}`).join('\n')}\n\nUpdate \`product-plate.json\`, README, product copy, tests, environment examples, and deployment checks whenever the selected product loop changes.\n`;
}

function generatedAgents(manifest: ProductPlateManifest) {
	return `# ${escapeMarkdownInline(manifest.product.name)} project guidance\n\n- Use Bun for package and script commands.\n- The active profile is \`${manifest.profile}\`. Do not restore excluded Product Plate demo surfaces.\n- The selected capabilities are: ${manifest.capabilities.join(', ')}.\n- Keep Convex backend changes backward compatible during deployment.\n- Use TDD for testable behavior.\n- Run \`bun run verify:launch\` before production deployment.\n- Do not commit or deploy without explicit authorization.\n`;
}

async function rewritePackageJson(
	destination: string,
	manifest: ProductPlateManifest,
	removeDependencies: Array<string>,
	generatorSpecifier: string
) {
	interface GeneratedPackageJson {
		name?: string;
		version?: string;
		private?: boolean;
		workspaces?: unknown;
		repository?: unknown;
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
		scripts?: Record<string, string>;
	}
	const packagePath = join(destination, 'package.json');
	// SAFETY: the template package.json is committed and always parses.
	const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as GeneratedPackageJson;
	packageJson.name = manifest.product.slug;
	packageJson.version = '0.1.0';
	packageJson.private = true;
	delete packageJson.workspaces;
	delete packageJson.repository;
	for (const dependency of removeDependencies) {
		delete packageJson.dependencies?.[dependency];
		delete packageJson.devDependencies?.[dependency];
	}
	const devDependencies = { ...packageJson.devDependencies };
	devDependencies['create-product-plate'] = generatorSpecifier;
	packageJson.devDependencies = devDependencies;
	packageJson.scripts = {
		dev: 'vite dev',
		build: 'vite build',
		preview: 'vite preview',
		prepare: 'svelte-kit sync',
		check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
		format: 'oxfmt --write .',
		'format:check': 'oxfmt --check .',
		lint: 'oxfmt --check . && oxlint',
		'test:unit': 'vitest run',
		'test:e2e': 'playwright test',
		audit: 'bun audit --audit-level high',
		verify: 'bun run lint && bun run check && bun run test:unit',
		doctor: 'product-plate doctor',
		'verify:launch':
			'bun run lint && bun run check && bun run test:unit && bun run audit && bun run build && bun run test:e2e && bun run doctor -- --strict'
	};
	if (manifest.profile === 'prelaunch') {
		packageJson.scripts['waitlist:export'] = 'bun scripts/waitlist-export.ts';
	}
	await writeFile(packagePath, `${JSON.stringify(packageJson, null, '\t')}\n`);
}

function escapeXml(value: string) {
	const entities = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&apos;'
	} as const;

	return value.replace(/[&<>"']/g, (character) => {
		// SAFETY: the regex above only matches the five entity keys.
		return entities[character as keyof typeof entities];
	});
}

function wrapSocialDescription(value: string) {
	const lines = [''];
	for (const word of value.trim().split(/\s+/)) {
		const current = lines.at(-1) ?? '';
		if (current && `${current} ${word}`.length > 62 && lines.length < 2) lines.push(word);
		else lines[lines.length - 1] = current ? `${current} ${word}` : word;
	}
	return lines.map((line) => escapeXml(line.slice(0, 72)));
}

function generatedSocialImage(manifest: ProductPlateManifest) {
	const displayName = manifest.product.name.slice(0, 42);
	const name = escapeXml(displayName);
	const nameFontSize = displayName.length > 28 ? 56 : displayName.length > 20 ? 66 : 76;
	const description = wrapSocialDescription(manifest.product.description.slice(0, 130));
	const profile = escapeXml(manifest.profile.replace('-', ' '));
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
  <title id="title">${name}</title>
  <desc id="description">${description}</desc>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#09090b" />
      <stop offset="1" stop-color="#27272a" />
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.12" r="0.72">
      <stop offset="0" stop-color="#a78bfa" stop-opacity="0.52" />
      <stop offset="1" stop-color="#a78bfa" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="630" rx="32" fill="url(#background)" />
  <rect width="1200" height="630" rx="32" fill="url(#glow)" />
  <path d="M84 116h52v12H96v40H84z" fill="#c4b5fd" />
  <text x="84" y="230" fill="#fafafa" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${nameFontSize}" font-weight="700" letter-spacing="-2">${name}</text>
  <text x="88" y="310" fill="#d4d4d8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30">${description.map((line, index) => `<tspan x="88" dy="${index === 0 ? 0 : 46}">${line}</tspan>`).join('')}</text>
  <g transform="translate(84 496)">
    <rect width="230" height="54" rx="27" fill="#fafafa" fill-opacity="0.1" stroke="#fafafa" stroke-opacity="0.2" />
    <text x="26" y="35" fill="#e4e4e7" font-family="ui-monospace, SFMono-Regular, monospace" font-size="20" letter-spacing="1">${profile}</text>
  </g>
</svg>
`;
}

async function writeGeneratedConfiguration(destination: string, manifest: ProductPlateManifest) {
	await writeFile(
		join(destination, 'product-plate.json'),
		`${JSON.stringify(manifest, null, '\t')}\n`
	);
	await writeFile(join(destination, 'README.md'), generatedReadme(manifest));
	await writeFile(join(destination, 'START_HERE.md'), generatedStartHere(manifest));
	await writeFile(join(destination, 'AGENTS.md'), generatedAgents(manifest));
	await mkdir(join(destination, 'static'), { recursive: true });
	await writeFile(join(destination, 'static/og.svg'), generatedSocialImage(manifest));
	await rm(join(destination, 'static/og.png'), { force: true });
	await writeFile(
		join(destination, 'src/app.html'),
		`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
		<link rel="apple-touch-icon" href="/pwa-192x192.png" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
`
	);
	let localEnvironment = await readFile(join(destination, '.env.example'), 'utf8');
	const secrets =
		manifest.profile === 'prelaunch'
			? [
					['WAITLIST_FINGERPRINT_SECRET', randomBytes(32).toString('base64url')],
					['WAITLIST_EXPORT_SECRET', randomBytes(32).toString('base64url')]
				]
			: [['BETTER_AUTH_SECRET', randomBytes(32).toString('base64url')]];
	for (const [name, value] of secrets) {
		const setting = new RegExp(`^${name}=.*$`, 'm');
		if (!setting.test(localEnvironment)) {
			throw new Error(`Generated environment is missing ${name}.`);
		}
		localEnvironment = localEnvironment.replace(setting, `${name}=${value}`);
	}
	localEnvironment = `# Local configuration. This file is ignored by Git.\n${localEnvironment}`;
	await writeFile(join(destination, '.env.local'), localEnvironment, { mode: 0o600 });
}

async function writeManagedState(
	destination: string,
	templateVersion: string,
	profile: ProductPlateManifest['profile']
) {
	await mkdir(join(destination, '.product-plate'), { recursive: true });
	const managedState = await createManagedState(
		destination,
		templateVersion,
		[
			'.github/workflows/deploy.yml',
			'.github/workflows/quality.yml',
			'scripts/build-for-convex.ts',
			'scripts/provision-runtime.ts',
			'scripts/smoke-deploy.ts',
			'src/convex/readiness.ts',
			'src/routes/api/health/+server.ts'
		],
		profile
	);
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

export async function generateProject(
	options: GenerateProjectOptions,
	dependencies: Partial<GeneratorDependencies> = {}
) {
	const destination = resolve(options.destination);
	const destinationExisted = await pathExists(destination);
	await ensureSafeDestination(destination);
	const definition = resolveProfile(options.profile);
	const templateVersion = options.templateVersion ?? GENERATOR_VERSION;
	const generatorVersion = options.generatorVersion ?? GENERATOR_VERSION;
	const productSlug = slugify(options.name);
	const manifest = productPlateManifestSchema.parse({
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
	});
	let downloaded: DownloadedTemplate | null = null;
	let scaffoldStarted = false;
	let generatedSourceComplete = false;
	const execute = dependencies.runCommand ?? runCommand;

	try {
		downloaded = options.templatePath
			? null
			: await (dependencies.downloadTemplate ?? downloadTemplate)(templateVersion);
		const templatePath = resolve(options.templatePath ?? downloaded!.path);
		if (!(await pathExists(join(templatePath, 'package.json')))) {
			throw new Error(`Template path does not contain a package.json: ${templatePath}`);
		}
		assertSeparateTemplateAndDestination(templatePath, destination);
		await assertTemplateHasNoSymlinks(templatePath);
		await mkdir(dirname(destination), { recursive: true });
		scaffoldStarted = true;
		await cp(templatePath, destination, {
			recursive: true,
			verbatimSymlinks: true,
			filter: (source) => shouldCopyTemplateSource(source, templatePath)
		});
		await removePaths(destination, definition.removePaths);
		await rewriteTextFiles(destination, manifest.product.name, [
			[/productplate\.pages\.dev/g, `${productSlug}.pages.dev`],
			[/productplate/g, productSlug]
		]);
		await rewritePackageJson(
			destination,
			manifest,
			definition.removeDependencies,
			options.templatePath ? `file:${resolve(import.meta.dir, '..')}` : `^${generatorVersion}`
		);
		await Promise.all([
			rm(join(destination, 'bun.lock'), { force: true }),
			rm(join(destination, 'bun.lockb'), { force: true })
		]);
		await applyProfileTransforms(destination, manifest);
		if (manifest.providers.auth === 'better-auth') await stripGeneratedDemoCode(destination);
		await pruneUnreachableLibraryFiles(destination);
		await pruneUnusedDependencies(destination);
		await writeGeneratedConfiguration(destination, manifest);
		await formatGeneratedProject(destination);
		await writeManagedState(destination, manifest.templateVersion, manifest.profile);
		generatedSourceComplete = true;
		try {
			if (options.install) {
				await execute([execPath, 'install'], destination, 'Dependency install');
				await execute([execPath, 'run', 'format'], destination, 'Generated source formatting');
				await writeManagedState(destination, manifest.templateVersion, manifest.profile);
			}
			if (options.git) {
				await execute(['git', 'init'], destination, 'Git initialization');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(
				`Project files were generated, but a finishing step failed (${message}). The generated source was kept at ${destination}.`,
				{ cause: error }
			);
		}
		return { destination, manifest };
	} catch (error) {
		if (scaffoldStarted && !generatedSourceComplete) {
			await rm(destination, { recursive: true, force: true });
			if (destinationExisted) await mkdir(destination, { recursive: true });
		}
		throw error;
	} finally {
		if (downloaded) await rm(downloaded.cleanup, { recursive: true, force: true });
	}
}
