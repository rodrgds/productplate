import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';
import { assertUserCanBeDeleted } from './lifecycle';

export const assertCanDeleteUser = mutation({
	args: { userId: v.string() },
	returns: v.null(),
	handler: async (ctx, args) => {
		const administrator = await authComponent.getAuthUser(ctx);
		if (administrator.role !== 'admin') throw new Error('Admin access required.');
		if (administrator._id === args.userId) throw new Error('You cannot delete your own account.');
		await assertUserCanBeDeleted(ctx, args.userId);
		return null;
	}
});
