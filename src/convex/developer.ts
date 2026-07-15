import {
	internalMutation,
	internalQuery,
	mutation,
	query,
	type MutationCtx,
	type QueryCtx
} from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';
import type { Doc, Id } from './_generated/dataModel';
import { isDemoAccountEmail } from '../lib/demo-account.js';

const roleRank: Record<Doc<'organizationMembers'>['role'], number> = {
	viewer: 0,
	member: 1,
	admin: 2,
	owner: 3
};

const apiKeySummaryValidator = v.object({
	_id: v.id('apiKeys'),
	name: v.string(),
	prefix: v.string(),
	scopes: v.array(v.string()),
	lastUsedAt: v.optional(v.number()),
	revokedAt: v.optional(v.number()),
	createdAt: v.number()
});

const apiKeyRecordValidator = v.object({
	_id: v.id('apiKeys'),
	_creationTime: v.number(),
	orgId: v.id('organizations'),
	name: v.string(),
	prefix: v.string(),
	keyHash: v.string(),
	scopes: v.array(v.string()),
	createdByUserId: v.string(),
	lastUsedAt: v.optional(v.number()),
	revokedAt: v.optional(v.number()),
	createdAt: v.number()
});

const developerSettingsValidator = v.object({
	orgId: v.id('organizations'),
	apiKeys: v.array(apiKeySummaryValidator)
});

function randomSecret(prefix: string, byteLength = 24) {
	const bytes = new Uint8Array(byteLength);
	crypto.getRandomValues(bytes);
	return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

function toSummary(apiKey: Doc<'apiKeys'>) {
	const { _id, name, prefix, scopes, lastUsedAt, revokedAt, createdAt } = apiKey;
	return { _id, name, prefix, scopes, lastUsedAt, revokedAt, createdAt };
}

async function sha256Hex(value: string) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function getMembership(
	ctx: QueryCtx | MutationCtx,
	orgId: Id<'organizations'>,
	userId: string
) {
	const membership = await ctx.db
		.query('organizationMembers')
		.withIndex('by_orgId_and_userId', (q) => q.eq('orgId', orgId).eq('userId', userId))
		.unique();

	return membership?.status === 'active' ? membership : null;
}

async function requireRole(
	ctx: QueryCtx | MutationCtx,
	orgId: Id<'organizations'>,
	minimumRole: Doc<'organizationMembers'>['role']
) {
	const user = await authComponent.getAuthUser(ctx);
	if (isDemoAccountEmail(user.email)) {
		throw new Error('Developer credentials are unavailable in demo accounts.');
	}
	const membership = await getMembership(ctx, orgId, user._id);
	if (!membership || roleRank[membership.role] < roleRank[minimumRole]) {
		throw new Error('You do not have permission to manage developer settings.');
	}

	return { user, membership };
}

async function insertAuditLog(
	ctx: MutationCtx,
	args: {
		orgId: Id<'organizations'>;
		actorUserId?: string;
		action: string;
		target: string;
	}
) {
	await ctx.db.insert('auditLogs', {
		orgId: args.orgId,
		...(args.actorUserId ? { actorUserId: args.actorUserId } : {}),
		action: args.action,
		target: args.target,
		metadata: {},
		createdAt: Date.now()
	});
}

async function assertCanCreateApiKey(ctx: QueryCtx | MutationCtx, orgId: Id<'organizations'>) {
	const entitlement = await ctx.db
		.query('entitlements')
		.withIndex('by_orgId_and_key', (q) => q.eq('orgId', orgId).eq('key', 'api_keys'))
		.unique();

	if (!entitlement?.enabled) throw new Error('The API key entitlement is not enabled.');
	if (entitlement.limit === undefined) return;
	const activeRecords = await ctx.db
		.query('apiKeys')
		.withIndex('by_orgId_and_revokedAt', (q) => q.eq('orgId', orgId).eq('revokedAt', undefined))
		.take(entitlement.limit);
	if (activeRecords.length >= entitlement.limit) {
		throw new Error('The API key entitlement limit has been reached.');
	}
}

function normalizeScopes(scopes: string[]) {
	return Array.from(new Set(scopes.map((scope) => scope.trim()).filter(Boolean))).sort();
}

export const getCurrentSettings = query({
	args: {},
	returns: v.union(developerSettingsValidator, v.null()),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user || isDemoAccountEmail(user.email)) return null;
		const profile = await ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.first();
		const selectedMembership = profile?.activeOrganizationId
			? await getMembership(ctx, profile.activeOrganizationId, user._id)
			: null;
		const membership =
			selectedMembership ??
			(await ctx.db
				.query('organizationMembers')
				.withIndex('by_userId_and_status', (q) => q.eq('userId', user._id).eq('status', 'active'))
				.first());
		if (!membership || roleRank[membership.role] < roleRank.admin) return null;

		const apiKeys = await ctx.db
			.query('apiKeys')
			.withIndex('by_orgId', (q) => q.eq('orgId', membership.orgId))
			.take(50);
		return { orgId: membership.orgId, apiKeys: apiKeys.map(toSummary) };
	}
});

export const createApiKey = mutation({
	args: { orgId: v.id('organizations'), name: v.string(), scopes: v.array(v.string()) },
	returns: v.object({ key: v.string(), apiKey: apiKeySummaryValidator }),
	handler: async (ctx, args) => {
		const { user } = await requireRole(ctx, args.orgId, 'admin');
		await assertCanCreateApiKey(ctx, args.orgId);

		const key = randomSecret('pp_live');
		const prefix = key.slice(0, 16);
		const apiKeyId = await ctx.db.insert('apiKeys', {
			orgId: args.orgId,
			name: args.name.trim() || 'Untitled key',
			prefix,
			keyHash: await sha256Hex(key),
			scopes: normalizeScopes(args.scopes.length ? args.scopes : ['events:write']),
			createdByUserId: user._id,
			createdAt: Date.now()
		});

		await insertAuditLog(ctx, {
			orgId: args.orgId,
			actorUserId: user._id,
			action: 'api_key.created',
			target: prefix
		});
		const apiKey = await ctx.db.get(apiKeyId);
		if (!apiKey) throw new Error('API key was not found after creation.');
		return { key, apiKey: toSummary(apiKey) };
	}
});

export const revokeApiKey = mutation({
	args: { apiKeyId: v.id('apiKeys') },
	returns: apiKeySummaryValidator,
	handler: async (ctx, args) => {
		const apiKey = await ctx.db.get(args.apiKeyId);
		if (!apiKey) throw new Error('API key not found.');
		const { user } = await requireRole(ctx, apiKey.orgId, 'admin');

		await ctx.db.patch(apiKey._id, { revokedAt: Date.now() });
		await insertAuditLog(ctx, {
			orgId: apiKey.orgId,
			actorUserId: user._id,
			action: 'api_key.revoked',
			target: apiKey.prefix
		});

		const updated = await ctx.db.get(apiKey._id);
		if (!updated) throw new Error('API key was not found after revocation.');
		return toSummary(updated);
	}
});

export const getApiKeyByPrefix = internalQuery({
	args: { prefix: v.string() },
	returns: v.union(apiKeyRecordValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db
			.query('apiKeys')
			.withIndex('by_prefix', (q) => q.eq('prefix', args.prefix))
			.unique();
	}
});

export const touchApiKey = internalMutation({
	args: { apiKeyId: v.id('apiKeys') },
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.patch(args.apiKeyId, { lastUsedAt: Date.now() });
		return null;
	}
});
