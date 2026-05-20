/// <reference types="vitest" />

import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vitest/config';
import {
	APP_NAME,
	APP_SHORT_NAME,
	APP_DESCRIPTION,
	APP_THEME_COLOR,
	APP_BACKGROUND_COLOR,
	APP_DISPLAY,
	APP_ORIENTATION
} from './src/lib/constants';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			base: '/',
			buildBase: '/',
			registerType: 'prompt',
			includeAssets: ['/favicon.svg'],
			manifest: {
				id: '/',
				name: APP_NAME,
				short_name: APP_SHORT_NAME,
				description: APP_DESCRIPTION,
				start_url: '/',
				scope: '/',
				display: APP_DISPLAY,
				orientation: APP_ORIENTATION,
				background_color: APP_BACKGROUND_COLOR,
				theme_color: APP_THEME_COLOR,
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/pwa-maskable-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				runtimeCaching: [
					{
						urlPattern: ({ request }) => request.destination === 'image',
						handler: 'CacheFirst',
						options: {
							cacheName: 'images',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30
							}
						}
					},
					{
						urlPattern: ({ url }) => url.pathname.startsWith('/api/public/'),
						handler: 'NetworkFirst',
						options: {
							cacheName: 'public-api',
							networkTimeoutSeconds: 3,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60
							}
						}
					}
				]
			}
		})
	],
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,svelte.ts}']
	}
});
