import { defineConfig } from '@playwright/test';

export default defineConfig({
	workers: 1,
	timeout: 60_000,
	expect: { timeout: 10_000 },
	testMatch:
		process.env.PLAYWRIGHT_TEST_MODE === 'public' ? 'public-smoke.test.ts' : '**/*.test.ts',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},
	webServer: {
		command: process.env.PLAYWRIGHT_PREBUILT
			? 'bun run preview -- --host localhost --port 4173'
			: 'bun run build && bun run preview -- --host localhost --port 4173',
		port: 4173,
		timeout: 360_000,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'e2e'
});
