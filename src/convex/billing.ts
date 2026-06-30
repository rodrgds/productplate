import { action } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { Autumn } from 'autumn-js';
import { authComponent } from './auth';

// Ensure SITE_URL is set for Better Auth
if (!process.env.SITE_URL && process.env.BETTER_AUTH_URL) {
	process.env.SITE_URL = process.env.BETTER_AUTH_URL;
}

// Re-export listProducts as-is
export { listProducts } from './autumn';

function toPlainConvexValue(value: unknown): unknown {
	try {
		return JSON.parse(JSON.stringify(value));
	} catch (error) {
		return String(error);
	}
}

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function isCustomerNotFound(error: unknown): boolean {
	const plainError = toPlainConvexValue(error);
	if (!plainError || typeof plainError !== 'object') return false;

	const serialized = JSON.stringify(plainError);
	return (
		serialized.includes('customer_not_found') ||
		(serialized.includes('Customer') && serialized.includes('not found'))
	);
}

// Get customer subscription data using the Autumn JS SDK directly
export const getCustomer = action({
	args: {},
	returns: v.object({
		data: v.any(),
		error: v.union(v.string(), v.null()),
		statusCode: v.number()
	}),
	handler: async (ctx) => {
		try {
			const user = await authComponent.getAuthUser(ctx);
			if (!user) {
				return { data: null, error: 'Not authenticated', statusCode: 401 };
			}

			const autumn = new Autumn({
				secretKey: process.env.AUTUMN_SECRET_KEY ?? ''
			});

			const customerId = user._id.toString();
			let customer: unknown;
			try {
				customer = await autumn.customers.get(customerId);
			} catch (error) {
				if (!isCustomerNotFound(error)) {
					throw error;
				}

				await ctx.runAction(api.autumn.createCustomer, {});
				customer = await autumn.customers.get(customerId);
			}
			if (isCustomerNotFound(customer)) {
				await ctx.runAction(api.autumn.createCustomer, {});
				customer = await autumn.customers.get(customerId);
			}

			return { data: toPlainConvexValue(customer), error: null, statusCode: 200 };
		} catch (error) {
			console.error('Error getting customer:', error);
			return { data: null, error: getErrorMessage(error), statusCode: 500 };
		}
	}
});

// Wrapper for checkout that creates customer first
export const checkout = action({
	args: { productId: v.string() },
	returns: v.any(),
	handler: async (ctx, args): Promise<unknown> => {
		// First ensure customer exists by calling createCustomer
		await ctx.runAction(api.autumn.createCustomer, {});

		// Now proceed with checkout
		return await ctx.runAction(api.autumn.checkout, {
			productId: args.productId,
			successUrl: `${process.env.SITE_URL}/billing`
		});
	}
});

// Wrapper for billing portal that creates customer first
export const billingPortal = action({
	args: {},
	returns: v.any(),
	handler: async (ctx): Promise<unknown> => {
		// First ensure customer exists by calling createCustomer
		await ctx.runAction(api.autumn.createCustomer, {});

		// Now proceed with billing portal
		return await ctx.runAction(api.autumn.billingPortal, {
			returnUrl: `${process.env.SITE_URL}/billing`
		});
	}
});
