import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('dropdown menu checkbox item', () => {
	it('shows its check indicator on the right only when checked', async () => {
		const source = await readFile(
			'src/lib/components/ui/dropdown-menu/dropdown-menu-checkbox-item.svelte',
			'utf8'
		);

		expect(source).toContain('absolute right-2');
		expect(source).toContain('{:else if checked}');
		expect(source).not.toContain('text-transparent');
	});
});
