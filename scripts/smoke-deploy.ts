#!/usr/bin/env bun

const url = process.env.DEPLOYED_URL;
if (!url) throw new Error('DEPLOYED_URL is required.');

const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
if (!response.ok) throw new Error(`Deployment smoke failed with ${response.status}.`);
const html = await response.text();
if (!html.toLowerCase().includes('<main')) {
	throw new Error('Deployment did not render the primary page.');
}
console.log(`Smoke passed: ${url}`);
