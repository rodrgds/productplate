import type { ProductProfile, ProfileDefinition } from './types.ts';

const universalCapabilities = ['landing', 'legal', 'seo', 'analytics', 'errors', 'email'];
const authenticatedCapabilities = [
	...universalCapabilities,
	'auth',
	'onboarding',
	'personal-workspace',
	'dashboard',
	'settings',
	'billing',
	'entitlements',
	'operator-users',
	'support'
];

const universalRemovePaths = [
	'.git',
	'.github',
	'.agents',
	'.codex',
	'.direnv',
	'.impeccable',
	'.mcp.json',
	'.wrangler-config',
	'node_modules',
	'.svelte-kit',
	'packages',
	'_template_options',
	'test-results',
	'playwright-report',
	'static/screenshots',
	'static/stack',
	'e2e',
	'docs',
	'data',
	'CHANGELOG.md',
	'CONTRIBUTING.md',
	'DESIGN.md',
	'PRODUCT.md',
	'SECURITY.md',
	'opencode.json',
	'skills-lock.json',
	'src/test',
	'src/convex/security.test.ts',
	'src/routes/auth/demo',
	'src/routes/components',
	'src/routes/changelog',
	'src/routes/docs',
	'src/routes/showcase',
	'src/routes/landing-components',
	'src/routes/theme-builder',
	'src/routes/(app)/editor',
	'src/routes/(app)/flow',
	'src/routes/(app)/map',
	'src/routes/(app)/threlte',
	'src/lib/components/landing/editor',
	'src/lib/components/landing/map',
	'src/lib/components/landing/threlte',
	'src/lib/components/landing/workflow',
	'src/lib/components/editor-toolbar.svelte',
	'src/lib/theme-builder.ts',
	'src/lib/theme-builder.test.ts',
	'src/lib/demo-account.ts',
	'src/lib/demo-account.test.ts',
	'src/lib/demo-route.test.ts',
	'src/lib/showcase.ts',
	'e2e/demo.test.ts',
	'docs/scripts/capture-readme-screenshots.ts'
];

const showcaseDependencies = [
	'@dnd-kit-svelte/svelte',
	'@dnd-kit/abstract',
	'@dnd-kit/helpers',
	'@prosekit/svelte',
	'@threlte/core',
	'@threlte/extras',
	'@types/d3-scale',
	'@types/d3-shape',
	'@types/three',
	'@xyflow/svelte',
	'd3-scale',
	'd3-shape',
	'layerchart',
	'maplibre-gl',
	'prosekit',
	'svelte-maplibre-gl',
	'three'
];

const authenticatedRemovePaths = [
	'src/routes/api/waitlist',
	'src/convex/waitlist.ts',
	'src/convex/waitlist.test.ts',
	'scripts/waitlist-export.ts'
];

const definitions: Record<ProductProfile, ProfileDefinition> = {
	prelaunch: {
		id: 'prelaunch',
		capabilities: ['landing', 'waitlist', 'legal', 'seo', 'analytics', 'errors', 'email'],
		removePaths: [
			...universalRemovePaths,
			'src/routes/(app)',
			'src/routes/auth',
			'src/routes/api/auth',
			'src/routes/api/chat',
			'src/lib/components/ai',
			'src/lib/auth-client.ts',
			'src/lib/components/app-sidebar.svelte',
			'src/lib/components/login-form.svelte',
			'src/lib/components/nav-admin.svelte',
			'src/lib/components/nav-main.svelte',
			'src/lib/components/nav-secondary.svelte',
			'src/lib/components/nav-user.svelte',
			'src/lib/components/team-switcher.svelte',
			'src/convex/accountAdmin.ts',
			'src/convex/auth.config.ts',
			'src/convex/auth.ts',
			'src/convex/autumn.ts',
			'src/convex/betterAuth',
			'src/convex/billing.ts',
			'src/convex/chat.ts',
			'src/convex/demo.ts',
			'src/convex/developer.ts',
			'src/convex/emails.ts',
			'src/convex/feedback.ts',
			'src/convex/lifecycle.ts',
			'src/convex/crons.ts',
			'src/convex/maintenance.ts',
			'src/convex/notifications.ts',
			'src/convex/organizations.ts',
			'src/convex/storage.ts',
			'src/convex/userProfiles.ts'
		],
		removeDependencies: [
			...showcaseDependencies,
			'@ai-sdk/openai',
			'@ai-sdk/svelte',
			'@convex-dev/better-auth',
			'@mmailaender/convex-better-auth-svelte',
			'@useautumn/convex',
			'ai',
			'atmn',
			'autumn-js',
			'better-auth',
			'streamdown-svelte'
		],
		providers: {
			data: 'convex',
			auth: 'none',
			billing: 'none',
			email: 'resend',
			analytics: 'posthog',
			errors: 'sentry',
			hosting: 'cloudflare-pages'
		}
	},
	'solo-saas': {
		id: 'solo-saas',
		capabilities: authenticatedCapabilities,
		removePaths: [
			...universalRemovePaths,
			...authenticatedRemovePaths,
			'src/routes/(app)/assistant',
			'src/routes/(app)/workspace',
			'src/routes/(app)/invite',
			'src/routes/(app)/developer',
			'src/routes/(app)/admin/organizations',
			'src/routes/api/chat',
			'src/lib/components/ai',
			'src/lib/components/team-switcher.svelte',
			'src/convex/chat.ts',
			'src/convex/demo.ts',
			'src/convex/developer.ts'
		],
		removeDependencies: [
			...showcaseDependencies,
			'@ai-sdk/openai',
			'@ai-sdk/svelte',
			'ai',
			'streamdown-svelte'
		],
		providers: {
			data: 'convex',
			auth: 'better-auth',
			billing: 'autumn',
			email: 'resend',
			analytics: 'posthog',
			errors: 'sentry',
			hosting: 'cloudflare-pages'
		}
	},
	'team-saas': {
		id: 'team-saas',
		capabilities: [
			...authenticatedCapabilities,
			'organizations',
			'workspace-switching',
			'roles',
			'members',
			'invites',
			'notifications',
			'audit-history',
			'organization-billing'
		],
		removePaths: [
			...universalRemovePaths,
			...authenticatedRemovePaths,
			'src/routes/(app)/assistant',
			'src/routes/(app)/developer',
			'src/routes/api/chat',
			'src/lib/components/ai',
			'src/convex/chat.ts',
			'src/convex/demo.ts',
			'src/convex/developer.ts'
		],
		removeDependencies: [
			...showcaseDependencies,
			'@ai-sdk/openai',
			'@ai-sdk/svelte',
			'ai',
			'streamdown-svelte'
		],
		providers: {
			data: 'convex',
			auth: 'better-auth',
			billing: 'autumn',
			email: 'resend',
			analytics: 'posthog',
			errors: 'sentry',
			hosting: 'cloudflare-pages'
		}
	},
	'ai-saas': {
		id: 'ai-saas',
		capabilities: [
			...authenticatedCapabilities,
			'ai-chat',
			'model-configuration',
			'chat-rate-limits',
			'usage-counters',
			'usage-billing'
		],
		removePaths: [
			...universalRemovePaths,
			...authenticatedRemovePaths,
			'src/routes/(app)/workspace',
			'src/routes/(app)/invite',
			'src/routes/(app)/developer',
			'src/routes/(app)/admin/organizations',
			'src/lib/components/team-switcher.svelte',
			'src/convex/demo.ts',
			'src/convex/developer.ts'
		],
		removeDependencies: showcaseDependencies,
		providers: {
			data: 'convex',
			auth: 'better-auth',
			billing: 'autumn',
			email: 'resend',
			analytics: 'posthog',
			errors: 'sentry',
			hosting: 'cloudflare-pages'
		}
	}
};

export function resolveProfile(profile: ProductProfile) {
	const definition = definitions[profile];
	if (!definition) throw new Error(`Unknown Product Plate profile: ${profile}`);
	return structuredClone(definition);
}
