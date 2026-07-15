import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

export const expireOldInvites = internalMutation({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const now = Date.now();
		const invites = await ctx.db
			.query('organizationInvites')
			.withIndex('by_status_and_expiresAt', (q) => q.eq('status', 'pending').lt('expiresAt', now))
			.take(100);

		for (const invite of invites) {
			await ctx.db.patch(invite._id, {
				status: 'expired',
				updatedAt: now
			});
		}
		if (invites.length === 100) {
			await ctx.scheduler.runAfter(0, internal.maintenance.expireOldInvites, {});
		}

		return invites.length;
	}
});

export const pruneReadNotifications = internalMutation({
	args: {
		olderThanDays: v.optional(v.number())
	},
	returns: v.number(),
	handler: async (ctx, args) => {
		const cutoff = Date.now() - (args.olderThanDays ?? 45) * 24 * 60 * 60 * 1000;
		const notifications = await ctx.db
			.query('notifications')
			.withIndex('by_readAt', (q) => q.gt('readAt', 0).lt('readAt', cutoff))
			.take(100);

		for (const notification of notifications) {
			await ctx.db.delete(notification._id);
		}
		if (notifications.length === 100) {
			await ctx.scheduler.runAfter(0, internal.maintenance.pruneReadNotifications, args);
		}

		return notifications.length;
	}
});

export const pruneOperationalData = internalMutation({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const now = Date.now();
		const day = 24 * 60 * 60 * 1000;
		const batches = [
			await ctx.db
				.query('chatRateLimits')
				.withIndex('by_updatedAt', (q) => q.lt('updatedAt', now - 2 * day))
				.take(25),
			await ctx.db
				.query('uploadRateLimits')
				.withIndex('by_updatedAt', (q) => q.lt('updatedAt', now - 2 * day))
				.take(25),
			await ctx.db
				.query('demoCreationLimits')
				.withIndex('by_updatedAt', (q) => q.lt('updatedAt', now - 2 * day))
				.take(25),
			await ctx.db
				.query('webhookDeliveries')
				.withIndex('by_updatedAt', (q) => q.lt('updatedAt', now - 30 * day))
				.take(25),
			await ctx.db
				.query('auditLogs')
				.withIndex('by_createdAt', (q) => q.lt('createdAt', now - 90 * day))
				.take(25)
		] as const;

		let deleted = 0;
		for (const batch of batches) {
			for (const document of batch) {
				await ctx.db.delete(document._id);
				deleted += 1;
			}
		}
		if (batches.some((batch) => batch.length === 25)) {
			await ctx.scheduler.runAfter(0, internal.maintenance.pruneOperationalData, {});
		}
		return deleted;
	}
});
