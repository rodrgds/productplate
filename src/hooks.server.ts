import type { Handle } from '@sveltejs/kit';
import { createAuth } from '$convex/auth.js';
import { getToken } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { SITE_URL } from '$env/static/private';

try {
	if (SITE_URL && typeof process !== 'undefined' && !process.env.SITE_URL) {
		process.env.SITE_URL = SITE_URL;
	}
} catch {
	// process.env not available (e.g. Cloudflare Workers)
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.token = await getToken(createAuth, event.cookies);

	return resolve(event);
};
