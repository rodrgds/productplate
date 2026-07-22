import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { DoctorCheck, DoctorResult, ProductPlateManifest } from './types.ts';

interface DoctorOptions {
	cwd: string;
	strict: boolean;
	live?: boolean;
	env?: Record<string, string | undefined>;
}

const placeholders = ['your-project', 'yourdomain.com', 'example.com', 'productplate.pages.dev'];

function statusForMissing(strict: boolean): DoctorCheck['status'] {
	return strict ? 'failure' : 'warning';
}

function envCheck(
	env: Record<string, string | undefined>,
	key: string,
	strict: boolean,
	selected = true
): DoctorCheck {
	const configured = Boolean(env[key]?.trim());
	return {
		id: `env.${key}`,
		label: `${key} is configured`,
		status: configured ? 'pass' : selected ? statusForMissing(strict) : 'warning',
		message: configured ? `${key} is set.` : `${key} is not configured.`
	};
}

async function searchText(directory: string, needles: Array<string>) {
	const matches: Array<string> = [];
	const visit = async (path: string) => {
		for (const entry of await readdir(path, { withFileTypes: true })) {
			if (['.git', 'node_modules', '.svelte-kit'].includes(entry.name)) continue;
			const target = join(path, entry.name);
			if (entry.isDirectory()) {
				await visit(target);
				continue;
			}
			if (!/\.(?:md|svelte|ts|js|json|jsonc|html|xml|txt)$/.test(entry.name)) continue;
			const content = await readFile(target, 'utf8');
			if (needles.some((needle) => content.toLowerCase().includes(needle.toLowerCase()))) {
				matches.push(target.slice(directory.length + 1));
			}
		}
	};
	await visit(directory);
	return matches;
}

async function exists(path: string) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

async function readOptional(path: string) {
	try {
		return await readFile(path, 'utf8');
	} catch {
		return '';
	}
}

function configurationCheck(
	id: string,
	label: string,
	configured: boolean,
	strict: boolean,
	missingMessage: string
): DoctorCheck {
	return {
		id,
		label,
		status: configured ? 'pass' : statusForMissing(strict),
		message: configured ? `${label}.` : missingMessage
	};
}

async function liveCheck(url: string, id: string, label: string): Promise<DoctorCheck> {
	try {
		const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10_000) });
		return {
			id,
			label,
			status: response.ok ? 'pass' : 'failure',
			message: response.ok
				? `${label} responded successfully.`
				: `${label} returned ${response.status}.`
		};
	} catch {
		return { id, label, status: 'failure', message: `${label} could not be reached.` };
	}
}

export async function runDoctor(options: DoctorOptions): Promise<DoctorResult> {
	const env = options.env ?? process.env;
	const manifest = (await Bun.file(
		join(options.cwd, 'product-plate.json')
	).json()) as ProductPlateManifest;
	if (manifest.schemaVersion !== 1)
		throw new Error('Unsupported product-plate.json schema version.');
	const checks: Array<DoctorCheck> = [];
	for (const key of ['PUBLIC_CONVEX_URL', 'PUBLIC_CONVEX_SITE_URL']) {
		checks.push(envCheck(env, key, options.strict));
		const value = env[key];
		checks.push(
			configurationCheck(
				`url.${key}`,
				`${key} uses a final HTTPS URL`,
				Boolean(
					value?.startsWith('https://') &&
						!placeholders.some((placeholder) => value.includes(placeholder))
				),
				options.strict,
				`${key} must be a final HTTPS provider URL.`
			)
		);
	}
	if (manifest.profile === 'prelaunch') {
		checks.push(envCheck(env, 'WAITLIST_FINGERPRINT_SECRET', options.strict));
		checks.push(envCheck(env, 'WAITLIST_EXPORT_SECRET', options.strict));
		checks.push(envCheck(env, 'RESEND_API_KEY', options.strict));
	} else {
		for (const key of [
			'SITE_URL',
			'BETTER_AUTH_URL',
			'BETTER_AUTH_SECRET',
			'RESEND_API_KEY',
			'AUTUMN_SECRET_KEY'
		]) {
			checks.push(envCheck(env, key, options.strict));
		}
		const verificationEnabled = env.AUTH_REQUIRE_EMAIL_VERIFICATION === 'true';
		checks.push({
			id: 'auth.email-verification',
			label: 'Production email verification is enabled',
			status: verificationEnabled ? 'pass' : statusForMissing(options.strict),
			message: verificationEnabled
				? 'Email verification is required.'
				: 'Set AUTH_REQUIRE_EMAIL_VERIFICATION=true for production.'
		});
	}
	if (manifest.profile === 'ai-saas')
		checks.push(envCheck(env, 'OPENROUTER_API_KEY', options.strict));
	checks.push(envCheck(env, 'PUBLIC_POSTHOG_KEY', options.strict));
	checks.push(envCheck(env, 'PUBLIC_SENTRY_DSN', options.strict));
	checks.push(envCheck(env, 'SUPPORT_EMAIL', options.strict));

	const productUrl = manifest.product.productionUrl;
	const validProductionUrl = Boolean(
		productUrl &&
			productUrl.startsWith('https://') &&
			!placeholders.some((value) => productUrl.includes(value))
	);
	checks.push({
		id: 'product.production-url',
		label: 'Production URL is final',
		status: validProductionUrl ? 'pass' : statusForMissing(options.strict),
		message: validProductionUrl
			? 'Production URL is configured.'
			: 'Set a final HTTPS production URL.'
	});

	if (manifest.providers.auth === 'better-auth') {
		const siteUrl = env.SITE_URL?.replace(/\/$/, '');
		const authUrl = env.BETTER_AUTH_URL?.replace(/\/$/, '');
		checks.push(
			configurationCheck(
				'auth.redirect-origin',
				'Authentication redirects use the production origin',
				Boolean(siteUrl && authUrl && siteUrl === authUrl),
				options.strict,
				'SITE_URL and BETTER_AUTH_URL must use the same final origin.'
			)
		);
	}

	const brandingRoots = ['src', 'static', 'content'].map((path) => join(options.cwd, path));
	const starterBranding = (
		await Promise.all(
			brandingRoots.map(async (root) =>
				(await exists(root))
					? await searchText(root, ['Product Plate', 'productplate.pages.dev'])
					: []
			)
		)
	).flat();
	checks.push({
		id: 'content.starter-branding',
		label: 'Starter branding is removed',
		status: starterBranding.length === 0 ? 'pass' : options.strict ? 'failure' : 'warning',
		message:
			starterBranding.length === 0
				? 'No starter branding was found.'
				: `Starter branding remains in ${starterBranding.slice(0, 5).join(', ')}.`
	});

	const privacy = await readOptional(join(options.cwd, 'src/routes/legal/privacy/+page.svelte'));
	const terms = await readOptional(join(options.cwd, 'src/routes/legal/terms/+page.svelte'));
	const legalReady =
		privacy.length > 0 &&
		terms.length > 0 &&
		![privacy, terms].some((content) =>
			/starter|placeholder|replace (?:it|them)|counsel-reviewed/i.test(content)
		);
	checks.push(
		configurationCheck(
			'content.legal',
			'Legal pages are launch-ready',
			legalReady,
			options.strict,
			'Replace the starter privacy and terms text before launch.'
		)
	);

	const metadataReady =
		(await exists(join(options.cwd, 'src/lib/components/seo.svelte'))) &&
		(await exists(join(options.cwd, 'src/lib/constants.ts')));
	checks.push(
		configurationCheck(
			'content.metadata',
			'Canonical and social metadata are wired',
			metadataReady,
			options.strict,
			'Add the shared typed SEO helper and product metadata constants.'
		)
	);
	checks.push(
		configurationCheck(
			'content.sitemap',
			'Sitemap output is configured',
			await exists(join(options.cwd, 'src/routes/sitemap.xml/+server.ts')),
			options.strict,
			'Add the generated sitemap route.'
		)
	);

	const blogDirectory = join(options.cwd, 'content/blog');
	const blogFiles = (await exists(blogDirectory))
		? (await readdir(blogDirectory)).filter((file) => file.endsWith('.svx'))
		: [];
	const publicShell = await readOptional(
		join(options.cwd, 'src/lib/components/public-page-shell.svelte')
	);
	const linksToEmptyBlog =
		blogFiles.length === 0 &&
		(/href=["'{`]\/blog/.test(publicShell) || /resolve\(['"]\/blog['"]\)/.test(publicShell));
	checks.push(
		configurationCheck(
			'content.empty-blog',
			'Public links do not point to an empty blog',
			!linksToEmptyBlog,
			options.strict,
			'Publish a post or remove the public blog link. Keep the empty blog noindex.'
		)
	);

	const packageJson = (await Bun.file(join(options.cwd, 'package.json')).json()) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};
	const installed = { ...packageJson.dependencies, ...packageJson.devDependencies };
	const forbidden = [
		...(manifest.profile !== 'ai-saas' ? ['@ai-sdk/svelte', 'ai'] : []),
		...(manifest.profile === 'prelaunch' ? ['better-auth', '@useautumn/convex'] : []),
		'@threlte/core',
		'@xyflow/svelte',
		'maplibre-gl'
	].filter((dependency) => dependency in installed);
	checks.push({
		id: 'dependencies.profile',
		label: 'Dependencies match the profile',
		status: forbidden.length === 0 ? 'pass' : 'failure',
		message:
			forbidden.length === 0
				? 'No excluded profile dependencies are installed.'
				: `Remove excluded dependencies: ${forbidden.join(', ')}.`
	});

	const excludedRouteCandidates = [
		'src/routes/auth/demo',
		'src/routes/components',
		'src/routes/theme-builder',
		'src/routes/(app)/map',
		'src/routes/(app)/flow',
		'src/routes/(app)/threlte',
		...(manifest.profile !== 'ai-saas' ? ['src/routes/(app)/assistant'] : []),
		...(manifest.profile !== 'team-saas'
			? ['src/routes/(app)/workspace', 'src/routes/(app)/invite']
			: [])
	];
	const remainingExcludedRoutes = [];
	for (const path of excludedRouteCandidates) {
		if (await exists(join(options.cwd, path))) remainingExcludedRoutes.push(path);
	}
	checks.push({
		id: 'routes.profile',
		label: 'Routes match the selected profile',
		status: remainingExcludedRoutes.length === 0 ? 'pass' : 'failure',
		message:
			remainingExcludedRoutes.length === 0
				? 'No excluded profile routes remain.'
				: `Remove excluded routes: ${remainingExcludedRoutes.join(', ')}.`
	});

	if (options.live) {
		if (productUrl) {
			checks.push(await liveCheck(productUrl, 'live.landing', 'Deployed landing page'));
			const primaryPaths = {
				prelaunch: '/',
				'solo-saas': '/dashboard',
				'team-saas': '/workspace',
				'ai-saas': '/assistant'
			} as const;
			checks.push(
				await liveCheck(
					new URL(primaryPaths[manifest.profile], productUrl).toString(),
					'live.primary',
					`${manifest.profile} primary smoke path`
				)
			);
		}
		if (env.PUBLIC_CONVEX_URL) {
			checks.push(await liveCheck(env.PUBLIC_CONVEX_URL, 'live.convex', 'Convex deployment'));
		}
		if (manifest.providers.auth === 'better-auth' && productUrl) {
			checks.push(
				await liveCheck(`${productUrl}/api/auth/ok`, 'live.auth', 'Deployed authentication health')
			);
		}
	}

	const summary = {
		pass: checks.filter((check) => check.status === 'pass').length,
		warning: checks.filter((check) => check.status === 'warning').length,
		failure: checks.filter((check) => check.status === 'failure').length
	};
	return {
		schemaVersion: 1,
		profile: manifest.profile,
		strict: options.strict,
		live: Boolean(options.live),
		checks,
		summary
	};
}

export function formatDoctorResult(result: DoctorResult) {
	const glyph = { pass: 'PASS', warning: 'WARN', failure: 'FAIL' } as const;
	const lines = result.checks.map(
		(check) => `${glyph[check.status].padEnd(4)}  ${check.label}\n      ${check.message}`
	);
	lines.push(
		`\n${result.summary.pass} passed, ${result.summary.warning} warnings, ${result.summary.failure} failures.`
	);
	return lines.join('\n');
}
