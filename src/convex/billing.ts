import { action, type ActionCtx } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { Autumn } from 'autumn-js';
import { z } from 'zod/v3';
import { authComponent } from './auth';

if (!process.env.SITE_URL && process.env.BETTER_AUTH_URL) {
	process.env.SITE_URL = process.env.BETTER_AUTH_URL;
}

export { listProducts } from './autumn';

const customerItemSchema = z
	.object({
		type: z.string(),
		feature_id: z.string().optional(),
		price: z.number().optional(),
		interval: z.string().optional(),
		included_usage: z.number().optional()
	})
	.passthrough();

const customerProductSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		status: z.string(),
		items: z.array(customerItemSchema).optional()
	})
	.passthrough();

const customerSchema = z
	.object({
		products: z.array(customerProductSchema).default([])
	})
	.passthrough();

const customerItemValidator = v.object({
	type: v.string(),
	feature_id: v.optional(v.string()),
	price: v.optional(v.number()),
	interval: v.optional(v.string()),
	included_usage: v.optional(v.number())
});

const customerProductValidator = v.object({
	id: v.string(),
	name: v.string(),
	status: v.string(),
	items: v.optional(v.array(customerItemValidator))
});

const customerValidator = v.object({
	products: v.array(customerProductValidator)
});

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function isCustomerNotFound(error: unknown): boolean {
	const serialized = JSON.stringify(error);
	return (
		serialized.includes('customer_not_found') ||
		(serialized.includes('Customer') && serialized.includes('not found'))
	);
}

function unwrapData(value: unknown): unknown {
	if (!value || typeof value !== 'object' || !('data' in value)) return value;
	return (value as { data: unknown }).data;
}

function parseCustomer(value: unknown) {
	const result = customerSchema.safeParse(unwrapData(value));
	if (!result.success) {
		throw new Error('Autumn returned an invalid customer response.');
	}

	return {
		products: result.data.products.map((product) => ({
			id: product.id,
			name: product.name,
			status: product.status,
			...(product.items
				? {
						items: product.items.map((item) => ({
							type: item.type,
							...(item.feature_id ? { feature_id: item.feature_id } : {}),
							...(item.price !== undefined ? { price: item.price } : {}),
							...(item.interval ? { interval: item.interval } : {}),
							...(item.included_usage !== undefined ? { included_usage: item.included_usage } : {})
						}))
					}
				: {})
		}))
	};
}

async function loadCustomer(ctx: ActionCtx) {
	const user = await authComponent.getAuthUser(ctx);
	const autumn = new Autumn({ secretKey: process.env.AUTUMN_SECRET_KEY ?? '' });
	let response: unknown;

	try {
		response = await autumn.customers.get(user._id);
	} catch (error) {
		if (!isCustomerNotFound(error)) throw error;
		await ctx.runAction(api.autumn.createCustomer, {});
		response = await autumn.customers.get(user._id);
	}

	if (isCustomerNotFound(response)) {
		await ctx.runAction(api.autumn.createCustomer, {});
		response = await autumn.customers.get(user._id);
	}

	return { user, customer: parseCustomer(response) };
}

export const getCustomer = action({
	args: {},
	returns: v.object({
		data: v.union(customerValidator, v.null()),
		error: v.union(v.string(), v.null()),
		statusCode: v.number()
	}),
	handler: async (ctx) => {
		try {
			const { customer } = await loadCustomer(ctx);
			return { data: customer, error: null, statusCode: 200 };
		} catch (error) {
			console.error('Error getting Autumn customer:', error);
			return { data: null, error: getErrorMessage(error), statusCode: 500 };
		}
	}
});

export const syncCurrentPlan = action({
	args: {},
	returns: v.object({ planKey: v.string() }),
	handler: async (ctx) => {
		const { user, customer } = await loadCustomer(ctx);
		const activeProduct = customer.products.find((product) => product.status === 'active');
		await ctx.runMutation(internal.organizations.applyVerifiedBillingPlan, {
			userId: user._id,
			productId: activeProduct?.id ?? null,
			status: activeProduct?.status ?? 'inactive'
		});
		return { planKey: activeProduct?.id ?? 'starter' };
	}
});

const actionUrlValidator = v.object({
	url: v.union(v.string(), v.null())
});

function extractActionUrl(value: unknown) {
	const data = unwrapData(value);
	if (!data || typeof data !== 'object' || !('url' in data)) return null;
	return typeof (data as { url: unknown }).url === 'string' ? (data as { url: string }).url : null;
}

export const checkout = action({
	args: { productId: v.string() },
	returns: actionUrlValidator,
	handler: async (ctx, args): Promise<{ url: string | null }> => {
		if (!args.productId.trim() || args.productId.length > 100) {
			throw new Error('Invalid billing product.');
		}
		await ctx.runAction(api.autumn.createCustomer, {});
		const result: unknown = await ctx.runAction(api.autumn.checkout, {
			productId: args.productId,
			successUrl: `${process.env.SITE_URL}/billing`
		});
		return { url: extractActionUrl(result) };
	}
});

export const billingPortal = action({
	args: {},
	returns: actionUrlValidator,
	handler: async (ctx): Promise<{ url: string | null }> => {
		await ctx.runAction(api.autumn.createCustomer, {});
		const result: unknown = await ctx.runAction(api.autumn.billingPortal, {
			returnUrl: `${process.env.SITE_URL}/billing`
		});
		return { url: extractActionUrl(result) };
	}
});
