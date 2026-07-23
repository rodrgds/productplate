import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('feedback settings', () => {
	it('starts with the feedback form and no success state', async () => {
		const source = await readFile('src/routes/(app)/settings/feedback-settings.svelte', 'utf8');

		expect(source).toContain('Share a bug, idea, or question.');
		expect(source).not.toContain('current path');
		expect(source).not.toContain('name="currentPath"');
	});

	it('shows a distinct confirmation after a successful submission', async () => {
		const source = await readFile('src/routes/(app)/settings/feedback-settings.svelte', 'utf8');
		const confirmationIndex = source.indexOf('{#if $message}');
		const formIndex = source.indexOf('<form');

		expect(confirmationIndex).toBeGreaterThan(-1);
		expect(confirmationIndex).toBeLessThan(formIndex);
		expect(source).toContain('Send more feedback');
	});
});
