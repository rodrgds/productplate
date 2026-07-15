import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { api } from '$convex/_generated/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const client = createConvexHttpClient({ token: locals.token });

	try {
		const productsResult = await client.action(api.billing.listProducts, {});
		const customerResult = await client.action(api.billing.getCustomer, {});

		return {
			products: productsResult?.data?.list || [],
			customerData: customerResult.data
		};
	} catch (error) {
		console.error('Error loading billing data:', error);
		return {
			products: [],
			customerData: null
		};
	}
};
