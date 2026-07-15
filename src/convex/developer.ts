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

const webhookEndpointSummaryValidator = v.object({
	_id: v.id('webhookEndpoints'),
	url: v.string(),
	description: v.string(),
	events: v.array(v.string()),
	enabled: v.boolean(),
	createdAt: v.number(),
	updatedAt: v.number()
});

const webhookDeliveryValidator = v.object({
	_id: v.id('webhookDeliveries'),
	_creationTime: v.number(),
	orgId: v.id('organizations'),
	endpointId: v.id('webhookEndpoints'),
	eventType: v.string(),
	status: v.union(v.literal('pending'), v.literal('delivered'), v.literal('failed')),
	attempts: v.number(),
	lastStatusCode: v.optional(v.number()),
	nextAttemptAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number()
});

const developerSettingsValidator = v.object({
	orgId: v.id('organizations'),
	apiKeys: v.array(apiKeySummaryValidator),
	webhooks: v.array(webhookEndpointSummaryValidator)
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

function toWebhookSummary(webhook: Doc<'webhookEndpoints'>) {
	const { _id, url, description, events, enabled, createdAt, updatedAt } = webhook;
	return { _id, url, description, events, enabled, createdAt, updatedAt };
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
		metadata?: Record<string, string>;
	}
) {
	const record: {
		orgId: Id<'organizations'>;
		actorUserId?: string;
		action: string;
		target: string;
		metadata: Record<string, string>;
		createdAt: number;
	} = {
		orgId: args.orgId,
		action: args.action,
		target: args.target,
		metadata: args.metadata ?? {},
		createdAt: Date.now()
	};

	if (args.actorUserId) record.actorUserId = args.actorUserId;
	await ctx.db.insert('auditLogs', record);
}

async function assertCanCreate(
	ctx: QueryCtx | MutationCtx,
	orgId: Id<'organizations'>,
	table: 'apiKeys' | 'webhookEndpoints',
	entitlementKey: string
) {
	const entitlement = await ctx.db
		.query('entitlements')
		.withIndex('by_orgId_and_key', (q) => q.eq('orgId', orgId).eq('key', entitlementKey))
		.unique();

	if (!entitlement?.enabled) {
		throw new Error(`The ${entitlementKey} entitlement is not enabled for this workspace.`);
	}
	if (entitlement.limit === undefined) return;

	const activeRecords =
		table === 'apiKeys'
			? await ctx.db
					.query('apiKeys')
					.withIndex('by_orgId_and_revokedAt', (q) =>
						q.eq('orgId', orgId).eq('revokedAt', undefined)
					)
					.take(entitlement.limit)
			: await ctx.db
					.query('webhookEndpoints')
					.withIndex('by_orgId_and_enabled', (q) => q.eq('orgId', orgId).eq('enabled', true))
					.take(entitlement.limit);
	if (activeRecords.length >= entitlement.limit) {
		throw new Error(`The ${entitlementKey} entitlement limit has been reached.`);
	}
}

function normalizeScopes(scopes: string[]) {
	return Array.from(new Set(scopes.map((scope) => scope.trim()).filter(Boolean))).sort();
}

function normalizeEvents(events: string[]) {
	return Array.from(new Set(events.map((event) => event.trim()).filter(Boolean))).sort();
}

export const getCurrentSettings = query({
	args: {},
	returns: v.union(developerSettingsValidator, v.null()),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;
		const membership = await ctx.db
			.query('organizationMembers')
			.withIndex('by_userId_and_status', (q) => q.eq('userId', user._id).eq('status', 'active'))
			.first();
		if (!membership || roleRank[membership.role] < roleRank.admin) return null;

		const apiKeys = await ctx.db
			.query('apiKeys')
			.withIndex('by_orgId', (q) => q.eq('orgId', membership.orgId))
			.take(50);
		const webhooks = await ctx.db
			.query('webhookEndpoints')
			.withIndex('by_orgId', (q) => q.eq('orgId', membership.orgId))
			.take(50);
		return {
			orgId: membership.orgId,
			apiKeys: apiKeys.map(toSummary),
			webhooks: webhooks.map(toWebhookSummary)
		};
	}
});

export const createApiKey = mutation({
	args: {
		orgId: v.id('organizations'),
		name: v.string(),
		scopes: v.array(v.string())
	},
	returns: v.object({
		key: v.string(),
		apiKey: apiKeySummaryValidator
	}),
	handler: async (ctx, args) => {
		const { user } = await requireRole(ctx, args.orgId, 'admin');
		await assertCanCreate(ctx, args.orgId, 'apiKeys', 'api_keys');

		const key = randomSecret('pp_live');
		const keyHash = await sha256Hex(key);
		const prefix = key.slice(0, 16);
		const now = Date.now();
		const apiKeyId = await ctx.db.insert('apiKeys', {
			orgId: args.orgId,
			name: args.name.trim() || 'Untitled key',
			prefix,
			keyHash,
			scopes: normalizeScopes(args.scopes.length ? args.scopes : ['events:write']),
			createdByUserId: user._id,
			createdAt: now
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
	args: {
		apiKeyId: v.id('apiKeys')
	},
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

export const createWebhookEndpoint = mutation({
	args: {
		orgId: v.id('organizations'),
		url: v.string(),
		description: v.string(),
		events: v.array(v.string())
	},
	returns: v.object({
		secret: v.string(),
		webhook: webhookEndpointSummaryValidator
	}),
	handler: async (ctx, args) => {
		const { user } = await requireRole(ctx, args.orgId, 'admin');
		const url = new URL(args.url);
		if (!['https:', 'http:'].includes(url.protocol)) {
			throw new Error('Webhook URLs must use http or https.');
		}

		await assertCanCreate(ctx, args.orgId, 'webhookEndpoints', 'webhooks');

		const secret = randomSecret('whsec');
		const now = Date.now();
		const webhookId = await ctx.db.insert('webhookEndpoints', {
			orgId: args.orgId,
			url: url.toString(),
			description: args.description.trim() || 'Product event endpoint',
			secretHash: await sha256Hex(secret),
			events: normalizeEvents(args.events.length ? args.events : ['template.event.created']),
			enabled: true,
			createdByUserId: user._id,
			createdAt: now,
			updatedAt: now
		});

		await insertAuditLog(ctx, {
			orgId: args.orgId,
			actorUserId: user._id,
			action: 'webhook.created',
			target: url.toString()
		});

		const webhook = await ctx.db.get(webhookId);
		if (!webhook) throw new Error('Webhook endpoint was not found after creation.');
		return { secret, webhook: toWebhookSummary(webhook) };
	}
});

export const toggleWebhookEndpoint = mutation({
	args: {
		webhookId: v.id('webhookEndpoints'),
		enabled: v.boolean()
	},
	returns: webhookEndpointSummaryValidator,
	handler: async (ctx, args) => {
		const webhook = await ctx.db.get(args.webhookId);
		if (!webhook) throw new Error('Webhook endpoint not found.');
		const { user } = await requireRole(ctx, webhook.orgId, 'admin');

		await ctx.db.patch(webhook._id, {
			enabled: args.enabled,
			updatedAt: Date.now()
		});
		await insertAuditLog(ctx, {
			orgId: webhook.orgId,
			actorUserId: user._id,
			action: args.enabled ? 'webhook.enabled' : 'webhook.disabled',
			target: webhook.url
		});

		const updated = await ctx.db.get(webhook._id);
		if (!updated) throw new Error('Webhook endpoint was not found after update.');
		return toWebhookSummary(updated);
	}
});

export const getApiKeyByPrefix = internalQuery({
	args: {
		prefix: v.string()
	},
	returns: v.union(apiKeyRecordValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db
			.query('apiKeys')
			.withIndex('by_prefix', (q) => q.eq('prefix', args.prefix))
			.unique();
	}
});

export const touchApiKey = internalMutation({
	args: {
		apiKeyId: v.id('apiKeys')
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.patch(args.apiKeyId, { lastUsedAt: Date.now() });
		return null;
	}
});

export const recordWebhookDelivery = internalMutation({
	args: {
		orgId: v.id('organizations'),
		endpointId: v.id('webhookEndpoints'),
		eventType: v.string(),
		status: v.union(v.literal('pending'), v.literal('delivered'), v.literal('failed')),
		attempts: v.number(),
		lastStatusCode: v.optional(v.number()),
		nextRetryInMs: v.optional(v.number())
	},
	returns: webhookDeliveryValidator,
	handler: async (ctx, args) => {
		const now = Date.now();
		const delivery: {
			orgId: Id<'organizations'>;
			endpointId: Id<'webhookEndpoints'>;
			eventType: string;
			status: 'pending' | 'delivered' | 'failed';
			attempts: number;
			lastStatusCode?: number;
			nextAttemptAt?: number;
			createdAt: number;
			updatedAt: number;
		} = {
			orgId: args.orgId,
			endpointId: args.endpointId,
			eventType: args.eventType,
			status: args.status,
			attempts: args.attempts,
			createdAt: now,
			updatedAt: now
		};

		if (args.lastStatusCode !== undefined) delivery.lastStatusCode = args.lastStatusCode;
		if (args.nextRetryInMs !== undefined) delivery.nextAttemptAt = now + args.nextRetryInMs;

		const deliveryId = await ctx.db.insert('webhookDeliveries', delivery);
		const record = await ctx.db.get(deliveryId);
		if (!record) throw new Error('Webhook delivery was not found after creation.');
		return record;
	}
});
