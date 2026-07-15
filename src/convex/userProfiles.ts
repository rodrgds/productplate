import { mutation, query, type DatabaseReader } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';
import { onboardingFormSchema, accountProfileUpdateSchema } from '../lib/forms/schemas.js';
import { DEMO_PROFILE, isDemoAccountEmail } from '../lib/demo-account.js';

const profileValidator = v.object({
	_id: v.id('userProfiles'),
	_creationTime: v.number(),
	userId: v.string(),
	displayName: v.string(),
	bio: v.string(),
	role: v.string(),
	workspaceName: v.string(),
	image: v.optional(v.string()),
	imageStorageId: v.optional(v.id('_storage')),
	onboardingCompletedAt: v.number(),
	updatedAt: v.number()
});

async function getFirstProfileByUserId(db: DatabaseReader, userId: string) {
	const [profile] = await db
		.query('userProfiles')
		.withIndex('by_userId', (q) => q.eq('userId', userId))
		.take(1);

	return profile ?? null;
}

export const getCurrent = query({
	args: {},
	returns: v.union(profileValidator, v.null()),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;

		return await getFirstProfileByUserId(ctx.db, user._id);
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
		return await getFirstProfileByUserId(ctx.db, args.userId);
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

		const existing = await getFirstProfileByUserId(ctx.db, user._id);

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

export const ensureDemoProfile = mutation({
	args: {},
	returns: profileValidator,
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!isDemoAccountEmail(user.email)) {
			throw new Error('The demo profile can only be created for the demo account.');
		}

		const existing = await getFirstProfileByUserId(ctx.db, user._id);

		if (existing) return existing;

		const now = Date.now();
		const profileId = await ctx.db.insert('userProfiles', {
			userId: user._id,
			...DEMO_PROFILE,
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

		const validation = accountProfileUpdateSchema.safeParse(args);
		if (!validation.success) {
			throw new Error(validation.error.issues[0]?.message ?? 'Invalid form data.');
		}
		const profileUpdate = validation.data;

		const existing = await getFirstProfileByUserId(ctx.db, user._id);
		if (!existing) {
			throw new Error('Complete onboarding before updating your profile.');
		}

		const nextImage = profileUpdate.image || undefined;
		if (existing.imageStorageId && nextImage !== existing.image) {
			const ownedFile = await ctx.db
				.query('uploadedFiles')
				.withIndex('by_storageId', (q) => q.eq('storageId', existing.imageStorageId!))
				.unique();
			if (ownedFile?.userId === user._id) {
				await ctx.storage.delete(existing.imageStorageId);
				await ctx.db.delete(ownedFile._id);
			}
		}

		await ctx.db.patch(existing._id, {
			displayName: profileUpdate.displayName,
			bio: profileUpdate.bio,
			image: nextImage,
			...(nextImage === existing.image ? {} : { imageStorageId: undefined }),
			updatedAt: Date.now()
		});
		const profile = await ctx.db.get(existing._id);
		if (!profile) throw new Error('Profile was not found after update.');
		return profile;
	}
});
