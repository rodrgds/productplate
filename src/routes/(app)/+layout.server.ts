import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { redirect } from '@sveltejs/kit';
import { api } from '$convex/_generated/api';
import { resolve } from '$app/paths';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const client = createConvexHttpClient({ token: locals.token });
	const currentUser = await client.query(api.auth.getCurrentUser, {});

	if (!currentUser) {
		throw redirect(303, resolve('/auth/sign-in'));
	}

	const profile = await client.query(api.userProfiles.getCurrent, {});

	return {
		currentUser,
		profile
	};
};
