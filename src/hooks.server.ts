import type { Handle } from '@sveltejs/kit';
import { createAuth } from '$convex/auth.js';
import { getToken } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { env } from '$env/dynamic/private';

function trimTrailingSlash(value: string) {
	return value.endsWith('/') ? value.slice(0, -1) : value;
}

function syncRuntimeSiteUrl(origin?: string) {
	try {
		const siteUrl = env.SITE_URL ?? env.CF_PAGES_URL ?? origin;
		if (siteUrl && typeof process !== 'undefined') {
			process.env.SITE_URL = trimTrailingSlash(siteUrl);
		}
	} catch {
		// process.env not available (e.g. Cloudflare Workers)
	}
}

syncRuntimeSiteUrl();

export const handle: Handle = async ({ event, resolve }) => {
	const startedAt = Date.now();
	const requestId = event.request.headers.get('x-request-id') ?? crypto.randomUUID();
	syncRuntimeSiteUrl(event.url.origin);
	event.locals.requestId = requestId;
	event.locals.token = await getToken(createAuth, event.cookies);

	const resolvedResponse = await resolve(event);
	const response = new Response(resolvedResponse.body, resolvedResponse);
	const durationMs = Date.now() - startedAt;

	response.headers.set('x-request-id', requestId);
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('x-frame-options', 'DENY');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set('permissions-policy', 'camera=(self), microphone=(self), geolocation=()');
	if (event.url.protocol === 'https:') {
		response.headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
	}

	const shouldLogRequests = env.OBSERVABILITY_LOG_REQUESTS === 'true';
	if (shouldLogRequests) {
		console.info('request.completed', {
			requestId,
			method: event.request.method,
			pathname: event.url.pathname,
			status: response.status,
			durationMs
		});
	}

	return response;
};
