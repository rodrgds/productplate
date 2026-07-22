import { APP_URL } from '$lib/constants';
import { getPublishedBlogPosts } from '$lib/content/blog';
import { SITEMAP_EXCLUDED_ROUTE_PATTERNS } from '$lib/content/sitemap';
import { response } from 'super-sitemap/sveltekit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
	await response({
		origin: APP_URL,
		excludeRoutePatterns: SITEMAP_EXCLUDED_ROUTE_PATTERNS,
		paramValues: {
			'/blog/[slug]': getPublishedBlogPosts().map((post) => ({
				values: [post.slug],
				lastmod: post.updated ?? post.published
			}))
		},
		sort: 'alpha'
	});
