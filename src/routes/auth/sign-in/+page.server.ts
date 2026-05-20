import type { PageServerLoad } from './$types.js';
import { api } from '$convex/_generated/api.js';
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: PageServerLoad = async ({ locals }) => {
	const client = createConvexHttpClient({ token: locals.token });

	let currentUser = null;
	try {
		currentUser = await client.query(api.auth.getCurrentUser, {});
	} catch {
		return { currentUser: null };
	}

	if (currentUser) {
		const profile = await client.query(api.userProfiles.getCurrent, {});
		throw redirect(303, resolve(profile ? '/dashboard' : '/onboarding'));
	}

	return { currentUser };
};
