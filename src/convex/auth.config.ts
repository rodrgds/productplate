import type { AuthConfig } from 'convex/server';

const convexSiteUrl =
	process.env.CONVEX_SITE_URL ??
	process.env.PUBLIC_CONVEX_SITE_URL ??
	'https://placeholder.convex.cloud';

export default {
	providers: [
		{
			domain: convexSiteUrl,
			applicationID: 'convex'
		}
	]
} satisfies AuthConfig;
