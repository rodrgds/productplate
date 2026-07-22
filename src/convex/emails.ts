import { action } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';
import { api } from './_generated/api';
import { deliverProductEmail, renderProductEmail } from '../lib/email/service';

const emailResultValidator = v.object({
	status: v.union(v.literal('sent'), v.literal('preview')),
	to: v.string(),
	subject: v.string(),
	html: v.string(),
	replyTo: v.optional(v.string()),
	providerId: v.optional(v.string())
});

function productName() {
	return process.env.PRODUCT_NAME ?? 'Product Plate';
}

async function deliver(args: { to: string; subject: string; html: string }) {
	return await deliverProductEmail(args, {
		apiKey: process.env.RESEND_API_KEY,
		from: process.env.TRANSACTIONAL_EMAIL_FROM ?? `${productName()} <no-reply@example.com>`
	});
}

export const sendWorkspaceInvite = action({
	args: {
		to: v.string(),
		organizationName: v.string(),
		inviteUrl: v.string()
	},
	returns: emailResultValidator,
	handler: async (ctx, args) => {
		await authComponent.getAuthUser(ctx);
		const overview = await ctx.runQuery(api.organizations.getCurrent, {});
		if (!overview || !['owner', 'admin'].includes(overview.membership.role)) {
			throw new Error('Only workspace owners and admins can send invite emails.');
		}
		return await deliver({
			to: args.to,
			subject: `Join ${args.organizationName}`,
			html: renderProductEmail({
				template: 'workspace-invite',
				productName: productName(),
				workspaceName: args.organizationName,
				actionUrl: args.inviteUrl
			})
		});
	}
});

export const sendSubscriptionStatus = action({
	args: { to: v.string(), status: v.string(), billingUrl: v.string() },
	returns: emailResultValidator,
	handler: async (ctx, args) => {
		await authComponent.getAuthUser(ctx);
		return await deliver({
			to: args.to,
			subject: 'Subscription update',
			html: renderProductEmail({
				template: 'subscription-status',
				productName: productName(),
				status: args.status,
				actionUrl: args.billingUrl
			})
		});
	}
});
