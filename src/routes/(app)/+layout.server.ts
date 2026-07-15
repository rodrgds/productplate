import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { redirect } from '@sveltejs/kit';
import { api } from '$convex/_generated/api';
import { resolve } from '$app/paths';
import { isDemoAccountEmail } from '$lib/demo-account.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.token) {
		throw redirect(303, resolve('/auth/sign-in'));
	}

	const client = createConvexHttpClient({ token: locals.token });
	const currentUser = await client.query(api.auth.getCurrentUser, {});

	if (!currentUser) {
		throw redirect(303, resolve('/auth/sign-in'));
	}

	const profile = await client.query(api.userProfiles.getCurrent, {});
	const onboardingPath = resolve('/onboarding');
	const onboardingUrl = new URL(onboardingPath, url);
	const isOnboardingRoute =
		url.pathname.replace(/\/$/, '') === onboardingUrl.pathname.replace(/\/$/, '');
	const isDemoAccount = isDemoAccountEmail(currentUser.email);

	if (!profile && !isDemoAccount && !isOnboardingRoute) {
		throw redirect(303, onboardingPath);
	}

	if ((profile || isDemoAccount) && isOnboardingRoute) {
		throw redirect(303, resolve('/dashboard'));
	}

	return {
		currentUser,
		profile
	};
};
