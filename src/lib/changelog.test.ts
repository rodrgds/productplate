import { describe, expect, test } from 'vitest';
import { parseChangelog } from './changelog';

describe('parseChangelog', () => {
	test('reads unreleased and versioned sections from the repository changelog', () => {
		const releases = parseChangelog(`# Changelog

## Unreleased

### Added

- A truthful public surface.

## [0.1.0] - 2026-06-25

### Fixed

- The first release fix.
`);

		expect(releases).toEqual([
			{
				version: 'Unreleased',
				groups: [{ title: 'Added', items: ['A truthful public surface.'] }]
			},
			{
				version: '0.1.0',
				date: '2026-06-25',
				groups: [{ title: 'Fixed', items: ['The first release fix.'] }]
			}
		]);
	});
});
