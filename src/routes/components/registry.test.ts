import { describe, expect, it } from 'vitest';
import { categories } from './registry';

const newSectionKeys = [
	'dashboard-hero',
	'problem-solution',
	'workflow-steps',
	'use-case-switcher',
	'feature-spotlight'
] as const;

describe('landing component registry', () => {
	it('publishes the ten expanded SaaS landing sections', () => {
		const keys = categories.flatMap((category) =>
			category.components.map((component) => component.key)
		);

		expect(keys).toEqual(expect.arrayContaining([...newSectionKeys]));
		expect(new Set(keys).size).toBe(keys.length);
		expect(keys).toHaveLength(27);
	});
});
