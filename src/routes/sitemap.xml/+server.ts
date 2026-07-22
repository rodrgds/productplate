import { APP_URL } from '$lib/constants';
import { getPublishedBlogPosts } from '$lib/content/blog';
import { response } from 'super-sitemap/sveltekit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
	await response({
		origin: APP_URL,
		excludeRoutePatterns: [
			/^\/\(app\)/,
			/^\/admin/,
			/^\/api/,
			/^\/auth/,
			/^\/components/,
			/^\/landing-components/,
			/^\/theme-builder/
		],
		paramValues: {
			'/blog/[slug]': getPublishedBlogPosts().map((post) => ({
				values: [post.slug],
				lastmod: post.updated ?? post.published
			}))
		},
		sort: 'alpha'
	});
