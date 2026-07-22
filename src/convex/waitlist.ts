import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const rateLimit = 5;
const rateWindowMs = 10 * 60 * 1000;

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function configuredExportSecret() {
	return typeof process === 'undefined' ? undefined : process.env.WAITLIST_EXPORT_SECRET;
}

function requireExportSecret(secret: string) {
	const configured = configuredExportSecret();
	if (!configured || secret !== configured) throw new Error('WAITLIST_EXPORT_UNAUTHORIZED');
}

export const subscribe = mutation({
	args: {
		email: v.string(),
		fingerprint: v.string(),
		source: v.optional(v.string()),
		utmSource: v.optional(v.string()),
		utmMedium: v.optional(v.string()),
		utmCampaign: v.optional(v.string()),
		now: v.number()
	},
	returns: v.object({ accepted: v.literal(true), shouldSendEmail: v.boolean() }),
	handler: async (ctx, args) => {
		const windowStart = Math.floor(args.now / rateWindowMs) * rateWindowMs;
		const rate = await ctx.db
			.query('waitlistRateLimits')
			.withIndex('by_fingerprint_and_windowStart', (q) =>
				q.eq('fingerprint', args.fingerprint).eq('windowStart', windowStart)
			)
			.unique();
		if (rate?.count && rate.count >= rateLimit) throw new Error('WAITLIST_RATE_LIMITED');
		if (rate) {
			await ctx.db.patch('waitlistRateLimits', rate._id, {
				count: rate.count + 1,
				updatedAt: args.now
			});
		} else {
			await ctx.db.insert('waitlistRateLimits', {
				fingerprint: args.fingerprint,
				windowStart,
				count: 1,
				updatedAt: args.now
			});
		}

		const emailNormalized = normalizeEmail(args.email);
		const existing = await ctx.db
			.query('waitlistSubscribers')
			.withIndex('by_emailNormalized', (q) => q.eq('emailNormalized', emailNormalized))
			.unique();
		const shouldSendEmail = !existing || existing.status === 'unsubscribed';
		if (existing) {
			await ctx.db.patch('waitlistSubscribers', existing._id, {
				status: 'subscribed',
				updatedAt: args.now,
				unsubscribedAt: undefined,
				source: existing.source ?? args.source,
				utmSource: existing.utmSource ?? args.utmSource,
				utmMedium: existing.utmMedium ?? args.utmMedium,
				utmCampaign: existing.utmCampaign ?? args.utmCampaign
			});
		} else {
			await ctx.db.insert('waitlistSubscribers', {
				email: args.email.trim(),
				emailNormalized,
				status: 'subscribed',
				source: args.source,
				utmSource: args.utmSource,
				utmMedium: args.utmMedium,
				utmCampaign: args.utmCampaign,
				createdAt: args.now,
				updatedAt: args.now
			});
		}
		return { accepted: true as const, shouldSendEmail };
	}
});

export const unsubscribe = mutation({
	args: { emailNormalized: v.string(), secret: v.string(), now: v.number() },
	returns: v.object({ accepted: v.literal(true) }),
	handler: async (ctx, args) => {
		requireExportSecret(args.secret);
		const subscriber = await ctx.db
			.query('waitlistSubscribers')
			.withIndex('by_emailNormalized', (q) => q.eq('emailNormalized', args.emailNormalized))
			.unique();
		if (subscriber) {
			await ctx.db.patch('waitlistSubscribers', subscriber._id, {
				status: 'unsubscribed',
				updatedAt: args.now,
				unsubscribedAt: args.now
			});
		}
		return { accepted: true as const };
	}
});

export const exportPage = query({
	args: { secret: v.string(), paginationOpts: paginationOptsValidator },
	handler: async (ctx, args) => {
		requireExportSecret(args.secret);
		return await ctx.db.query('waitlistSubscribers').order('asc').paginate(args.paginationOpts);
	}
});
