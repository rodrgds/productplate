import { internalMutation, mutation, query, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';
import { internal } from './_generated/api';

const notificationTypeValidator = v.union(
	v.literal('invite'),
	v.literal('billing'),
	v.literal('system'),
	v.literal('security'),
	v.literal('usage')
);

const notificationValidator = v.object({
	_id: v.id('notifications'),
	_creationTime: v.number(),
	orgId: v.optional(v.id('organizations')),
	userId: v.string(),
	type: notificationTypeValidator,
	title: v.string(),
	body: v.string(),
	actionUrl: v.optional(v.string()),
	readAt: v.optional(v.number()),
	createdAt: v.number()
});

export const listCurrent = query({
	args: {
		limit: v.optional(v.number())
	},
	returns: v.array(notificationValidator),
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		return await ctx.db
			.query('notifications')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.order('desc')
			.take(args.limit ?? 25);
	}
});

export const unreadCount = query({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return 0;
		const notifications = await ctx.db
			.query('notifications')
			.withIndex('by_userId_and_readAt', (q) => q.eq('userId', user._id).eq('readAt', undefined))
			.take(100);

		return notifications.length;
	}
});

export const markRead = mutation({
	args: {
		notificationId: v.id('notifications')
	},
	returns: notificationValidator,
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		const notification = await ctx.db.get(args.notificationId);
		if (!notification || notification.userId !== user._id)
			throw new Error('Notification not found.');
		if (!notification.readAt) {
			await ctx.db.patch(notification._id, { readAt: Date.now() });
		}

		const updated = await ctx.db.get(notification._id);
		if (!updated) throw new Error('Notification was not found after update.');
		return updated;
	}
});

export const markAllRead = mutation({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		return await markUnreadBatch(ctx, user._id, Date.now());
	}
});

async function markUnreadBatch(ctx: MutationCtx, userId: string, readAt: number) {
	const notifications = await ctx.db
		.query('notifications')
		.withIndex('by_userId_and_readAt', (q) => q.eq('userId', userId).eq('readAt', undefined))
		.take(100);
	for (const notification of notifications) {
		await ctx.db.patch(notification._id, { readAt });
	}
	if (notifications.length === 100) {
		await ctx.scheduler.runAfter(0, internal.notifications.markAllReadContinuation, {
			userId,
			readAt
		});
	}

	return notifications.length;
}

export const markAllReadContinuation = internalMutation({
	args: { userId: v.string(), readAt: v.number() },
	returns: v.number(),
	handler: async (ctx, args) => await markUnreadBatch(ctx, args.userId, args.readAt)
});

export const create = internalMutation({
	args: {
		orgId: v.optional(v.id('organizations')),
		userId: v.string(),
		type: notificationTypeValidator,
		title: v.string(),
		body: v.string(),
		actionUrl: v.optional(v.string())
	},
	returns: notificationValidator,
	handler: async (ctx, args) => {
		const notification: {
			orgId?: typeof args.orgId;
			userId: string;
			type: typeof args.type;
			title: string;
			body: string;
			actionUrl?: string;
			createdAt: number;
		} = {
			userId: args.userId,
			type: args.type,
			title: args.title,
			body: args.body,
			createdAt: Date.now()
		};

		if (args.orgId) notification.orgId = args.orgId;
		if (args.actionUrl) notification.actionUrl = args.actionUrl;

		const notificationId = await ctx.db.insert('notifications', notification);
		const created = await ctx.db.get(notificationId);
		if (!created) throw new Error('Notification was not found after creation.');
		return created;
	}
});
