const convexSiteUrl = process.env.CONVEX_SITE_URL ?? process.env.PUBLIC_CONVEX_SITE_URL;

export default {
	providers: [
		{
			domain: convexSiteUrl,
			applicationID: 'convex'
		}
	]
};
