import { APP_DESCRIPTION, APP_NAME, APP_URL } from '$lib/constants';
import { getPublishedBlogPosts } from '$lib/content/blog';
import type { RequestHandler } from './$types';

function xml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

export const GET: RequestHandler = () => {
	const items = getPublishedBlogPosts()
		.map(
			(post) =>
				`<item><title>${xml(post.title)}</title><link>${xml(post.canonicalUrl)}</link><guid>${xml(post.canonicalUrl)}</guid><description>${xml(post.description)}</description><pubDate>${new Date(post.published).toUTCString()}</pubDate></item>`
		)
		.join('');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(APP_NAME)}</title><link>${xml(APP_URL)}</link><description>${xml(APP_DESCRIPTION)}</description>${items}</channel></rss>`,
		{
			headers: {
				'content-type': 'application/rss+xml; charset=utf-8',
				'cache-control': 'public, max-age=0, s-maxage=3600'
			}
		}
	);
};
