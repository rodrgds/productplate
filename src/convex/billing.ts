import { action, type ActionCtx } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Autumn, type AutumnError } from 'autumn-js';
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

interface ParsedCustomerItem {
	type: string;
	feature_id?: string;
	price?: number;
	interval?: string;
	included_usage?: number;
}

interface ParsedCustomerProduct {
	id: string;
	name: string;
	status: string;
	items?: ParsedCustomerItem[];
}

interface ParsedCustomer {
	products: ParsedCustomerProduct[];
}

function isCustomerNotFound(error: AutumnError): boolean {
	return (
		error.code.includes('customer_not_found') ||
		error.message.includes('customer_not_found') ||
		(error.message.includes('Customer') && error.message.includes('not found'))
	);
}

function toParsedCustomer(products: z.infer<typeof customerSchema>['products']): ParsedCustomer {
	return {
		products: products.map((product) => {
			const items = product.items?.map((item): ParsedCustomerItem => {
				const parsedItem: ParsedCustomerItem = { type: item.type };
				if (item.feature_id !== undefined) parsedItem.feature_id = item.feature_id;
				if (item.price !== undefined) parsedItem.price = item.price;
				if (item.interval !== undefined) parsedItem.interval = item.interval;
				if (item.included_usage !== undefined) parsedItem.included_usage = item.included_usage;
				return parsedItem;
			});

			const parsedProduct: ParsedCustomerProduct = {
				id: product.id,
				name: product.name,
				status: product.status
			};
			if (items) parsedProduct.items = items;
			return parsedProduct;
		})
	};
}

// Some Autumn endpoints wrap the customer in a data envelope; try that shape first.
function parseCustomerResult(result: { data?: unknown }): ParsedCustomer {
	const enveloped = customerResponseEnvelopeSchema.safeParse(result.data);
	if (enveloped.success) return toParsedCustomer(enveloped.data.data.products);

	const direct = customerSchema.safeParse(result.data);
	if (!direct.success) {
		throw new Error('Autumn returned an invalid customer response.');
	}
	return toParsedCustomer(direct.data.products);
}

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

const customerResponseEnvelopeSchema = z
	.object({
		data: customerSchema
	})
	.passthrough();

const customerValidator = v.object({
	products: v.array(customerProductValidator)
});

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
		customer: parseCustomerResult(response)
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
			const message = error instanceof Error ? error.message : String(error);
			return { data: null, error: message, statusCode: 500 };
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

const checkoutResponseSchema = z
	.object({
		data: z.object({ url: z.string() }).passthrough()
	})
	.passthrough();

// Autumn returns the redirect URL inside a data envelope; anything else means no URL.
function extractActionUrl(envelope: { data?: unknown }): string | null {
	const result = checkoutResponseSchema.safeParse(envelope);
	return result.success ? result.data.data.url : null;
}

export const checkout = action({
	args: { productId: v.string() },
	returns: actionUrlValidator,
	handler: async (ctx, args): Promise<{ url: string | null }> => {
		if (!args.productId.trim() || args.productId.length > 100) {
			throw new Error('Invalid billing product.');
		}
		const { autumn, billingContext } = await loadCustomer(ctx);
		const result = await autumn.checkout({
			customer_id: billingContext.customerId,
			product_id: args.productId,
			success_url: `${process.env.SITE_URL}/billing?checkout=completed&plan=${encodeURIComponent(args.productId)}`,
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
		const result = await autumn.customers.billingPortal(billingContext.customerId, {
			return_url: `${process.env.SITE_URL}/billing`
		});
		return { url: extractActionUrl(result) };
	}
});
