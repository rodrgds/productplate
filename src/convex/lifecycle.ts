import {
	internalAction,
	internalMutation,
	internalQuery,
	type MutationCtx
} from './_generated/server';
import { v } from 'convex/values';
import { components, internal } from './_generated/api';
import type { DataModel, Doc } from './_generated/dataModel';

const CLEANUP_BATCH_SIZE = 50;

type AppTableName = keyof DataModel;

async function deleteDocuments<TableName extends AppTableName>(
	ctx: MutationCtx,
	documents: Doc<TableName>[]
) {
	for (const document of documents) await ctx.db.delete(document._id);
}

async function scheduleCleanup(ctx: MutationCtx, userId: string) {
	await ctx.scheduler.runAfter(0, internal.lifecycle.cleanupDeletedUser, { userId });
}

export async function assertUserCanBeDeleted(ctx: MutationCtx, userId: string) {
	const ownedOrganizations = await ctx.db
		.query('organizations')
		.withIndex('by_ownerUserId', (q) => q.eq('ownerUserId', userId))
		.take(50);

	for (const organization of ownedOrganizations) {
		const activeMembers = await ctx.db
			.query('organizationMembers')
			.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
			.take(100);
		if (activeMembers.some((member) => member.status === 'active' && member.userId !== userId)) {
			throw new Error(`Transfer ownership of ${organization.name} before deleting this account.`);
		}
	}
}

export async function queueUserDeletionForAuth(ctx: MutationCtx, userId: string) {
	await assertUserCanBeDeleted(ctx, userId);
	const existing = await ctx.db
		.query('accountDeletionJobs')
		.withIndex('by_userId', (q) => q.eq('userId', userId))
		.first();
	if (!existing) {
		const now = Date.now();
		await ctx.db.insert('accountDeletionJobs', {
			userId,
			status: 'pending',
			createdAt: now,
			updatedAt: now
		});
	}
	await scheduleCleanup(ctx, userId);
}

export const startAccountDeletion = internalMutation({
	args: { userId: v.string() },
	returns: v.null(),
	handler: async (ctx, args) => {
		await queueUserDeletionForAuth(ctx, args.userId);
		return null;
	}
});

async function cleanupOwnedOrganization(ctx: MutationCtx, organization: Doc<'organizations'>) {
	const deliveries = await ctx.db
		.query('webhookDeliveries')
		.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (deliveries.length) {
		await deleteDocuments(ctx, deliveries);
		return true;
	}

	const endpoints = await ctx.db
		.query('webhookEndpoints')
		.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (endpoints.length) {
		await deleteDocuments(ctx, endpoints);
		return true;
	}

	const apiKeys = await ctx.db
		.query('apiKeys')
		.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (apiKeys.length) {
		await deleteDocuments(ctx, apiKeys);
		return true;
	}

	const invites = await ctx.db
		.query('organizationInvites')
		.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (invites.length) {
		await deleteDocuments(ctx, invites);
		return true;
	}

	const entitlements = await ctx.db
		.query('entitlements')
		.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (entitlements.length) {
		await deleteDocuments(ctx, entitlements);
		return true;
	}

	const notifications = await ctx.db
		.query('notifications')
		.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (notifications.length) {
		await deleteDocuments(ctx, notifications);
		return true;
	}

	const auditLogs = await ctx.db
		.query('auditLogs')
		.withIndex('by_orgId_and_createdAt', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (auditLogs.length) {
		await deleteDocuments(ctx, auditLogs);
		return true;
	}

	const usageCounters = await ctx.db
		.query('usageCounters')
		.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (usageCounters.length) {
		await deleteDocuments(ctx, usageCounters);
		return true;
	}

	const members = await ctx.db
		.query('organizationMembers')
		.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
		.take(CLEANUP_BATCH_SIZE);
	if (members.length) {
		await deleteDocuments(ctx, members);
		return true;
	}

	await ctx.db.delete(organization._id);
	return true;
}

export const cleanupDeletedUser = internalMutation({
	args: { userId: v.string() },
	returns: v.number(),
	handler: async (ctx, args) => {
		const job = await ctx.db
			.query('accountDeletionJobs')
			.withIndex('by_userId', (q) => q.eq('userId', args.userId))
			.first();
		if (!job) return 0;
		if (job.status !== 'running') {
			await ctx.db.patch(job._id, { status: 'running', updatedAt: Date.now() });
		}

		const ownedOrganization = await ctx.db
			.query('organizations')
			.withIndex('by_ownerUserId', (q) => q.eq('ownerUserId', args.userId))
			.first();
		if (ownedOrganization) {
			await cleanupOwnedOrganization(ctx, ownedOrganization);
			await scheduleCleanup(ctx, args.userId);
			return 1;
		}

		const uploadedFiles = await ctx.db
			.query('uploadedFiles')
			.withIndex('by_userId', (q) => q.eq('userId', args.userId))
			.take(CLEANUP_BATCH_SIZE);
		if (uploadedFiles.length) {
			for (const file of uploadedFiles) {
				await ctx.storage.delete(file.storageId);
				await ctx.db.delete(file._id);
			}
			await scheduleCleanup(ctx, args.userId);
			return uploadedFiles.length;
		}

		const userScopedBatches = [
			await ctx.db
				.query('notifications')
				.withIndex('by_userId', (q) => q.eq('userId', args.userId))
				.take(CLEANUP_BATCH_SIZE),
			await ctx.db
				.query('uploadRateLimits')
				.withIndex('by_userId', (q) => q.eq('userId', args.userId))
				.take(CLEANUP_BATCH_SIZE),
			await ctx.db
				.query('chatRateLimits')
				.withIndex('by_userId', (q) => q.eq('userId', args.userId))
				.take(CLEANUP_BATCH_SIZE),
			await ctx.db
				.query('organizationMembers')
				.withIndex('by_userId', (q) => q.eq('userId', args.userId))
				.take(CLEANUP_BATCH_SIZE),
			await ctx.db
				.query('auditLogs')
				.withIndex('by_actorUserId', (q) => q.eq('actorUserId', args.userId))
				.take(CLEANUP_BATCH_SIZE),
			await ctx.db
				.query('userProfiles')
				.withIndex('by_userId', (q) => q.eq('userId', args.userId))
				.take(CLEANUP_BATCH_SIZE)
		] as const;

		for (const batch of userScopedBatches) {
			if (!batch.length) continue;
			for (const document of batch) await ctx.db.delete(document._id);
			await scheduleCleanup(ctx, args.userId);
			return batch.length;
		}

		await ctx.db.delete(job._id);
		return 0;
	}
});

export const listExpiredDemoUsers = internalQuery({
	args: {},
	returns: v.array(v.string()),
	handler: async (ctx) => {
		const profiles = await ctx.db
			.query('userProfiles')
			.withIndex('by_demo_and_expiry', (q) => q.eq('isDemo', true).lte('demoExpiresAt', Date.now()))
			.take(20);
		return profiles.map((profile) => profile.userId);
	}
});

export const expireDemoAccounts = internalAction({
	args: {},
	returns: v.number(),
	handler: async (ctx): Promise<number> => {
		const userIds: string[] = await ctx.runQuery(internal.lifecycle.listExpiredDemoUsers, {});
		for (const userId of userIds) {
			const paginationOpts = { cursor: null, numItems: 100 };
			await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
				input: { model: 'session', where: [{ field: 'userId', value: userId }] },
				paginationOpts
			});
			await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
				input: { model: 'account', where: [{ field: 'userId', value: userId }] },
				paginationOpts
			});
			await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
				input: { model: 'user', where: [{ field: '_id', value: userId }] }
			});
			await ctx.runMutation(internal.lifecycle.startAccountDeletion, { userId });
		}
		return userIds.length;
	}
});
