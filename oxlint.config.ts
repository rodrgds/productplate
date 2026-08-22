const config = {
	$schema: './node_modules/oxlint/configuration_schema.json',
	ignorePatterns: [
		'.agent/**',
		'.agents/**',
		'.claude/**',
		'.codex/**',
		'.continue/**',
		'.cursor/**',
		'.gemini/**',
		'.opencode/**',
		'.pi/**',
		'.roo/**',
		'.windsurf/**',
		'tools/oxlint/anti-slop/**',
		// Vendored registry components maintained upstream (shadcn-svelte, ai-elements).
		'src/lib/components/ui/**',
		'src/lib/components/ai/**',
		'_template_options/**',
		'convex/_generated/**',
		'src/convex/_generated/**',
		'src/convex/*/_generated/**',
		'.svelte-kit/**',
		'build/**',
		'dist/**',
		'package/**',
		'test-results/**'
	],
	jsPlugins: [{ name: 'anti-slop', specifier: './tools/oxlint/anti-slop/index.ts' }],
	categories: {
		correctness: 'error'
	},
	env: {
		builtin: true,
		browser: true,
		node: true,
		es2024: true
	},
	rules: {
		// Local anti-slop plugin.
		'anti-slop/no-chained-type-assertions': 'error',
		'anti-slop/no-conditional-empty-object-spread': 'error',
		'anti-slop/no-known-value-widening': 'error',
		'anti-slop/no-module-mocking': 'error',
		'anti-slop/no-object-parameters': 'error',
		'anti-slop/no-reflect-apply': 'error',
		'anti-slop/no-reflect-get': 'error',
		'anti-slop/no-runtime-typeof': ['error', { allowInTypeGuards: true }],
		'anti-slop/no-shape-in-symbol-names': 'error',
		'anti-slop/no-unknown-parameters': 'error',
		'anti-slop/no-unknown-returns': 'error',
		'anti-slop/no-unknown-type-aliases': 'error',
		'anti-slop/no-unsafe-dictionary-type': 'error',
		'anti-slop/no-widen-then-assert': 'error',
		'anti-slop/require-safety-comment-for-type-assertion': 'error',

		// Carried over from the previous ESLint setup.
		'typescript/no-explicit-any': 'error',
		'typescript/no-unsafe-function-type': 'error',
		'typescript/no-wrapper-object-types': 'error',
		'typescript/no-require-imports': 'error',
		'no-restricted-imports': [
			'warn',
			{
				paths: [
					{
						name: 'svelte/store',
						importNames: ['writable', 'readable', 'derived', 'get'],
						message:
							'Prefer Svelte 5 runes for local state. See docs/svelte/advanced_state_management.md when a shared store is still appropriate.'
					}
				]
			}
		]
	},
	overrides: [
		{
			files: ['**/*.test.ts', '**/*.spec.ts'],
			rules: {
				'typescript/no-explicit-any': 'off'
			}
		}
	]
};

export default config;
