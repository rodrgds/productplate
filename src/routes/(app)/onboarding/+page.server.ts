import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { profile } = await parent();

	if (profile) {
		throw redirect(303, resolve('/dashboard'));
	}
};
