import { mutation, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';

const CREATIONS_PER_DAY_PER_FINGERPRINT = 3;
const GLOBAL_CREATIONS_PER_DAY = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

function dayStart(timestamp: number) {
	return Math.floor(timestamp / DAY_MS) * DAY_MS;
}

async function consumeLimit(
	ctx: MutationCtx,
	fingerprint: string,
	windowStart: number,
	limit: number
) {
	const existing = await ctx.db
		.query('demoCreationLimits')
		.withIndex('by_fingerprint_and_windowStart', (q) =>
			q.eq('fingerprint', fingerprint).eq('windowStart', windowStart)
		)
		.unique();
	if ((existing?.count ?? 0) >= limit) {
		throw new Error('Demo creation limit reached. Try again tomorrow.');
	}
	const now = Date.now();
	if (existing) {
		await ctx.db.patch(existing._id, { count: existing.count + 1, updatedAt: now });
	} else {
		await ctx.db.insert('demoCreationLimits', {
			fingerprint,
			windowStart,
			count: 1,
			updatedAt: now
		});
	}
}

export const reserveCreation = mutation({
	args: { secret: v.string(), fingerprint: v.string() },
	returns: v.null(),
	handler: async (ctx, args) => {
		const expectedSecret = process.env.DEMO_CREATION_SECRET;
		if (!expectedSecret || args.secret !== expectedSecret)
			throw new Error('Demo creation unavailable.');
		if (!/^[a-f0-9]{64}$/.test(args.fingerprint)) throw new Error('Invalid demo fingerprint.');

		const windowStart = dayStart(Date.now());
		await consumeLimit(
			ctx,
			`client:${args.fingerprint}`,
			windowStart,
			CREATIONS_PER_DAY_PER_FINGERPRINT
		);
		await consumeLimit(ctx, 'global', windowStart, GLOBAL_CREATIONS_PER_DAY);
		return null;
	}
});
