import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_URLS_PER_DAY = 20;
const PROFILE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function utcDayStart(timestamp: number) {
	const date = new Date(timestamp);
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export const generateUploadUrl = mutation({
	args: {},
	returns: v.string(),
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		const now = Date.now();
		const windowStart = utcDayStart(now);
		const limit = await ctx.db
			.query('uploadRateLimits')
			.withIndex('by_userId_and_windowStart', (q) =>
				q.eq('userId', user._id).eq('windowStart', windowStart)
			)
			.unique();

		if ((limit?.count ?? 0) >= MAX_UPLOAD_URLS_PER_DAY) {
			throw new Error('Daily profile image upload limit reached. Try again tomorrow.');
		}
		if (limit) {
			await ctx.db.patch(limit._id, { count: limit.count + 1, updatedAt: now });
		} else {
			await ctx.db.insert('uploadRateLimits', {
				userId: user._id,
				windowStart,
				count: 1,
				updatedAt: now
			});
		}

		return await ctx.storage.generateUploadUrl();
	}
});

export const finalizeProfileImage = mutation({
	args: { storageId: v.id('_storage') },
	returns: v.object({ url: v.string() }),
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		const existingFile = await ctx.db
			.query('uploadedFiles')
			.withIndex('by_storageId', (q) => q.eq('storageId', args.storageId))
			.unique();
		if (existingFile && existingFile.userId !== user._id) {
			throw new Error('Uploaded image not found.');
		}

		const metadata = await ctx.db.system.get('_storage', args.storageId);
		if (!metadata) throw new Error('Uploaded image not found.');
		if (
			!metadata.contentType ||
			!PROFILE_IMAGE_TYPES.has(metadata.contentType) ||
			metadata.size > MAX_PROFILE_IMAGE_BYTES
		) {
			await ctx.storage.delete(args.storageId);
			throw new Error('Profile images must be JPEG, PNG, or WebP files no larger than 5 MB.');
		}

		if (!existingFile) {
			await ctx.db.insert('uploadedFiles', {
				storageId: args.storageId,
				userId: user._id,
				purpose: 'profile_image',
				contentType: metadata.contentType,
				size: metadata.size,
				createdAt: Date.now()
			});
		}

		const url = await ctx.storage.getUrl(args.storageId);
		if (!url) throw new Error('Uploaded image URL could not be created.');
		const profile = await ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.first();
		if (profile) {
			const previousStorageId = profile.imageStorageId;
			await ctx.db.patch(profile._id, {
				image: url,
				imageStorageId: args.storageId,
				updatedAt: Date.now()
			});
			if (previousStorageId && previousStorageId !== args.storageId) {
				const previousFile = await ctx.db
					.query('uploadedFiles')
					.withIndex('by_storageId', (q) => q.eq('storageId', previousStorageId))
					.unique();
				if (previousFile?.userId === user._id) {
					await ctx.storage.delete(previousStorageId);
					await ctx.db.delete(previousFile._id);
				}
			}
		}

		return { url };
	}
});

export const getImageUrl = query({
	args: { storageId: v.id('_storage') },
	returns: v.union(v.string(), v.null()),
	handler: async (ctx, args) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;
		const file = await ctx.db
			.query('uploadedFiles')
			.withIndex('by_storageId', (q) => q.eq('storageId', args.storageId))
			.unique();
		if (!file || file.userId !== user._id) return null;
		return await ctx.storage.getUrl(args.storageId);
	}
});

export const removeCurrentProfileImage = mutation({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		const profile = await ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.first();
		if (!profile) return null;

		if (profile.imageStorageId) {
			const file = await ctx.db
				.query('uploadedFiles')
				.withIndex('by_storageId', (q) => q.eq('storageId', profile.imageStorageId!))
				.unique();
			if (file?.userId === user._id) {
				await ctx.storage.delete(profile.imageStorageId);
				await ctx.db.delete(file._id);
			}
		}
		await ctx.db.patch(profile._id, {
			image: undefined,
			imageStorageId: undefined,
			updatedAt: Date.now()
		});
		return null;
	}
});
