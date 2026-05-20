import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'bun run build && bun run preview -- --host 127.0.0.1',
		port: 4173
	},
	testDir: 'e2e'
});
