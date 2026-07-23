import { describe, expect, it } from 'vitest';
import { categories } from './registry';

const removedSectionKeys = [
	'dashboard-hero',
	'bento',
	'problem-solution',
	'workflow-steps',
	'use-case-switcher',
	'feature-spotlight',
	'case-study',
	'trust-center',
	'release-timeline',
	'roi-calculator',
	'migration-plan'
] as const;

describe('landing component registry', () => {
	it('publishes the retained expanded SaaS landing sections', () => {
		const keys = categories.flatMap((category) =>
			category.components.map((component) => component.key)
		);

		expect(keys).not.toEqual(expect.arrayContaining([...removedSectionKeys]));
		expect(categories.some((category) => category.id === 'conversion')).toBe(false);
		expect(new Set(keys).size).toBe(keys.length);
		expect(keys).toHaveLength(21);
	});
});
