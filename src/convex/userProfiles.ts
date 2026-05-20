import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';
import { onboardingFormSchema, accountFormSchema } from '../lib/forms/schemas.js';

const profileValidator = v.object({
	_id: v.id('userProfiles'),
	_creationTime: v.number(),
	userId: v.string(),
	displayName: v.string(),
	bio: v.string(),
	role: v.string(),
	workspaceName: v.string(),
	image: v.optional(v.string()),
	onboardingCompletedAt: v.number(),
	updatedAt: v.number()
});

export const getCurrent = query({
	args: {},
	returns: v.union(profileValidator, v.null()),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;

		return await ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.unique();
	}
});

export const getByUserId = query({
	args: {
		userId: v.string()
	},
	returns: v.union(profileValidator, v.null()),
	handler: async (ctx, args) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;
		return await ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', args.userId))
			.unique();
	}
});

export const completeOnboarding = mutation({
	args: {
		displayName: v.string(),
		bio: v.string(),
		role: v.string(),
		workspaceName: v.string(),
		image: v.optional(v.string())
	},
	returns: profileValidator,
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		const now = Date.now();

		const validation = onboardingFormSchema.safeParse(args);
		if (!validation.success) {
			throw new Error(validation.error.issues[0]?.message ?? 'Invalid form data.');
		}

		const existing = await ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				...args,
				updatedAt: now
			});
			const updated = await ctx.db.get(existing._id);
			if (!updated) throw new Error('Profile was not found after update.');
			return updated;
		}

		const profileId = await ctx.db.insert('userProfiles', {
			userId: user._id,
			...args,
			onboardingCompletedAt: now,
			updatedAt: now
		});
		const profile = await ctx.db.get(profileId);
		if (!profile) throw new Error('Profile was not found after creation.');
		return profile;
	}
});

export const updateCurrent = mutation({
	args: {
		displayName: v.string(),
		bio: v.string(),
		image: v.optional(v.string())
	},
	returns: profileValidator,
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);

		const validation = accountFormSchema.safeParse(args);
		if (!validation.success) {
			throw new Error(validation.error.issues[0]?.message ?? 'Invalid form data.');
		}

		const existing = await ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.unique();
		if (!existing) {
			throw new Error('Complete onboarding before updating your profile.');
		}

		await ctx.db.patch(existing._id, {
			displayName: args.displayName,
			bio: args.bio,
			image: args.image,
			updatedAt: Date.now()
		});
		const profile = await ctx.db.get(existing._id);
		if (!profile) throw new Error('Profile was not found after update.');
		return profile;
	}
});
