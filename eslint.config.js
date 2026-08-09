import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		ignores: [
			'.agents/**',
			'.claude/**',
			'_template_options/**',
			'convex/_generated/**',
			'src/convex/_generated/**',
			'src/convex/*/_generated/**',
			'build/**',
			'.svelte-kit/**',
			'package/**'
		]
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
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
		}
	},
	{
		files: ['**/*.test.ts', '**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		rules: {
			'svelte/valid-compile': 'error',
			'svelte/no-immutable-reactive-statements': 'warn',
			'svelte/no-reactive-functions': 'warn',
			'svelte/no-reactive-literals': 'warn',
			'svelte/require-store-reactive-access': 'error',
			'svelte/prefer-destructured-store-props': 'warn',
			'svelte/no-unused-svelte-ignore': 'warn',
			'svelte/no-useless-mustaches': 'warn',
			'svelte/shorthand-attribute': 'warn',
			'svelte/shorthand-directive': 'warn'
		}
	}
);
