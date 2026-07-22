import { describe, expect, it } from 'vitest';
import { SITEMAP_EXCLUDED_ROUTE_PATTERNS } from './sitemap';

const isExcluded = (route: string) =>
	SITEMAP_EXCLUDED_ROUTE_PATTERNS.some((pattern) => pattern.test(route));

describe('sitemap route policy', () => {
	it.each(['/invite/[token]', '/profile/[userId]', '/dashboard', '/settings'])(
		'excludes authenticated route %s after SvelteKit route groups are removed',
		(route) => {
			expect(isExcluded(route)).toBe(true);
		}
	);

	it('keeps public blog routes in the sitemap', () => {
		expect(isExcluded('/blog/[slug]')).toBe(false);
	});
});
