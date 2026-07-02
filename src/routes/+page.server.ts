import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { api } from '$convex/_generated/api.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.token) {
		return { isAuthenticated: false };
	}

	const client = createConvexHttpClient({ token: locals.token });

	try {
		const currentUser = await client.query(api.auth.getCurrentUser, {});

		return { isAuthenticated: Boolean(currentUser) };
	} catch {
		return { isAuthenticated: false };
	}
};
