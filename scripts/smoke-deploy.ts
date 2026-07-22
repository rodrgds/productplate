#!/usr/bin/env bun

interface SmokeOptions {
	fetcher?: typeof fetch;
	wait?: (delayMs: number) => Promise<void>;
	attempts?: number;
	delayMs?: number;
}

const defaultWait = (delayMs: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, delayMs));

export async function smokeDeployment(url: string, options: SmokeOptions = {}) {
	const fetcher = options.fetcher ?? fetch;
	const wait = options.wait ?? defaultWait;
	const attempts = options.attempts ?? 6;
	const delayMs = options.delayMs ?? 2_000;
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			const response = await fetcher(url, {
				redirect: 'follow',
				signal: AbortSignal.timeout(15_000)
			});
			if (!response.ok) throw new Error(`Deployment smoke failed with ${response.status}.`);
			const html = await response.text();
			if (!html.toLowerCase().includes('<main')) {
				throw new Error('Deployment did not render the primary page.');
			}
			return;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error('Deployment smoke failed.');
			if (attempt < attempts) await wait(delayMs);
		}
	}

	throw lastError ?? new Error('Deployment smoke failed.');
}

if (import.meta.main) {
	const url = process.env.DEPLOYED_URL;
	if (!url) throw new Error('DEPLOYED_URL is required.');
	await smokeDeployment(url);
	console.log(`Smoke passed: ${url}`);
}
