import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { z } from 'zod/v3';
import { api } from '$convex/_generated/api';
import type { PageServerLoad } from './$types';

const productsResponseSchema = z.object({
	data: z.object({
		list: z.array(
			z
				.object({
					id: z.string(),
					name: z.string(),
					items: z
						.array(
							z
								.object({
									price: z.number().optional(),
									interval: z.string().optional(),
									feature_id: z.string().optional(),
									included_usage: z.union([z.number(), z.literal('inf')]).optional()
								})
								.passthrough()
						)
						.optional()
				})
				.passthrough()
		)
	})
});

export const load: PageServerLoad = async ({ locals }) => {
	const client = createConvexHttpClient({ token: locals.token });

	try {
		const productsResult = await client.action(api.billing.listProducts, {});
		const customerResult = await client.action(api.billing.getCustomer, {});
		const parsedProducts = productsResponseSchema.safeParse(productsResult);

		return {
			products: parsedProducts.success ? parsedProducts.data.data.list : [],
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
