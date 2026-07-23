import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { authComponent } from './auth';

const category = v.union(
	v.literal('bug'),
	v.literal('idea'),
	v.literal('question'),
	v.literal('other')
);
const status = v.union(v.literal('open'), v.literal('in_progress'), v.literal('closed'));

const feedbackValidator = v.object({
	_id: v.id('feedback'),
	_creationTime: v.number(),
	category,
	message: v.string(),
	currentPath: v.optional(v.string()),
	userId: v.string(),
	requestId: v.string(),
	status,
	createdAt: v.number(),
	updatedAt: v.number()
});

export const create = mutation({
	args: {
		category,
		message: v.string(),
		requestId: v.string()
	},
	returns: v.id('feedback'),
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		const message = args.message.trim();
		if (message.length < 10 || message.length > 2_000) throw new Error('Invalid feedback message.');
		if (args.requestId.length > 200) throw new Error('Invalid feedback context.');
		const now = Date.now();
		return await ctx.db.insert('feedback', {
			category: args.category,
			message,
			userId: user._id,
			requestId: args.requestId,
			status: 'open',
			createdAt: now,
			updatedAt: now
		});
	}
});

export const listForOperator = query({
	args: { status: v.optional(status) },
	returns: v.array(feedbackValidator),
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (user.role !== 'admin') throw new Error('Operator access required.');
		return args.status
			? await ctx.db
					.query('feedback')
					.withIndex('by_status_and_createdAt', (q) => q.eq('status', args.status!))
					.order('desc')
					.take(100)
			: await ctx.db.query('feedback').order('desc').take(100);
	}
});

export const setStatus = mutation({
	args: { feedbackId: v.id('feedback'), status },
	returns: v.null(),
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (user.role !== 'admin') throw new Error('Operator access required.');
		await ctx.db.patch('feedback', args.feedbackId, { status: args.status, updatedAt: Date.now() });
		return null;
	}
});
