#!/usr/bin/env bun
import { appendFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build as bundle } from 'esbuild';

const convexUrl = process.env.PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error('PUBLIC_CONVEX_URL was not supplied by convex deploy.');

const siteUrl =
	process.env.CONVEX_SITE_URL_OVERRIDE ?? convexUrl.replace(/\.convex\.cloud\/?$/, '.convex.site');
const build = Bun.spawn(['bun', 'run', 'build'], {
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit',
	env: {
		...process.env,
		PUBLIC_CONVEX_URL: convexUrl,
		PUBLIC_CONVEX_SITE_URL: siteUrl,
		CONVEX_SITE_URL: siteUrl
	}
});

const exitCode = await build.exited;
if (exitCode !== 0) process.exit(exitCode);

const bundleDirectory = await mkdtemp(join(tmpdir(), 'product-plate-cloudflare-'));
try {
	await bundle({
		entryPoints: ['.svelte-kit/cloudflare/_worker.js'],
		bundle: true,
		platform: 'browser',
		conditions: ['worker', 'browser'],
		external: ['cloudflare:*', 'node:*'],
		outfile: join(bundleDirectory, 'worker.js'),
		logLevel: 'info'
	});
} finally {
	await rm(bundleDirectory, { recursive: true, force: true });
}

await mkdir('.svelte-kit/cloudflare', { recursive: true });
await Bun.write('.svelte-kit/cloudflare/.node-version', '22\n');
if (process.env.GITHUB_ENV) {
	await appendFile(
		process.env.GITHUB_ENV,
		`PUBLIC_CONVEX_URL=${convexUrl}\nPUBLIC_CONVEX_SITE_URL=${siteUrl}\n`
	);
}
