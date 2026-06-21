import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: {
		baseURL: 'http://localhost:4173'
	},
	webServer: {
		command: 'bun run build && bun run preview -- --host localhost',
		port: 4173,
		timeout: 180_000
	},
	testDir: 'e2e'
});
