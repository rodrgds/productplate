import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

export const expireOldInvites = internalMutation({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const now = Date.now();
		const invites = await ctx.db.query('organizationInvites').take(100);
		let expired = 0;

		for (const invite of invites) {
			if (invite.status === 'pending' && invite.expiresAt < now) {
				await ctx.db.patch(invite._id, {
					status: 'expired',
					updatedAt: now
				});
				expired += 1;
			}
		}

		return expired;
	}
});

export const pruneReadNotifications = internalMutation({
	args: {
		olderThanDays: v.optional(v.number())
	},
	returns: v.number(),
	handler: async (ctx, args) => {
		const cutoff = Date.now() - (args.olderThanDays ?? 45) * 24 * 60 * 60 * 1000;
		const notifications = await ctx.db.query('notifications').take(100);
		let pruned = 0;

		for (const notification of notifications) {
			if (notification.readAt && notification.readAt < cutoff) {
				await ctx.db.delete(notification._id);
				pruned += 1;
			}
		}

		return pruned;
	}
});

export const queueWebhookRetries = internalMutation({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const now = Date.now();
		const deliveries = await ctx.db
			.query('webhookDeliveries')
			.withIndex('by_status_and_nextAttemptAt', (q) =>
				q.eq('status', 'failed').lte('nextAttemptAt', now)
			)
			.take(50);

		for (const delivery of deliveries) {
			await ctx.db.patch(delivery._id, {
				status: 'pending',
				updatedAt: now
			});
		}

		return deliveries.length;
	}
});
