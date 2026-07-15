import { components } from './_generated/api';
import { Autumn } from '@useautumn/convex';
import { authComponent } from './auth';
import type { GenericCtx } from '@convex-dev/better-auth';
import type { DataModel } from './_generated/dataModel';

export const autumn = new Autumn(components.autumn, {
	secretKey: process.env.AUTUMN_SECRET_KEY ?? '',
	identify: async (ctx: GenericCtx<DataModel>) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;

		return {
			customerId: user._id,
			customerData: {
				name: user.name ?? '',
				email: user.email ?? ''
			}
		};
	}
});

export const {
	track,
	cancel,
	query,
	attach,
	check,
	checkout,
	usage,
	setupPayment,
	createCustomer,
	listProducts,
	billingPortal,
	createReferralCode,
	redeemReferralCode,
	createEntity,
	getEntity
} = autumn.api();
