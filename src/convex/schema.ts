import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	userProfiles: defineTable({
		userId: v.string(),
		displayName: v.string(),
		bio: v.string(),
		role: v.string(),
		workspaceName: v.string(),
		image: v.optional(v.string()),
		onboardingCompletedAt: v.number(),
		updatedAt: v.number()
	}).index('by_userId', ['userId'])
});
