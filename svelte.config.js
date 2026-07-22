import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	extensions: ['.svelte', '.svx'],
	preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'] })],
	kit: {
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'script-src-attr': ['none'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:', 'https:'],
				'font-src': ['self', 'data:'],
				'connect-src': ['self', 'https:', 'wss:'],
				'worker-src': ['self', 'blob:'],
				'media-src': ['self', 'blob:'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'frame-ancestors': ['none']
			}
		},
		alias: {
			$convex: './src/convex'
		},
		prerender: {
			handleMissingId: 'ignore'
		}
	}
};

export default config;
