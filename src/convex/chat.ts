import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';

const CHAT_REQUESTS_PER_HOUR = 30;
const HOUR_MS = 60 * 60 * 1000;

export const consumeRequest = mutation({
	args: {},
	returns: v.object({ remaining: v.number(), resetsAt: v.number() }),
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		const now = Date.now();
		const windowStart = Math.floor(now / HOUR_MS) * HOUR_MS;
		const record = await ctx.db
			.query('chatRateLimits')
			.withIndex('by_userId_and_windowStart', (q) =>
				q.eq('userId', user._id).eq('windowStart', windowStart)
			)
			.unique();

		if ((record?.count ?? 0) >= CHAT_REQUESTS_PER_HOUR) {
			throw new Error('Hourly AI request limit reached. Try again after the limit resets.');
		}
		const count = (record?.count ?? 0) + 1;
		if (record) {
			await ctx.db.patch(record._id, { count, updatedAt: now });
		} else {
			await ctx.db.insert('chatRateLimits', {
				userId: user._id,
				windowStart,
				count,
				updatedAt: now
			});
		}

		return {
			remaining: CHAT_REQUESTS_PER_HOUR - count,
			resetsAt: windowStart + HOUR_MS
		};
	}
});
