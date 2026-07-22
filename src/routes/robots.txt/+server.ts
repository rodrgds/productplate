import { APP_URL } from '$lib/constants';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () =>
	new Response(
		`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nDisallow: /dashboard\n\nSitemap: ${APP_URL}/sitemap.xml\n`,
		{
			headers: { 'content-type': 'text/plain; charset=utf-8' }
		}
	);
