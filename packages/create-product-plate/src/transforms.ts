import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import type { ProductPlateManifest } from './types.ts';

async function write(destination: string, relativePath: string, content: string) {
	const target = join(destination, relativePath);
	await mkdir(dirname(target), { recursive: true });
	await writeFile(target, content);
}

function constants(manifest: ProductPlateManifest) {
	const url = manifest.product.productionUrl ?? `https://${manifest.product.slug}.pages.dev`;
	return `export const APP_NAME = ${JSON.stringify(manifest.product.name)};
export const APP_SHORT_NAME = APP_NAME;
export const APP_LEGAL_NAME = APP_NAME;
export const APP_YEAR = ${new Date().getFullYear()};
export const APP_URL = ${JSON.stringify(url)};
export const APP_DESCRIPTION = ${JSON.stringify(manifest.product.description)};
export const APP_TAGLINE = ${JSON.stringify(manifest.product.description)};
export const APP_SOCIAL_TITLE = ${JSON.stringify(manifest.product.name)};
export const APP_SOCIAL_DESCRIPTION = APP_DESCRIPTION;
export const APP_KEYWORDS = [${JSON.stringify(manifest.product.name)}, 'SvelteKit', 'Convex'] as const;
export const APP_OG_IMAGE_PATH = '/og.svg';
export const APP_OG_IMAGE_URL = \`\${APP_URL}\${APP_OG_IMAGE_PATH}\`;
export const APP_TWITTER_CARD = 'summary_large_image';
export const DEFAULT_LOGO_PATH = '/favicon.svg';
export const APP_THEME_COLOR = '#181817';
export const APP_BACKGROUND_COLOR = '#181817';
export const APP_DISPLAY = 'standalone' as const;
export const APP_ORIENTATION = 'portrait' as const;
`;
}

function rootLayout(authenticated: boolean) {
	return `<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import AnalyticsConsent from '$lib/components/analytics-consent.svelte';
	import { APP_KEYWORDS, APP_NAME, APP_OG_IMAGE_URL, APP_THEME_COLOR, APP_TWITTER_CARD } from '$lib/constants';
${authenticated ? "\timport { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte';\n\timport { authClient } from '$lib/auth-client';\n\tcreateSvelteAuthClient({ authClient });\n" : ''}
	let { children } = $props();
</script>

<svelte:head>
	<meta name="keywords" content={APP_KEYWORDS.join(', ')} />
	<meta name="application-name" content={APP_NAME} />
	<meta name="theme-color" content={APP_THEME_COLOR} />
	<link rel="icon" href={favicon} />
	<meta property="og:site_name" content={APP_NAME} />
	<meta property="og:image" content={APP_OG_IMAGE_URL} />
	<meta name="twitter:card" content={APP_TWITTER_CARD} />
</svelte:head>

<ModeWatcher />
<AnalyticsConsent />
{@render children?.()}
`;
}

function landingPage(manifest: ProductPlateManifest) {
	const authenticated = manifest.providers.auth === 'better-auth';
	return `<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AppLogo from '$lib/components/app-logo.svelte';
	import Seo from '$lib/components/seo.svelte';
${authenticated ? "\timport { env } from '$env/dynamic/public';\n\timport { getBrowserTelemetry } from '$lib/telemetry-browser';\n" : ''}
${authenticated ? '' : "\timport WaitlistForm from '$lib/components/waitlist-form.svelte';\n"}
	import { APP_DESCRIPTION, APP_NAME, APP_URL } from '$lib/constants';
	const schema = {
		'@context': 'https://schema.org',
		'@graph': [
			{ '@type': 'WebSite', name: APP_NAME, url: APP_URL },
			{ '@type': 'Organization', name: APP_NAME, url: APP_URL }
		]
	};
${authenticated ? "\tfunction captureCta() { getBrowserTelemetry(env.PUBLIC_POSTHOG_KEY, env.PUBLIC_POSTHOG_HOST).capture('landing_cta_clicked', { path: location.pathname, source: 'hero' }); }\n" : ''}
</script>

<Seo title={APP_NAME} description={APP_DESCRIPTION} canonical={APP_URL} {schema} />

<main class="min-h-screen bg-background text-foreground">
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
		<a href={resolve('/')} class="flex items-center gap-3 font-semibold"><AppLogo class="size-8 rounded-lg" />{APP_NAME}</a>
		<div class="flex items-center gap-4 text-sm">
			<a href={resolve('/legal/privacy')}>Privacy</a>
			<a href={resolve('/legal/terms')}>Terms</a>
			{#if page.data.supportEmail}<a href={'mailto:' + page.data.supportEmail}>Contact</a>{/if}
		</div>
	</nav>
	<section class="mx-auto max-w-6xl px-6 py-24 sm:py-32">
		<p class="text-sm font-medium text-primary">${authenticated ? 'Now available' : 'Launching soon'}</p>
		<h1 class="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-7xl">{APP_NAME}</h1>
		<p class="mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">{APP_DESCRIPTION}</p>
		<div class="mt-9">
			${authenticated ? '<a href={resolve(\'/auth/sign-up\')} onclick={captureCta} class="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">Create account</a>' : '<WaitlistForm />'}
		</div>
	</section>
</main>
`;
}

function dashboardPage() {
	return `<script lang="ts">
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	const profile = useQuery(api.userProfiles.getCurrent, {});
</script>

<svelte:head><title>Dashboard</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<header class="flex h-14 items-center border-b px-4"><Sidebar.Trigger /><h1 class="ml-3 font-medium">Dashboard</h1></header>
<main class="p-6 md:p-10">
	<h2 class="text-3xl font-semibold">Welcome{#if profile.data?.displayName}, {profile.data.displayName}{/if}</h2>
	<p class="mt-3 max-w-2xl text-muted-foreground">Connect your first real product action here. This profile does not include sample metrics or fake activity.</p>
</main>
`;
}

function appLayoutServer() {
	return `import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { redirect } from '@sveltejs/kit';
import { api } from '$convex/_generated/api';
import { resolve } from '$app/paths';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.token) redirect(303, resolve('/auth/sign-in'));
	const client = createConvexHttpClient({ token: locals.token });
	const currentUser = await client.query(api.auth.getCurrentUser, {});
	if (!currentUser) redirect(303, resolve('/auth/sign-in'));
	const profile = await client.query(api.userProfiles.getCurrent, {});
	const isOnboarding = url.pathname.replace(/\\/$/, '') === resolve('/onboarding').replace(/\\/$/, '');
	if (!profile && !isOnboarding) redirect(303, resolve('/onboarding'));
	if (profile && isOnboarding) redirect(303, resolve('/dashboard'));
	return { currentUser, profile };
};
`;
}

function appLayout() {
	return `<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	let { children }: { children: Snippet } = $props();
</script>
<svelte:head><meta name="robots" content="noindex,nofollow" /></svelte:head>
<Sidebar.Provider><AppSidebar /><Sidebar.Inset>{@render children()}</Sidebar.Inset></Sidebar.Provider>
`;
}

function appSidebar(manifest: ProductPlateManifest) {
	const team = manifest.profile === 'team-saas';
	const ai = manifest.profile === 'ai-saas';
	const icons = [
		'LayoutDashboard',
		'CreditCard',
		'Settings',
		'Users',
		'MessageSquareWarning',
		...(team ? ['Building2'] : []),
		...(ai ? ['MessageSquareText'] : [])
	].join(', ');
	return `<script lang="ts">
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { ${icons} } from '@lucide/svelte';
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavAdmin from './nav-admin.svelte';
	import NavUser from './nav-user.svelte';
	import AppLogo from './app-logo.svelte';
	import { APP_NAME } from '$lib/constants';
	import { getBrowserTelemetry } from '$lib/telemetry-browser';
	const currentUser = useQuery(api.auth.getCurrentUser, {});
	let user = $derived(currentUser.data);
	let identifiedUserId: string | undefined;
	$effect(() => { if (user?._id && user._id !== identifiedUserId) { identifiedUserId = user._id; getBrowserTelemetry(env.PUBLIC_POSTHOG_KEY, env.PUBLIC_POSTHOG_HOST).identify(user._id); } });
	let isAdmin = $derived(user?.role === 'admin');
	const navMain = [
		{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
		{ title: 'Billing', url: '/billing', icon: CreditCard },
${team ? "\t\t{ title: 'Workspace', url: '/workspace', icon: Building2 },\n" : ''}${ai ? "\t\t{ title: 'Assistant', url: '/assistant', icon: MessageSquareText },\n" : ''}
	];
</script>
<Sidebar.Root collapsible="icon">
	<Sidebar.Header><Sidebar.Menu><Sidebar.MenuItem><Sidebar.MenuButton>{#snippet child({ props })}<a href={resolve('/')} {...props}><AppLogo class="size-5" /><span>{APP_NAME}</span></a>{/snippet}</Sidebar.MenuButton></Sidebar.MenuItem></Sidebar.Menu></Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navMain} />
		{#if isAdmin}<NavAdmin items={[{ name: 'Users', url: '/admin/users', icon: Users }, { name: 'Feedback', url: '/admin/feedback', icon: MessageSquareWarning }]} />{/if}
		<NavSecondary items={[{ title: 'Settings', url: '/settings', icon: Settings }]} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer><NavUser user={{ name: user?.name ?? 'User', email: user?.email ?? '', avatar: user?.image ?? '' }} /></Sidebar.Footer>
</Sidebar.Root>
`;
}

function prelaunchHooks() {
	return `import type { Handle, HandleServerError } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { handleErrorWithSentry, initCloudflareSentryHandle, sentryHandle, setTag } from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import { scrubSentryEvent } from '$lib/sentry';

const cloudflareSentryHandle = initCloudflareSentryHandle({ dsn: publicEnv.PUBLIC_SENTRY_DSN, enabled: Boolean(publicEnv.PUBLIC_SENTRY_DSN), release: env.GIT_SHA, sendDefaultPii: false, beforeSend: (event) => scrubSentryEvent(event, { gitSha: env.GIT_SHA }) });

const appHandle: Handle = async ({ event, resolve }) => {
	const startedAt = Date.now();
	const requestId = event.request.headers.get('x-request-id') ?? crypto.randomUUID();
	event.locals.requestId = requestId;
	setTag('request_id', requestId);
	if (env.GIT_SHA) setTag('git_sha', env.GIT_SHA);
	const resolved = await resolve(event);
	const response = new Response(resolved.body, resolved);
	response.headers.set('x-request-id', requestId);
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('x-frame-options', 'DENY');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	if (event.url.protocol === 'https:') response.headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
	if (env.OBSERVABILITY_LOG_REQUESTS === 'true') console.info('request.completed', { requestId, method: event.request.method, pathname: event.url.pathname, status: response.status, durationMs: Date.now() - startedAt });
	return response;
};

export const handle = sequence(cloudflareSentryHandle, sentryHandle(), appHandle);
const appHandleError: HandleServerError = ({ event, status, message }) => ({ message: status === 404 ? message : 'The request could not be completed.', requestId: event.locals.requestId });
export const handleError = handleErrorWithSentry(appHandleError);
`;
}

function publicPageShell() {
	return `<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { APP_NAME } from '$lib/constants';
	interface Props { children: Snippet; title?: string; eyebrow?: string; description?: string; }
	let { children, title, eyebrow, description }: Props = $props();
</script>
<nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-6"><a href={resolve('/')} class="font-semibold">{APP_NAME}</a><div class="flex gap-4 text-sm"><a href={resolve('/blog')}>Blog</a><a href={resolve('/legal/privacy')}>Privacy</a></div></nav>
<div id="main-content" class="mx-auto max-w-5xl px-6 py-16">
	{#if title}<header class="mb-10">{#if eyebrow}<p class="text-sm text-primary">{eyebrow}</p>{/if}<h1 class="mt-2 text-4xl font-semibold">{title}</h1>{#if description}<p class="mt-4 max-w-2xl text-muted-foreground">{description}</p>{/if}</header>{/if}
	{@render children()}
</div>
`;
}

function errorPage() {
	return `<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { APP_NAME } from '$lib/constants';
	let copied = $state(false);
	let requestId = $derived(page.error?.requestId);
	async function copy() { if (requestId) { await navigator.clipboard.writeText(requestId); copied = true; } }
</script>
<svelte:head><title>{page.status} | {APP_NAME}</title><meta name="robots" content="noindex" /></svelte:head>
<main class="grid min-h-screen place-items-center px-6"><div class="max-w-lg text-center"><p class="text-sm text-primary">Error {page.status}</p><h1 class="mt-3 text-3xl font-semibold">{page.status === 404 ? 'Page not found' : 'We could not load this page'}</h1><p class="mt-4 text-muted-foreground">{page.error?.message}</p>{#if requestId}<button class="mt-4 rounded-md border px-3 py-2 font-mono text-xs" onclick={copy}>{copied ? 'Request ID copied' : 'Copy request ID: ' + requestId}</button>{/if}<p class="mt-8 flex justify-center gap-4"><a href={resolve('/')} class="underline">Return home</a>{#if page.data.supportEmail}<a href={'mailto:' + page.data.supportEmail + '?subject=Support request ' + (requestId ?? '')} class="underline">Contact support</a>{/if}</p></div></main>
`;
}

function prelaunchSchema() {
	return `import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
export default defineSchema({
	waitlistSubscribers: defineTable({
		email: v.string(), emailNormalized: v.string(), status: v.union(v.literal('subscribed'), v.literal('unsubscribed')),
		source: v.optional(v.string()), utmSource: v.optional(v.string()), utmMedium: v.optional(v.string()), utmCampaign: v.optional(v.string()),
		createdAt: v.number(), updatedAt: v.number(), unsubscribedAt: v.optional(v.number())
	}).index('by_emailNormalized', ['emailNormalized']).index('by_status_and_createdAt', ['status', 'createdAt']),
	waitlistRateLimits: defineTable({ fingerprint: v.string(), windowStart: v.number(), count: v.number(), updatedAt: v.number() })
		.index('by_fingerprint_and_windowStart', ['fingerprint', 'windowStart']).index('by_updatedAt', ['updatedAt'])
});
`;
}

function environmentExample(manifest: ProductPlateManifest, production: boolean) {
	const transactionalEmailFrom = `${manifest.product.name} <no-reply@example.com>`;
	const lines = [
		`CONVEX_DEPLOYMENT=${production ? 'prod' : 'dev'}:your-project`,
		'PUBLIC_CONVEX_URL=https://your-project.convex.cloud',
		'PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site',
		`SITE_URL=${production ? (manifest.product.productionUrl ?? `https://${manifest.product.slug}.pages.dev`) : 'http://localhost:5173'}`,
		'SUPPORT_EMAIL=',
		'PUBLIC_POSTHOG_KEY=',
		'PUBLIC_POSTHOG_HOST=https://us.i.posthog.com',
		'PUBLIC_SENTRY_DSN=',
		'RESEND_API_KEY=',
		`TRANSACTIONAL_EMAIL_FROM="${transactionalEmailFrom.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
	];
	if (manifest.profile === 'prelaunch') {
		lines.push('WAITLIST_FINGERPRINT_SECRET=', 'WAITLIST_EXPORT_SECRET=');
	} else {
		lines.push(
			`BETTER_AUTH_URL=${production ? (manifest.product.productionUrl ?? `https://${manifest.product.slug}.pages.dev`) : 'http://localhost:5173'}`,
			'BETTER_AUTH_SECRET=',
			`AUTH_REQUIRE_EMAIL_VERIFICATION=${production ? 'true' : 'false'}`,
			'AUTH_MAGIC_LINK_ENABLED=false',
			'GOOGLE_CLIENT_ID=',
			'GOOGLE_CLIENT_SECRET=',
			'AUTUMN_SECRET_KEY='
		);
	}
	if (manifest.profile === 'ai-saas')
		lines.push('OPENROUTER_API_KEY=', 'CHAT_MODEL=openrouter/free');
	return `${lines.join('\n')}\n`;
}

function generatedAppCss(theme: ProductPlateManifest['theme']) {
	const palette =
		theme === 'claude'
			? {
					background: '0.965 0.012 80',
					foreground: '0.23 0.015 55',
					primary: '0.55 0.16 45',
					radius: '0.5rem'
				}
			: theme === 'zen'
				? {
						background: '0.97 0.008 105',
						foreground: '0.24 0.018 95',
						primary: '0.42 0.08 145',
						radius: '0.375rem'
					}
				: theme === 'neutral'
					? { background: '1 0 0', foreground: '0.18 0 0', primary: '0.22 0 0', radius: '0.5rem' }
					: {
							background: '0.985 0.002 95',
							foreground: '0.205 0.01 65',
							primary: '0.58 0.19 45',
							radius: '0.625rem'
						};
	return `@import 'tailwindcss';
@custom-variant dark (&:is(.dark *));
@theme inline {
	--color-background: var(--background); --color-foreground: var(--foreground);
	--color-card: var(--card); --color-card-foreground: var(--card-foreground);
	--color-popover: var(--popover); --color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive); --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);
	--radius-sm: calc(var(--radius) - 4px); --radius-md: calc(var(--radius) - 2px); --radius-lg: var(--radius); --radius-xl: calc(var(--radius) + 4px);
}
:root {
	--background: oklch(${palette.background}); --foreground: oklch(${palette.foreground});
	--card: oklch(${palette.background}); --card-foreground: oklch(${palette.foreground});
	--popover: oklch(${palette.background}); --popover-foreground: oklch(${palette.foreground});
	--primary: oklch(${palette.primary}); --primary-foreground: oklch(0.985 0 0);
	--secondary: oklch(0.94 0.006 90); --secondary-foreground: oklch(${palette.foreground});
	--muted: oklch(0.95 0.005 90); --muted-foreground: oklch(0.5 0.012 70);
	--accent: oklch(0.93 0.01 85); --accent-foreground: oklch(${palette.foreground});
	--destructive: oklch(0.58 0.22 27); --border: oklch(0.88 0.008 85); --input: oklch(0.88 0.008 85); --ring: oklch(${palette.primary}); --radius: ${palette.radius};
}
.dark { --background: oklch(0.18 0.008 75); --foreground: oklch(0.96 0.004 90); --card: oklch(0.22 0.008 75); --card-foreground: var(--foreground); --popover: var(--card); --popover-foreground: var(--foreground); --primary-foreground: oklch(0.12 0 0); --secondary: oklch(0.28 0.01 75); --secondary-foreground: var(--foreground); --muted: oklch(0.27 0.008 75); --muted-foreground: oklch(0.72 0.01 80); --accent: oklch(0.3 0.012 75); --accent-foreground: var(--foreground); --border: oklch(1 0 0 / 14%); --input: oklch(1 0 0 / 18%); }
@media (pointer: coarse), (max-width: 639px) { [data-slot='button'], [data-slot='input'] { min-width: 2.75rem; min-height: 2.75rem; } [data-slot='input'] { font-size: 1rem; } }
@layer base { * { @apply border-border outline-ring/50; } body { @apply bg-background text-foreground; font-family: Inter, ui-sans-serif, system-ui, sans-serif; } }
`;
}

function generatedQualityWorkflow(manifest: ProductPlateManifest) {
	const authEnvironment =
		manifest.providers.auth === 'better-auth'
			? `  BETTER_AUTH_URL: https://ci.example.com
  BETTER_AUTH_SECRET: ci-only-secret-that-is-never-deployed
`
			: '';
	return `name: Quality
on: [push, pull_request]
env:
  PUBLIC_CONVEX_URL: https://agreeable-otter-123.convex.cloud
  PUBLIC_CONVEX_SITE_URL: https://agreeable-otter-123.convex.site
  SITE_URL: https://ci.example.com
${authEnvironment}jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with: { bun-version: 1.3.13 }
      - run: bun install --frozen-lockfile
      - run: bunx playwright install --with-deps chromium
      - run: bun run lint
      - run: bun run check
      - run: bun run test:unit
      - run: bun run audit
      - run: bun run build
      - run: bun run test:e2e
        env: { PLAYWRIGHT_PREBUILT: 'true' }
`;
}

function generatedViteConfig() {
	return `/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: { environment: 'jsdom', testTimeout: 10_000, include: ['src/**/*.{test,spec}.{ts,svelte.ts}'] }
});
`;
}

function cloudflareRuntimeEnvironment(manifest: ProductPlateManifest) {
	return [
		'PUBLIC_CONVEX_URL',
		'PUBLIC_CONVEX_SITE_URL',
		'RESEND_API_KEY',
		'TRANSACTIONAL_EMAIL_FROM',
		...(manifest.profile === 'prelaunch'
			? ['WAITLIST_FINGERPRINT_SECRET', 'WAITLIST_EXPORT_SECRET']
			: ['BETTER_AUTH_SECRET']),
		...(manifest.profile === 'ai-saas' ? ['OPENROUTER_API_KEY'] : [])
	];
}

function convexRuntimeEnvironment(manifest: ProductPlateManifest) {
	return manifest.profile === 'prelaunch'
		? ['WAITLIST_EXPORT_SECRET']
		: [
				'SITE_URL',
				'BETTER_AUTH_URL',
				'BETTER_AUTH_SECRET',
				'AUTH_REQUIRE_EMAIL_VERIFICATION',
				'AUTH_MAGIC_LINK_ENABLED',
				'AUTUMN_SECRET_KEY',
				'RESEND_API_KEY',
				'TRANSACTIONAL_EMAIL_FROM',
				'PRODUCT_NAME'
			];
}

function provisionRuntimeScript(manifest: ProductPlateManifest) {
	const cloudflareRequired = cloudflareRuntimeEnvironment(manifest);
	const convexRequired = convexRuntimeEnvironment(manifest);
	return `#!/usr/bin/env bun
interface CommandInvocation {
	command: Array<string>;
	input: string;
	label: string;
}

interface ProvisionOptions {
	environment?: Record<string, string | undefined>;
	projectExists?: (projectName: string) => Promise<boolean>;
	run?: (invocation: CommandInvocation) => Promise<void>;
}

const requiredCloudflareEnvironment = ${JSON.stringify(cloudflareRequired)} as const;
const optionalCloudflareEnvironment = ['PUBLIC_POSTHOG_KEY', 'PUBLIC_POSTHOG_HOST', 'PUBLIC_SENTRY_DSN', 'SUPPORT_EMAIL'] as const;
const requiredConvexEnvironment = ${JSON.stringify(convexRequired)} as const;

async function runCommand({ command, input, label }: CommandInvocation) {
	const child = Bun.spawn(command, { stdin: 'pipe', stdout: 'inherit', stderr: 'inherit' });
	child.stdin.write(input);
	child.stdin.end();
	if ((await child.exited) !== 0) throw new Error(\`\${label} failed.\`);
}

async function pagesProjectExists(projectName: string) {
	const child = Bun.spawn(
		[process.execPath, 'x', 'wrangler@4.110.0', 'pages', 'project', 'list', '--json'],
		{ stdout: 'pipe', stderr: 'inherit' }
	);
	const output = await new Response(child.stdout).text();
	if ((await child.exited) !== 0) throw new Error('Cloudflare Pages project lookup failed.');
	const projects: unknown = JSON.parse(output);
	if (!Array.isArray(projects)) {
		throw new Error('Cloudflare Pages project lookup returned an unexpected response.');
	}
	return projects.some((project) => {
		if (typeof project !== 'object' || project === null) return false;
		const record = project as Record<string, unknown>;
		return record['Project Name'] === projectName || record.name === projectName;
	});
}

function requiredValue(environment: Record<string, string | undefined>, name: string) {
	const value = environment[name];
	if (!value?.trim()) throw new Error(\`Required deployment value \${name} is missing. Configure it in the selected GitHub environment.\`);
	return value;
}

async function withProductIdentity(environment: Record<string, string | undefined>) {
	if (environment.PRODUCT_NAME?.trim()) return environment;
	const manifest = await Bun.file('product-plate.json').json() as { product?: { name?: unknown } };
	const productName = typeof manifest.product?.name === 'string' ? manifest.product.name.trim() : '';
	if (!productName || /[\\r\\n\\u2028\\u2029]/u.test(productName)) {
		throw new Error('product-plate.json must contain a single-line product name.');
	}
	return {
		...environment,
		PRODUCT_NAME: productName
	};
}

function assertValidEmailSender(value: string) {
	const trimmed = value.trim();
	if (/[\\r\\n\\u2028\\u2029]/u.test(trimmed)) {
		throw new Error('TRANSACTIONAL_EMAIL_FROM must contain a valid, non-placeholder email address.');
	}
	const namedAddress = trimmed.match(/^[^<>]+\\s*<([^<>\\s]+)>$/u);
	const address = namedAddress?.[1] ?? (/[<>]/u.test(trimmed) ? '' : trimmed);
	const email = address.match(
		/^[a-z0-9.!#$%&'*+/=?^_\\x60{|}~-]+@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+)$/iu
	);
	const domain = email?.[1]?.toLowerCase() ?? '';
	if (
		!email ||
		['example.com', 'example.net', 'example.org'].includes(domain) ||
		domain.endsWith('.example') ||
		domain.endsWith('.invalid') ||
		domain.endsWith('.test')
	) {
		throw new Error('TRANSACTIONAL_EMAIL_FROM must contain a valid, non-placeholder email address.');
	}
}

export async function provisionRuntime(options: ProvisionOptions = {}) {
	const environment = await withProductIdentity(options.environment ?? process.env);
	const run = options.run ?? runCommand;
	const projectExists = options.projectExists ?? pagesProjectExists;
	const deployEnvironment = environment.DEPLOY_ENV;
	if (deployEnvironment !== 'preview' && deployEnvironment !== 'production') {
		throw new Error('DEPLOY_ENV must be preview or production.');
	}
	const runtimeTarget = environment.RUNTIME_TARGET ?? 'all';
	if (!['all', 'cloudflare', 'convex', 'validate'].includes(runtimeTarget)) {
		throw new Error('RUNTIME_TARGET must be all, cloudflare, convex, or validate.');
	}
	const validateOnly = runtimeTarget === 'validate';
	const provisionCloudflare =
		runtimeTarget === 'all' || runtimeTarget === 'cloudflare' || validateOnly;
	const provisionConvex = runtimeTarget === 'all' || runtimeTarget === 'convex' || validateOnly;
	const projectName = provisionCloudflare ? requiredValue(environment, 'CLOUDFLARE_PROJECT_NAME') : '';
	const convexUrl = provisionConvex ? requiredValue(environment, 'PUBLIC_CONVEX_URL') : '';
	if (provisionConvex) requiredValue(environment, 'CONVEX_DEPLOY_KEY');
	const convexDeployment = provisionConvex
		? new URL(convexUrl).hostname.match(/^([a-z0-9-]+)\\.convex\\.cloud$/)?.[1]
		: '';
	if (provisionConvex && !convexDeployment) {
		throw new Error('PUBLIC_CONVEX_URL must identify a Convex Cloud deployment.');
	}
	const cloudflareValues = [...requiredCloudflareEnvironment, ...optionalCloudflareEnvironment]
		.map((name) => [name, environment[name]] as const)
		.filter((entry): entry is readonly [string, string] => Boolean(entry[1]?.trim()));

	if (provisionCloudflare) {
		for (const name of requiredCloudflareEnvironment) requiredValue(environment, name);
	}
	if (provisionConvex) {
		for (const name of requiredConvexEnvironment) requiredValue(environment, name);
	}
	if (
		provisionCloudflare ||
		(provisionConvex &&
			(requiredConvexEnvironment as readonly string[]).includes('TRANSACTIONAL_EMAIL_FROM'))
	) {
		assertValidEmailSender(requiredValue(environment, 'TRANSACTIONAL_EMAIL_FROM'));
	}
	if (validateOnly) return;

	for (const name of provisionConvex ? requiredConvexEnvironment : []) {
		await run({
			command: [process.execPath, 'convex', 'env', 'set', name],
			input: requiredValue(environment, name),
			label: \`Convex runtime value \${name}\`
		});
	}
	if (provisionCloudflare && !(await projectExists(projectName))) {
		await run({
			command: [process.execPath, 'x', 'wrangler@4.110.0', 'pages', 'project', 'create', projectName, '--production-branch', 'main'],
			input: '',
			label: \`Cloudflare Pages project \${projectName}\`
		});
	}
	for (const [name, value] of provisionCloudflare ? cloudflareValues : []) {
		await run({
			command: [process.execPath, 'x', 'wrangler@4.110.0', 'pages', 'secret', 'put', name, '--project-name', projectName],
			input: value,
			label: \`Cloudflare runtime value \${name}\`
		});
	}
}

if (import.meta.main) {
	await provisionRuntime();
	console.log(
		process.env.RUNTIME_TARGET === 'validate'
			? 'Runtime configuration validated without printing secret values.'
			: 'Runtime configuration provisioned without printing secret values.'
	);
}
`;
}

function convexReadinessQuery(manifest: ProductPlateManifest) {
	return `import { query } from './_generated/server';
import { v } from 'convex/values';

const requiredEnvironment = ${JSON.stringify(convexRuntimeEnvironment(manifest))} as const;

export const check = query({
	args: {},
	returns: v.object({ ready: v.boolean() }),
	handler: async () => ({
		ready: requiredEnvironment.every((name) => Boolean(process.env[name]?.trim()))
	})
});
`;
}

function runtimeHealthRoute(manifest: ProductPlateManifest) {
	const requiredEnvironment = cloudflareRuntimeEnvironment(manifest);
	const runtimeEnvironment = requiredEnvironment
		.map((name) =>
			name.startsWith('PUBLIC_')
				? `\t${JSON.stringify(name)}: publicEnv.${name}`
				: `\t${JSON.stringify(name)}: env.${name}`
		)
		.join(',\n');
	return `import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const profile = ${JSON.stringify(manifest.profile)};
const requiredEnvironment = ${JSON.stringify(requiredEnvironment)} as const;
const runtimeEnvironment = {
${runtimeEnvironment}
} satisfies Record<(typeof requiredEnvironment)[number], string | undefined>;
const readinessQuery = makeFunctionReference<'query', Record<string, never>, { ready: boolean }>('readiness:check');

export const GET: RequestHandler = async () => {
	const missing = requiredEnvironment.filter((name) => !runtimeEnvironment[name]?.trim());
	if (missing.length > 0) {
		console.error('readiness.runtime_missing', { missing });
		return json({ ready: false, profile }, { status: 503 });
	}
	try {
		const client = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);
		const backend = await client.query(readinessQuery, {});
		if (!backend.ready) return json({ ready: false, profile }, { status: 503 });
		return json({ ready: true, profile }, { headers: { 'cache-control': 'no-store' } });
	} catch (error) {
		console.error('readiness.convex_failed', { error: error instanceof Error ? error.message : 'unknown' });
		return json({ ready: false, profile }, { status: 503 });
	}
};
`;
}

function generatedDeployWorkflow(manifest: ProductPlateManifest) {
	const profileEnvironment =
		manifest.profile === 'prelaunch'
			? `  WAITLIST_FINGERPRINT_SECRET: \${{ secrets.WAITLIST_FINGERPRINT_SECRET }}
  WAITLIST_EXPORT_SECRET: \${{ secrets.WAITLIST_EXPORT_SECRET }}
`
			: `  BETTER_AUTH_SECRET: \${{ secrets.BETTER_AUTH_SECRET }}
  AUTUMN_SECRET_KEY: \${{ secrets.AUTUMN_SECRET_KEY }}
  AUTH_REQUIRE_EMAIL_VERIFICATION: \${{ github.event_name == 'pull_request' && 'false' || 'true' }}
  AUTH_MAGIC_LINK_ENABLED: 'false'
${
	manifest.profile === 'ai-saas'
		? `  OPENROUTER_API_KEY: \${{ secrets.OPENROUTER_API_KEY }}
`
		: ''
}`;
	return `name: Convex and Cloudflare
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
concurrency:
  group: product-plate-runtime
  cancel-in-progress: false
permissions:
  contents: read
  deployments: write
  pull-requests: write
env:
  DEPLOY_ENV: \${{ github.event_name == 'pull_request' && 'preview' || 'production' }}
  CONVEX_DEPLOY_KEY: \${{ secrets.CONVEX_DEPLOY_KEY }}
  CLOUDFLARE_PROJECT_NAME: \${{ vars.CLOUDFLARE_PROJECT_NAME }}
  CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
  CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  SITE_URL: \${{ github.event_name == 'pull_request' && 'http://localhost:5173' || vars.SITE_URL }}
  BETTER_AUTH_URL: \${{ github.event_name == 'pull_request' && 'http://localhost:5173' || vars.SITE_URL }}
  RESEND_API_KEY: \${{ secrets.RESEND_API_KEY }}
  TRANSACTIONAL_EMAIL_FROM: \${{ vars.TRANSACTIONAL_EMAIL_FROM }}
${profileEnvironment}
  PUBLIC_POSTHOG_KEY: \${{ vars.PUBLIC_POSTHOG_KEY }}
  PUBLIC_POSTHOG_HOST: \${{ vars.PUBLIC_POSTHOG_HOST }}
  PUBLIC_SENTRY_DSN: \${{ vars.PUBLIC_SENTRY_DSN }}
  SUPPORT_EMAIL: \${{ vars.SUPPORT_EMAIL }}
jobs:
  deploy:
    environment: \${{ github.event_name == 'pull_request' && 'preview' || 'production' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with: { bun-version: 1.3.13 }
      - run: bun install --frozen-lockfile
      - name: Verify selected deployment environment
        run: |
          test -n "$CONVEX_DEPLOY_KEY"
          test -n "$CLOUDFLARE_PROJECT_NAME"
          test -n "$CLOUDFLARE_API_TOKEN"
          test -n "$CLOUDFLARE_ACCOUNT_ID"
      - name: Strict production source preflight
        if: github.event_name != 'pull_request'
        env:
          RUNTIME_TARGET: validate
          PUBLIC_CONVEX_URL: https://preflight.convex.cloud
          PUBLIC_CONVEX_SITE_URL: https://preflight.convex.site
        run: |
          bun scripts/provision-runtime.ts
          bun run doctor -- --strict
      - name: Build, then deploy Convex
        run: |
          if [ "\${{ github.event_name }}" = "pull_request" ]; then
            bun convex deploy --cmd "bun scripts/build-for-convex.ts" --cmd-url-env-var-name PUBLIC_CONVEX_URL --preview-name "\${{ github.head_ref }}" --message "\${{ github.sha }}"
          else
            bun convex deploy --cmd "bun scripts/build-for-convex.ts" --cmd-url-env-var-name PUBLIC_CONVEX_URL --message "\${{ github.sha }}"
          fi
      - name: Provision Convex production runtime configuration
        if: github.event_name != 'pull_request'
        env: { RUNTIME_TARGET: convex }
        run: bun scripts/provision-runtime.ts
      - name: Provision Cloudflare runtime configuration
        env: { RUNTIME_TARGET: cloudflare }
        run: bun scripts/provision-runtime.ts
      - name: Deploy built artifact to Cloudflare Pages
        id: cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          wranglerVersion: 4.110.0
          command: pages deploy .svelte-kit/cloudflare --project-name=\${{ vars.CLOUDFLARE_PROJECT_NAME }} --branch=main
      - name: Provision Convex preview runtime for the deployed origin
        if: github.event_name == 'pull_request'
        env:
          RUNTIME_TARGET: convex
          SITE_URL: \${{ github.event_name == 'pull_request' && steps.cloudflare.outputs.deployment-url || vars.SITE_URL }}
          BETTER_AUTH_URL: \${{ github.event_name == 'pull_request' && steps.cloudflare.outputs.deployment-url || vars.SITE_URL }}
        run: bun scripts/provision-runtime.ts
      - name: Preview launch doctor
        if: github.event_name == 'pull_request'
        env:
          SITE_URL: \${{ steps.cloudflare.outputs.deployment-url }}
          BETTER_AUTH_URL: \${{ steps.cloudflare.outputs.deployment-url }}
        run: bun run doctor
      - name: Smoke deployed profile
        env:
          DEPLOYED_URL: \${{ steps.cloudflare.outputs.deployment-url }}
        run: bun scripts/smoke-deploy.ts
      - name: Deployment summary
        if: always()
        run: |
          {
            echo "## Deployment"
            echo "- Frontend: \${{ steps.cloudflare.outputs.deployment-url }}"
            echo "- Convex target: \${{ github.event_name == 'pull_request' && 'isolated preview' || 'production' }}"
            echo "- Git SHA: \${{ github.sha }}"
            echo "- Smoke: \${{ job.status }}"
            echo "- Rollback: redeploy the previous Git SHA; keep Convex schema changes backward compatible through widen-migrate-narrow."
          } >> "$GITHUB_STEP_SUMMARY"
`;
}

function buildForConvexScript() {
	return `#!/usr/bin/env bun
import { appendFile, mkdir } from 'node:fs/promises';
const convexUrl = process.env.PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error('PUBLIC_CONVEX_URL was not supplied by convex deploy.');
const siteUrl = process.env.CONVEX_SITE_URL_OVERRIDE ?? convexUrl.replace(/\\.convex\\.cloud\\/?$/, '.convex.site');
const processHandle = Bun.spawn(['bun', 'run', 'build'], {
	stdin: 'inherit', stdout: 'inherit', stderr: 'inherit',
	env: { ...process.env, PUBLIC_CONVEX_URL: convexUrl, PUBLIC_CONVEX_SITE_URL: siteUrl, CONVEX_SITE_URL: siteUrl }
});
const exitCode = await processHandle.exited;
if (exitCode !== 0) process.exit(exitCode);
await mkdir('.svelte-kit/cloudflare', { recursive: true });
await Bun.write('.svelte-kit/cloudflare/.node-version', '22\\n');
if (process.env.GITHUB_ENV) await appendFile(process.env.GITHUB_ENV, \`PUBLIC_CONVEX_URL=\${convexUrl}\\nPUBLIC_CONVEX_SITE_URL=\${siteUrl}\\n\`);
`;
}

function smokeDeployScript(manifest: ProductPlateManifest) {
	const routeSmoke =
		manifest.profile === 'prelaunch'
			? `
	const waitlist = await fetcher(new URL('/api/waitlist', baseUrl), {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ email: 'invalid' }),
		signal: AbortSignal.timeout(15_000)
	});
	if (waitlist.status !== 400) throw new Error(\`Waitlist route returned \${waitlist.status}.\`);`
			: `
	const session = await fetcher(new URL('/api/auth/get-session', baseUrl), {
		headers: { accept: 'application/json' },
		signal: AbortSignal.timeout(15_000)
	});
	if (session.status !== 200) throw new Error(\`Auth session route returned \${session.status}.\`);${
		manifest.profile === 'ai-saas'
			? `
	const chat = await fetcher(new URL('/api/chat', baseUrl), {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ messages: [] }),
		signal: AbortSignal.timeout(15_000)
	});
	if (chat.status !== 401) throw new Error(\`Unauthenticated chat route returned \${chat.status}.\`);`
			: ''
	}`;
	return `#!/usr/bin/env bun
interface SmokeOptions {
	fetcher?: typeof fetch;
	wait?: (delayMs: number) => Promise<void>;
	attempts?: number;
	delayMs?: number;
}

const defaultWait = (delayMs: number) => new Promise<void>((resolve) => setTimeout(resolve, delayMs));

async function smokeAttempt(baseUrl: string, fetcher: typeof fetch) {
	const page = await fetcher(baseUrl, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
	if (!page.ok) throw new Error(\`Deployment page returned \${page.status}.\`);
	if (!(await page.text()).toLowerCase().includes('<main')) throw new Error('Deployment did not render the primary page.');

	const health = await fetcher(new URL('/api/health', baseUrl), {
		headers: { accept: 'application/json' },
		signal: AbortSignal.timeout(15_000)
	});
	if (!health.ok) throw new Error(\`Runtime readiness returned \${health.status}.\`);
	const readiness = await health.json() as { ready?: boolean; profile?: string };
	if (!readiness.ready || readiness.profile !== ${JSON.stringify(manifest.profile)}) {
		throw new Error('Runtime readiness response did not match the generated profile.');
	}
${routeSmoke}
}

export async function smokeDeployment(url: string, options: SmokeOptions = {}) {
	const fetcher = options.fetcher ?? fetch;
	const wait = options.wait ?? defaultWait;
	const attempts = options.attempts ?? 12;
	const delayMs = options.delayMs ?? 5_000;
	let lastError: Error | undefined;
	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			await smokeAttempt(url, fetcher);
			return;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error('Deployment smoke failed.');
			if (attempt < attempts) {
				console.warn(\`Smoke attempt \${attempt}/\${attempts} failed: \${lastError.message}\`);
				await wait(delayMs);
			}
		}
	}
	throw lastError ?? new Error('Deployment smoke failed.');
}

if (import.meta.main) {
	const url = process.env.DEPLOYED_URL;
	if (!url) throw new Error('DEPLOYED_URL is required.');
	await smokeDeployment(url);
	console.log(\`Smoke passed: \${url}\`);
}
`;
}

function profileE2e(manifest: ProductPlateManifest) {
	if (manifest.profile === 'prelaunch') {
		return `import { expect, test } from '@playwright/test';
test('landing and waitlist', async ({ page }) => {
	await page.route('**/api/waitlist', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: '{"accepted":true}' }));
	await page.goto('/');
	await expect(page.getByRole('heading', { name: ${JSON.stringify(manifest.product.name)} })).toBeVisible();
	await page.getByLabel('Email address').fill('founder@example.com');
	await page.getByRole('button', { name: 'Join waitlist' }).click();
	await expect(page.getByText('You are on the list.')).toBeVisible();
});
test('touch-sized waitlist controls', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const emailBox = await page.getByLabel('Email address').boundingBox();
	const submitBox = await page.getByRole('button', { name: 'Join waitlist' }).boundingBox();
	expect(emailBox?.height).toBeGreaterThanOrEqual(44);
	expect(submitBox?.height).toBeGreaterThanOrEqual(44);
	expect(Math.abs((emailBox?.width ?? 0) - (submitBox?.width ?? 0))).toBeLessThanOrEqual(1);
});
`;
	}
	const aiProviderTest =
		manifest.profile === 'ai-saas'
			? `
test('unauthenticated AI request fails safely', async ({ request }) => {
	const response = await request.post('/api/chat', { data: { messages: [{ id: 'message-1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] }] } });
	expect(response.status()).toBe(401);
	expect(await response.text()).not.toContain('OPENROUTER_API_KEY');
});
`
			: '';
	return `import { expect, test } from '@playwright/test';
test('landing exposes the real signup path', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: ${JSON.stringify(manifest.product.name)} })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/auth/sign-up');
	await page.getByRole('link', { name: 'Create account' }).click();
	await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
});
test('password recovery surfaces are available', async ({ page }) => {
	await page.goto('/auth/forgot-password');
	await expect(page.getByRole('heading', { name: 'Forgot password' })).toBeVisible();
	await page.goto('/auth/reset-password?token=browser-smoke');
	await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();
});
test('touch-sized authentication controls', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/auth/sign-up');
	for (const label of ['Name', 'Email', 'Password']) {
		expect((await page.getByLabel(label, { exact: true }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
	}
});
${aiProviderTest}
	`;
}

async function stripPwaTypeReferences(destination: string) {
	const appTypesPath = join(destination, 'src/app.d.ts');
	if (!(await exists(appTypesPath))) return;
	const content = await readFile(appTypesPath, 'utf8');
	const next = content.replace(
		/^\/\/\/ <reference types="vite-plugin-pwa\/(?:svelte|info)" \/>\r?\n/gm,
		''
	);
	if (next !== content) await writeFile(appTypesPath, next.replace(/^\r?\n/, ''));
}

async function stripRepositoryOnlyDevenvCommands(destination: string, productName: string) {
	const devenvPath = join(destination, 'devenv.nix');
	if (!(await exists(devenvPath))) return;
	const content = await readFile(devenvPath, 'utf8');
	const encodedBanner = Array.from(
		new TextEncoder().encode(productName),
		(byte) => `\\${byte.toString(8).padStart(3, '0')}`
	).join('');
	const next = content
		.split('\n')
		.filter((line) => {
			const trimmed = line.trim();
			return !(
				trimmed.startsWith('verify-full.exec =') ||
				trimmed.startsWith('verify-profiles.exec =') ||
				trimmed.startsWith('echo "  verify-full ') ||
				trimmed.startsWith('echo "  verify-profiles ')
			);
		})
		.join('\n')
		.replace('    echo "  Product Plate"', `    printf '  ${encodedBanner}\\n'`);
	if (next !== content) await writeFile(devenvPath, next);
}

async function rewriteGeneratedLintGuidance(destination: string) {
	const oxlintPath = join(destination, 'oxlint.config.ts');
	if (!(await exists(oxlintPath))) return;
	const content = await readFile(oxlintPath, 'utf8');
	const next = content.replace(
		'Prefer Svelte 5 runes for local state. See docs/svelte/advanced_state_management.md when a shared store is still appropriate.',
		'Prefer Svelte 5 runes for local state. Use a Svelte store only for state shared outside a component tree.'
	);
	if (next !== content) await writeFile(oxlintPath, next);
}

async function preferCloudflareDeploymentUrl(destination: string) {
	const hooksPath = join(destination, 'src/hooks.server.ts');
	if (!(await exists(hooksPath))) return;
	const content = await readFile(hooksPath, 'utf8');
	const next = content.replace(
		'env.SITE_URL ?? env.CF_PAGES_URL ?? origin',
		'env.CF_PAGES_URL ?? env.SITE_URL ?? origin'
	);
	if (next !== content) await writeFile(hooksPath, next);
}

async function protectAiProviderConfiguration(destination: string) {
	const chatPath = join(destination, 'src/routes/api/chat/+server.ts');
	if (!(await exists(chatPath))) return;
	const content = await readFile(chatPath, 'utf8');
	const providerCheck = `\tif (!env.OPENROUTER_API_KEY) {
\t\treturn new Response('OPENROUTER_API_KEY is not configured.', { status: 503 });
\t}
\tif (!locals.token) return new Response('Unauthorized.', { status: 401 });`;
	const protectedCheck = `\tif (!locals.token) return new Response('Unauthorized.', { status: 401 });
\tif (!env.OPENROUTER_API_KEY) {
\t\treturn new Response('OPENROUTER_API_KEY is not configured.', { status: 503 });
\t}`;
	const next = content
		.replace(providerCheck, protectedCheck)
		.replace(
			"'HTTP-Referer': env.SITE_URL ?? 'http://localhost:5173'",
			"'HTTP-Referer': env.CF_PAGES_URL ?? env.SITE_URL ?? 'http://localhost:5173'"
		);
	if (next !== content) await writeFile(chatPath, next);
}

export async function applyProfileTransforms(destination: string, manifest: ProductPlateManifest) {
	const authenticated = manifest.providers.auth === 'better-auth';
	await write(destination, 'src/lib/constants.ts', constants(manifest));
	await write(destination, 'src/routes/+layout.svelte', rootLayout(authenticated));
	await write(destination, 'src/routes/+page.svelte', landingPage(manifest));
	await write(destination, 'src/routes/+error.svelte', errorPage());
	await write(destination, 'src/lib/components/public-page-shell.svelte', publicPageShell());
	await write(destination, '.env.example', environmentExample(manifest, false));
	await write(destination, '.env.server.example', environmentExample(manifest, true));
	await write(
		destination,
		'wrangler.jsonc',
		`${JSON.stringify({ name: manifest.product.slug, pages_build_output_dir: '.svelte-kit/cloudflare', compatibility_date: '2025-01-01', compatibility_flags: ['nodejs_compat'], vars: { SITE_URL: manifest.product.productionUrl ?? `https://${manifest.product.slug}.pages.dev` } }, null, '\t')}\n`
	);
	await writeFile(join(destination, 'src/app.css'), generatedAppCss(manifest.theme));
	await write(destination, '.github/workflows/quality.yml', generatedQualityWorkflow(manifest));
	await write(destination, '.github/workflows/deploy.yml', generatedDeployWorkflow(manifest));
	await write(destination, 'scripts/build-for-convex.ts', buildForConvexScript());
	await write(destination, 'scripts/provision-runtime.ts', provisionRuntimeScript(manifest));
	await write(destination, 'scripts/smoke-deploy.ts', smokeDeployScript(manifest));
	await write(destination, 'src/convex/readiness.ts', convexReadinessQuery(manifest));
	await write(destination, 'src/routes/api/health/+server.ts', runtimeHealthRoute(manifest));
	await write(destination, 'e2e/profile.test.ts', profileE2e(manifest));
	await write(destination, 'vite.config.ts', generatedViteConfig());
	await stripPwaTypeReferences(destination);
	await stripRepositoryOnlyDevenvCommands(destination, manifest.product.name);
	await rewriteGeneratedLintGuidance(destination);
	await preferCloudflareDeploymentUrl(destination);
	if (manifest.profile === 'ai-saas') await protectAiProviderConfiguration(destination);

	if (authenticated) {
		await write(destination, 'src/routes/(app)/+layout.server.ts', appLayoutServer());
		await write(destination, 'src/routes/(app)/+layout.svelte', appLayout());
		await write(destination, 'src/routes/(app)/dashboard/+page.svelte', dashboardPage());
		await rm(join(destination, 'src/routes/(app)/dashboard/data.ts'), { force: true });
		await write(destination, 'src/lib/components/app-sidebar.svelte', appSidebar(manifest));
	} else {
		await rm(join(destination, 'src/routes/+page.server.ts'), { force: true });
		await write(destination, 'src/hooks.server.ts', prelaunchHooks());
		await write(destination, 'src/convex/schema.ts', prelaunchSchema());
		await write(
			destination,
			'src/convex/convex.config.ts',
			"import { defineApp } from 'convex/server';\nexport default defineApp();\n"
		);
		await write(
			destination,
			'src/convex/http.ts',
			"import { httpRouter } from 'convex/server';\nexport default httpRouter();\n"
		);
		await write(
			destination,
			'src/convex/_generated/api.d.ts',
			"import type * as waitlist from '../waitlist.js';\nimport type { ApiFromModules, FilterApi, FunctionReference } from 'convex/server';\ndeclare const fullApi: ApiFromModules<{ waitlist: typeof waitlist }>;\nexport declare const api: FilterApi<typeof fullApi, FunctionReference<any, 'public'>>;\nexport declare const internal: FilterApi<typeof fullApi, FunctionReference<any, 'internal'>>;\nexport declare const components: {};\n"
		);
	}
	await write(
		destination,
		'src/lib/profile.test.ts',
		`import { describe, expect, it } from 'vitest';\nimport { APP_NAME } from './constants';\ndescribe('generated profile', () => { it('uses the selected product identity', () => expect(APP_NAME).toBe(${JSON.stringify(manifest.product.name)})); });\n`
	);
}

async function allFiles(directory: string) {
	const files: Array<string> = [];
	const visit = async (path: string) => {
		for (const entry of await readdir(path, { withFileTypes: true })) {
			const target = join(path, entry.name);
			if (entry.isDirectory()) await visit(target);
			else if (entry.isFile()) files.push(target);
		}
	};
	if (await exists(directory)) await visit(directory);
	return files;
}

async function exists(path: string) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

const importPattern = /(?:from\s*|import\s*\(|import\s*)['"]([^'"]+)['"]/g;

async function resolveImport(source: string, specifier: string, destination: string) {
	let base: string;
	if (specifier.startsWith('$lib/')) base = join(destination, 'src/lib', specifier.slice(5));
	else if (specifier.startsWith('$convex/'))
		base = join(destination, 'src/convex', specifier.slice(8));
	else if (specifier.startsWith('.')) base = resolve(dirname(source), specifier);
	else return null;
	const withoutJs = base.replace(/\.js$/, '');
	const candidates = [
		base,
		withoutJs,
		`${withoutJs}.ts`,
		`${withoutJs}.svelte`,
		`${withoutJs}.js`,
		join(withoutJs, 'index.ts'),
		join(withoutJs, 'index.svelte'),
		join(withoutJs, 'index.js')
	];
	for (const candidate of candidates) if (await exists(candidate)) return normalize(candidate);
	return null;
}

export async function pruneUnreachableLibraryFiles(destination: string) {
	const sourceFiles = await allFiles(join(destination, 'src'));
	const codeFiles = sourceFiles.filter((file) => ['.ts', '.js', '.svelte'].includes(extname(file)));
	const roots = codeFiles.filter(
		(file) =>
			!file.includes(`${join('src', 'lib')}/`) ||
			file.endsWith('profile.test.ts') ||
			file.includes(`${join('src', 'convex', '_generated')}/`)
	);
	for (const config of ['vite.config.ts', 'svelte.config.js']) {
		const path = join(destination, config);
		if (await exists(path)) roots.push(path);
	}
	const reachable = new Set<string>();
	const queue = [...roots];
	while (queue.length > 0) {
		const file = normalize(queue.pop()!);
		if (reachable.has(file)) continue;
		reachable.add(file);
		let content: string;
		try {
			content = await readFile(file, 'utf8');
		} catch {
			continue;
		}
		for (const match of content.matchAll(importPattern)) {
			const dependency = await resolveImport(file, match[1], destination);
			if (dependency && !reachable.has(dependency)) queue.push(dependency);
		}
	}
	for (const file of codeFiles) {
		if (file.includes(`${join('src', 'lib')}/`) && !reachable.has(normalize(file))) {
			await rm(file, { force: true });
		}
	}
}

function packageName(specifier: string) {
	if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/');
	return specifier.split('/')[0];
}

export async function pruneUnusedDependencies(destination: string) {
	const packagePath = join(destination, 'package.json');
	interface TemplatePackageJson {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
		scripts?: Record<string, string>;
	}
	// SAFETY: the template package.json is committed and always parses.
	const packageJson = (await Bun.file(packagePath).json()) as TemplatePackageJson;
	const declaredDependencies = new Set([
		...Object.keys(packageJson.dependencies ?? {}),
		...Object.keys(packageJson.devDependencies ?? {})
	]);
	const analyzableExtensions = new Set([
		'.cjs',
		'.css',
		'.js',
		'.json',
		'.jsonc',
		'.mjs',
		'.svelte',
		'.ts'
	]);
	const files = [
		...(await allFiles(join(destination, 'src'))),
		...(await allFiles(join(destination, 'scripts'))),
		...(await allFiles(join(destination, 'e2e'))),
		// The vendored Oxlint plugin imports its runtime package from here.
		...(await allFiles(join(destination, 'tools')))
	].filter((file) => analyzableExtensions.has(extname(file)));
	for (const file of [
		'.oxfmtrc.json',
		'tsconfig.json',
		'vite.config.ts',
		'svelte.config.js',
		'oxlint.config.ts',
		'playwright.config.ts'
	]) {
		const path = join(destination, file);
		if (await exists(path)) files.push(path);
	}
	const used = new Set<string>();
	const dependencyPattern = /(?:from\s*|import\s*\(|import\s*|url\()['"]([^'"$./][^'"]*)['"]/g;
	let usesNodeTypes = false;
	let usesTypeScript = false;
	for (const file of files) {
		let content: string;
		try {
			content = await readFile(file, 'utf8');
		} catch {
			continue;
		}
		for (const match of content.matchAll(dependencyPattern)) used.add(packageName(match[1]));
		for (const dependency of declaredDependencies) {
			if (content.includes(`'${dependency}'`) || content.includes(`"${dependency}"`)) {
				used.add(dependency);
			}
		}
		// Vitest loads this optional peer from its worker when a retained test selects
		// the Edge Runtime through either the file directive or the shared config.
		if (
			/@vitest-environment\s+edge-runtime\b|environment\s*:\s*['"]edge-runtime['"]/.test(content)
		) {
			used.add('@edge-runtime/vm');
		}
		usesNodeTypes ||= /['"]node:[^'"]+['"]/.test(content);
		usesTypeScript ||= ['.ts', '.svelte'].includes(extname(file));
	}
	const scripts = Object.values(packageJson.scripts ?? {}).join('\n');
	const binaryOverrides = {
		'@playwright/test': ['playwright'],
		'@sveltejs/kit': ['svelte-kit'],
		'create-product-plate': ['create-product-plate', 'product-plate'],
		typescript: ['tsc', 'tsserver']
	} satisfies Record<string, string[]>;
	for (const dependency of declaredDependencies) {
		const defaultBinary = dependency.startsWith('@') ? dependency.split('/')[1] : dependency;
		// SAFETY: overrides only declare entries for known dependencies.
		const binaries = binaryOverrides[dependency as keyof typeof binaryOverrides] ?? [defaultBinary];
		for (const binary of binaries) {
			const escapedBinary = binary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			if (new RegExp(`(?:^|[\\s;&|()])${escapedBinary}(?=$|[\\s;&|()])`).test(scripts)) {
				used.add(dependency);
			}
		}
	}
	if (usesNodeTypes) used.add('@types/node');
	if (usesTypeScript) used.add('typescript');
	for (const group of [packageJson.dependencies, packageJson.devDependencies]) {
		if (!group) continue;
		for (const dependency of Object.keys(group)) {
			if (!used.has(dependency)) delete group[dependency];
		}
	}
	await writeFile(packagePath, `${JSON.stringify(packageJson, null, '\t')}\n`);
}

export async function stripGeneratedDemoCode(destination: string) {
	const schemaPath = join(destination, 'src/convex/schema.ts');
	if (await exists(schemaPath)) {
		let content = await readFile(schemaPath, 'utf8');
		content = content
			.replace(
				/\t\tisDemo: v\.optional\(v\.boolean\(\)\),\n\t\tdemoExpiresAt: v\.optional\(v\.number\(\)\),\n/,
				''
			)
			.replace(/\n\t\t\.index\('by_demo_and_expiry', \['isDemo', 'demoExpiresAt'\]\)/, '')
			.replace(
				/\t?demoCreationLimits: defineTable\([\s\S]*?\.index\('by_updatedAt', \['updatedAt'\]\),\n/,
				''
			)
			.replace(
				/\t?waitlistSubscribers: defineTable\([\s\S]*?\.index\('by_status_and_createdAt', \['status', 'createdAt'\]\),\n/,
				''
			)
			.replace(
				/\t?waitlistRateLimits: defineTable\([\s\S]*?\.index\('by_updatedAt', \['updatedAt'\]\),\n/,
				''
			);
		await writeFile(schemaPath, content);
	}
	const userProfilesPath = join(destination, 'src/convex/userProfiles.ts');
	if (await exists(userProfilesPath)) {
		let content = await readFile(userProfilesPath, 'utf8');
		content = content
			.replace("import { DEMO_PROFILE, isDemoAccountEmail } from '../lib/demo-account.js';\n", '')
			.replace(
				/\tisDemo: v\.optional\(v\.boolean\(\)\),\n\tdemoExpiresAt: v\.optional\(v\.number\(\)\),\n/,
				''
			)
			.replace(
				/export const ensureDemoProfile = mutation\([\s\S]*?\n\}\);\n\nexport const updateCurrent/,
				'export const updateCurrent'
			);
		await writeFile(userProfilesPath, content);
	}
	const organizationsPath = join(destination, 'src/convex/organizations.ts');
	if (await exists(organizationsPath)) {
		let content = await readFile(organizationsPath, 'utf8');
		content = content
			.replace("import { isDemoAccountEmail } from '../lib/demo-account.js';\n", '')
			.replace(
				/\t\tconst profile = await getProfile\(ctx, user\._id\);\n\t\tif \(profile\?\.isDemo\) (?:return null|throw new Error\('[^']+'\));\n/g,
				''
			)
			.replace(
				/\t\tif \(isDemoAccountEmail\(user\.email\)\) \{\n\t\t\tthrow new Error\('[^']+'\);\n\t\t\}\n/g,
				''
			);
		await writeFile(organizationsPath, content);
	}
	const storagePath = join(destination, 'src/convex/storage.ts');
	if (await exists(storagePath)) {
		let content = await readFile(storagePath, 'utf8');
		content = content
			.replace(
				/\t\tconst profile = await ctx\.db[\s\S]*?\.first\(\);\n\t\tconst uploadLimit = profile\?\.isDemo \? 3 : MAX_UPLOAD_URLS_PER_DAY;\n/,
				''
			)
			.replace(/>= uploadLimit/, '>= MAX_UPLOAD_URLS_PER_DAY');
		await writeFile(storagePath, content);
	}
	const chatPath = join(destination, 'src/convex/chat.ts');
	if (await exists(chatPath)) {
		let content = await readFile(chatPath, 'utf8');
		content = content
			.replace('const DEMO_CHAT_REQUESTS_PER_HOUR = 3;\n', '')
			.replace(
				/\t\tconst profile = await ctx\.db[\s\S]*?\.first\(\);\n\t\tconst requestLimit = profile\?\.isDemo \? DEMO_CHAT_REQUESTS_PER_HOUR : CHAT_REQUESTS_PER_HOUR;\n/,
				''
			)
			.replace(/requestLimit/g, 'CHAT_REQUESTS_PER_HOUR');
		await writeFile(chatPath, content);
	}
	const lifecyclePath = join(destination, 'src/convex/lifecycle.ts');
	if (await exists(lifecyclePath)) {
		let content = await readFile(lifecyclePath, 'utf8');
		content = content
			.replace(/\nexport const listExpiredDemoUsers = internalQuery\([\s\S]*?\n\}\);\n$/, '\n')
			.replace(
				"import {\n\tinternalAction,\n\tinternalMutation,\n\tinternalQuery,\n\ttype MutationCtx\n} from './_generated/server';",
				"import { internalMutation, type MutationCtx } from './_generated/server';"
			)
			.replace(
				"import { components, internal } from './_generated/api';",
				"import { internal } from './_generated/api';"
			);
		await writeFile(lifecyclePath, content);
	}
	const cronsPath = join(destination, 'src/convex/crons.ts');
	if (await exists(cronsPath)) {
		let content = await readFile(cronsPath, 'utf8');
		content = content
			.replace(/\nconst expireDemoAccountsRef = makeFunctionReference[\s\S]*?number>;\n/, '')
			.replace(
				"crons.interval('expire disposable demo accounts', { hours: 1 }, expireDemoAccountsRef, {});\n",
				''
			);
		await writeFile(cronsPath, content);
	}
	const maintenancePath = join(destination, 'src/convex/maintenance.ts');
	if (await exists(maintenancePath)) {
		let content = await readFile(maintenancePath, 'utf8');
		content = content.replace(
			/\n\t\t\tawait ctx\.db\n\t\t\t\t\.query\('demoCreationLimits'\)[\s\S]*?\.take\(25\),/,
			''
		);
		await writeFile(maintenancePath, content);
	}
	const workspacePath = join(destination, 'src/routes/(app)/workspace/+page.svelte');
	if (await exists(workspacePath)) {
		let content = await readFile(workspacePath, 'utf8');
		content = content
			.replace("\timport { isDemoAccountEmail } from '$lib/demo-account.js';\n", '')
			.replace(
				/\n\tlet isDemo = \$derived\(isDemoAccountEmail\(clientCurrentUser\?\.email\)\);/,
				''
			)
			.replace(/administration && !isDemo/g, 'administration');
		await writeFile(workspacePath, content);
	}
	const agentPanelPath = join(destination, 'src/lib/components/ai/agent-panel.svelte');
	if (await exists(agentPanelPath)) {
		let content = await readFile(agentPanelPath, 'utf8');
		content = content.replace(
			/\timport \{\n\t\tSuggestions,[\s\S]*?\t\} from '\$lib\/components\/ai\/index\.js';/,
			[
				"\timport Suggestions from './suggestions.svelte';",
				"\timport Suggestion from './suggestion.svelte';",
				"\timport Reasoning from './reasoning.svelte';",
				"\timport ReasoningTrigger from './reasoning-trigger.svelte';",
				"\timport ReasoningContent from './reasoning-content.svelte';",
				"\timport Tool from './tool.svelte';",
				"\timport ToolHeader from './tool-header.svelte';",
				"\timport ToolContent from './tool-content.svelte';",
				"\timport ToolInput from './tool-input.svelte';",
				"\timport ToolOutput from './tool-output.svelte';",
				"\timport Shimmer from './shimmer.svelte';"
			].join('\n')
		);
		await writeFile(agentPanelPath, content);
	}
}
