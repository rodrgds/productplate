import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';

export const generateUploadUrl = mutation({
	args: {},
	returns: v.string(),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) throw new Error('Not authenticated');
		return await ctx.storage.generateUploadUrl();
	}
});

export const getImageUrl = query({
	args: { storageId: v.id('_storage') },
	returns: v.union(v.string(), v.null()),
	handler: async (ctx, args) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) throw new Error('Not authenticated');
		return await ctx.storage.getUrl(args.storageId);
	}
});
