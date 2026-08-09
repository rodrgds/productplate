import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('focused frontend hardening contracts', () => {
	it('makes the theme preset field descriptive and the sample preview inert', async () => {
		const source = await readFile('src/routes/theme-builder/+page.svelte', 'utf8');

		expect(source).toContain('<label for="preset-code">Preset code</label>');
		expect(source).toContain("aria-describedby={presetError ? 'preset-code-error' : undefined}");
		expect(source).toContain('id="preset-code-error"');
		expect(source).toContain('inert');
		expect(source).toContain('aria-hidden="true"');
		expect(source).toContain('Sample controls are inactive');
		expect(source).toContain('@media (pointer: coarse), (max-width: 639px)');
		expect(source).toContain('@media (prefers-reduced-motion: reduce)');
	});

	it('guards billing redirects and exposes recoverable failures', async () => {
		const source = await readFile('src/routes/(app)/billing/+page.svelte', 'utf8');

		expect(source).toContain('let pendingAction = $state');
		expect(source).toContain('if (pendingAction) return;');
		expect(source).toContain('let actionError = $state');
		expect(source).toContain('<Alert.Root variant="destructive"');
		expect(source).toContain('Opening checkout...');
		expect(source).toContain('Opening portal...');
		expect(source).toContain('pendingAction = null');
	});

	it('labels developer controls and confirms destructive key revocation', async () => {
		const source = await readFile('src/routes/(app)/developer/+page.svelte', 'utf8');

		expect(source).toContain('<Label for="api-key-name">Key name</Label>');
		expect(source).toContain('<Label for="api-key-scopes">Scopes</Label>');
		expect(source).toContain("aria-label={copied === 'key' ? 'API key copied' : 'Copy API key'}");
		expect(source).toContain('requestApiKeyRevocation');
		expect(source).toContain('<AlertDialog.Root');
		expect(source).toContain('role="status"');
		expect(source).toContain('role="alert"');
	});
});
