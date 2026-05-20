import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { error } from '@sveltejs/kit';
import { api } from '$convex/_generated/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const client = createConvexHttpClient({ token: locals.token });

	const profile = await client.query(api.userProfiles.getByUserId, {
		userId: params.userId
	});

	if (!profile) {
		throw error(404, 'Profile not found');
	}

	return { profile };
};
