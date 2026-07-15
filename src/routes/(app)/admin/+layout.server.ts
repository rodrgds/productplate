import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { api } from '$convex/_generated/api.js';
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Create Convex client with auth token from locals
	const client = createConvexHttpClient({ token: locals.token });

	if (!locals.token) {
		throw error(401, 'Unauthorized');
	}

	const user = await client.query(api.auth.getCurrentUser, {});
	if (!user) throw error(401, 'Unauthorized');
	if (user.role !== 'admin') throw error(403, 'Forbidden: Admin access required');

	return { user };
};
