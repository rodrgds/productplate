import { action, type ActionCtx } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Autumn } from 'autumn-js';
import { z } from 'zod/v3';

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

type ParsedCustomer = ReturnType<typeof parseCustomer>;

interface BillingContext {
	orgId: import('./_generated/dataModel').Id<'organizations'>;
	customerId: string;
	organizationName: string;
	actorUserId: string;
	actorEmail: string;
}

async function getBillingContext(ctx: ActionCtx): Promise<BillingContext> {
	return await ctx.runQuery(internal.organizations.getCurrentBillingContext, {});
}

async function loadCustomer(ctx: ActionCtx): Promise<{
	billingContext: BillingContext;
	autumn: Autumn;
	customer: ParsedCustomer;
}> {
	const billingContext = await getBillingContext(ctx);
	const autumn = new Autumn({ secretKey: process.env.AUTUMN_SECRET_KEY ?? '' });
	let response = await autumn.customers.get(billingContext.customerId);

	if (response.error && isCustomerNotFound(response.error)) {
		const created = await autumn.customers.create({
			id: billingContext.customerId,
			name: billingContext.organizationName,
			email: billingContext.actorEmail,
			metadata: { organizationId: billingContext.orgId }
		});
		if (created.error) throw created.error;
		response = await autumn.customers.get(billingContext.customerId);
	}
	if (response.error) throw response.error;

	return {
		billingContext,
		autumn,
		customer: parseCustomer(response.data)
	};
}

export const getCustomer = action({
	args: {},
	returns: v.object({
		data: v.union(customerValidator, v.null()),
		error: v.union(v.string(), v.null()),
		statusCode: v.number()
	}),
	handler: async (
		ctx
	): Promise<{
		data: ParsedCustomer | null;
		error: string | null;
		statusCode: number;
	}> => {
		try {
			const { billingContext, customer } = await loadCustomer(ctx);
			const activeProduct = customer.products.find((product) => product.status === 'active');
			await ctx.runMutation(internal.organizations.applyVerifiedBillingPlan, {
				orgId: billingContext.orgId,
				actorUserId: billingContext.actorUserId,
				productId: activeProduct?.id ?? null,
				status: activeProduct?.status ?? 'inactive'
			});
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
	handler: async (ctx): Promise<{ planKey: string }> => {
		const { billingContext, customer } = await loadCustomer(ctx);
		const activeProduct = customer.products.find((product) => product.status === 'active');
		await ctx.runMutation(internal.organizations.applyVerifiedBillingPlan, {
			orgId: billingContext.orgId,
			actorUserId: billingContext.actorUserId,
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
		const { autumn, billingContext } = await loadCustomer(ctx);
		const result: unknown = await autumn.checkout({
			customer_id: billingContext.customerId,
			product_id: args.productId,
			success_url: `${process.env.SITE_URL}/billing`,
			customer_data: {
				name: billingContext.organizationName,
				email: billingContext.actorEmail
			}
		});
		return { url: extractActionUrl(result) };
	}
});

export const billingPortal = action({
	args: {},
	returns: actionUrlValidator,
	handler: async (ctx): Promise<{ url: string | null }> => {
		const { autumn, billingContext } = await loadCustomer(ctx);
		const result: unknown = await autumn.customers.billingPortal(billingContext.customerId, {
			return_url: `${process.env.SITE_URL}/billing`
		});
		return { url: extractActionUrl(result) };
	}
});
