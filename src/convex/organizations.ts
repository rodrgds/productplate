import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';
import type { Doc, Id } from './_generated/dataModel';

const organizationRoleValidator = v.union(
	v.literal('owner'),
	v.literal('admin'),
	v.literal('member'),
	v.literal('viewer')
);

const memberStatusValidator = v.union(v.literal('active'), v.literal('removed'));

const organizationValidator = v.object({
	_id: v.id('organizations'),
	_creationTime: v.number(),
	name: v.string(),
	slug: v.string(),
	ownerUserId: v.string(),
	planKey: v.string(),
	createdAt: v.number(),
	updatedAt: v.number()
});

const memberValidator = v.object({
	_id: v.id('organizationMembers'),
	_creationTime: v.number(),
	orgId: v.id('organizations'),
	userId: v.string(),
	email: v.string(),
	displayName: v.optional(v.string()),
	role: organizationRoleValidator,
	status: memberStatusValidator,
	joinedAt: v.number(),
	updatedAt: v.number()
});

const inviteValidator = v.object({
	_id: v.id('organizationInvites'),
	_creationTime: v.number(),
	orgId: v.id('organizations'),
	email: v.string(),
	role: organizationRoleValidator,
	invitedByUserId: v.string(),
	token: v.string(),
	status: v.union(
		v.literal('pending'),
		v.literal('accepted'),
		v.literal('revoked'),
		v.literal('expired')
	),
	expiresAt: v.number(),
	createdAt: v.number(),
	updatedAt: v.number()
});

const entitlementValidator = v.object({
	_id: v.id('entitlements'),
	_creationTime: v.number(),
	orgId: v.id('organizations'),
	key: v.string(),
	enabled: v.boolean(),
	limit: v.optional(v.number()),
	usage: v.number(),
	source: v.union(v.literal('plan'), v.literal('billing'), v.literal('manual')),
	updatedAt: v.number()
});

const notificationValidator = v.object({
	_id: v.id('notifications'),
	_creationTime: v.number(),
	orgId: v.optional(v.id('organizations')),
	userId: v.string(),
	type: v.union(
		v.literal('invite'),
		v.literal('billing'),
		v.literal('system'),
		v.literal('security'),
		v.literal('usage')
	),
	title: v.string(),
	body: v.string(),
	actionUrl: v.optional(v.string()),
	readAt: v.optional(v.number()),
	createdAt: v.number()
});

const apiKeySummaryValidator = v.object({
	_id: v.id('apiKeys'),
	name: v.string(),
	prefix: v.string(),
	scopes: v.array(v.string()),
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

const workspaceOverviewValidator = v.object({
	organization: organizationValidator,
	membership: memberValidator,
	members: v.array(memberValidator),
	invites: v.array(inviteValidator),
	entitlements: v.array(entitlementValidator),
	notifications: v.array(notificationValidator),
	apiKeys: v.array(apiKeySummaryValidator),
	webhooks: v.array(webhookEndpointSummaryValidator)
});

type Role = Doc<'organizationMembers'>['role'];
type EntitlementPatch = {
	key: string;
	enabled: boolean;
	limit?: number;
	source: 'plan' | 'billing' | 'manual';
};

const roleRank: Record<Role, number> = {
	viewer: 0,
	member: 1,
	admin: 2,
	owner: 3
};

const defaultEntitlements: readonly {
	key: string;
	enabled: boolean;
	limit?: number;
}[] = [
	{ key: 'members', enabled: true, limit: 3 },
	{ key: 'api_keys', enabled: true, limit: 3 },
	{ key: 'webhooks', enabled: true, limit: 2 },
	{ key: 'ai_messages', enabled: true, limit: 250 },
	{ key: 'advanced_admin', enabled: false }
];

const billingPlanEntitlements: Record<
	string,
	{
		planKey: string;
		entitlements: readonly Omit<EntitlementPatch, 'source'>[];
	}
> = {
	starter: {
		planKey: 'starter',
		entitlements: [
			{ key: 'members', enabled: true, limit: 3 },
			{ key: 'api_keys', enabled: true, limit: 3 },
			{ key: 'webhooks', enabled: true, limit: 2 },
			{ key: 'ai_messages', enabled: true, limit: 250 },
			{ key: 'advanced_admin', enabled: false }
		]
	},
	pro: {
		planKey: 'pro',
		entitlements: [
			{ key: 'members', enabled: true, limit: 10 },
			{ key: 'api_keys', enabled: true, limit: 10 },
			{ key: 'webhooks', enabled: true, limit: 10 },
			{ key: 'ai_messages', enabled: true, limit: 5000 },
			{ key: 'advanced_admin', enabled: true }
		]
	},
	team: {
		planKey: 'team',
		entitlements: [
			{ key: 'members', enabled: true, limit: 25 },
			{ key: 'api_keys', enabled: true, limit: 25 },
			{ key: 'webhooks', enabled: true, limit: 25 },
			{ key: 'ai_messages', enabled: true, limit: 25000 },
			{ key: 'advanced_admin', enabled: true }
		]
	}
};

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function slugify(value: string) {
	const slug = value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');

	return slug || `workspace-${Date.now()}`;
}

function randomToken(byteLength = 24) {
	const bytes = new Uint8Array(byteLength);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function getFirstActiveMembership(ctx: QueryCtx | MutationCtx, userId: string) {
	const memberships = await ctx.db
		.query('organizationMembers')
		.withIndex('by_userId', (q) => q.eq('userId', userId))
		.take(20);

	return memberships.find((membership) => membership.status === 'active') ?? null;
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
	minimumRole: Role
) {
	const user = await authComponent.getAuthUser(ctx);
	const membership = await getMembership(ctx, orgId, user._id);
	if (!membership || roleRank[membership.role] < roleRank[minimumRole]) {
		throw new Error('You do not have permission to manage this workspace.');
	}

	return { user, membership };
}

async function insertAuditLog(
	ctx: MutationCtx,
	args: {
		orgId?: Id<'organizations'>;
		actorUserId?: string;
		action: string;
		target: string;
		metadata?: Record<string, string>;
	}
) {
	const auditLog: {
		orgId?: Id<'organizations'>;
		actorUserId?: string;
		action: string;
		target: string;
		metadata: Record<string, string>;
		createdAt: number;
	} = {
		action: args.action,
		target: args.target,
		metadata: args.metadata ?? {},
		createdAt: Date.now()
	};

	if (args.orgId) auditLog.orgId = args.orgId;
	if (args.actorUserId) auditLog.actorUserId = args.actorUserId;

	await ctx.db.insert('auditLogs', auditLog);
}

async function insertDefaultEntitlements(ctx: MutationCtx, orgId: Id<'organizations'>) {
	const now = Date.now();
	for (const entitlement of defaultEntitlements) {
		const entitlementRecord: {
			orgId: Id<'organizations'>;
			key: string;
			enabled: boolean;
			limit?: number;
			usage: number;
			source: 'plan';
			updatedAt: number;
		} = {
			orgId,
			key: entitlement.key,
			enabled: entitlement.enabled,
			usage: 0,
			source: 'plan',
			updatedAt: now
		};
		if (entitlement.limit !== undefined) entitlementRecord.limit = entitlement.limit;

		await ctx.db.insert('entitlements', entitlementRecord);
	}
}

async function upsertEntitlements(
	ctx: MutationCtx,
	orgId: Id<'organizations'>,
	entitlements: readonly EntitlementPatch[]
) {
	const now = Date.now();
	for (const entitlement of entitlements) {
		const existing = await ctx.db
			.query('entitlements')
			.withIndex('by_orgId_and_key', (q) => q.eq('orgId', orgId).eq('key', entitlement.key))
			.unique();

		const patch: {
			enabled: boolean;
			limit?: number;
			source: 'plan' | 'billing' | 'manual';
			updatedAt: number;
		} = {
			enabled: entitlement.enabled,
			source: entitlement.source,
			updatedAt: now
		};
		if (entitlement.limit !== undefined) patch.limit = entitlement.limit;

		if (existing) {
			await ctx.db.patch(existing._id, patch);
			continue;
		}

		const record: {
			orgId: Id<'organizations'>;
			key: string;
			enabled: boolean;
			limit?: number;
			usage: number;
			source: 'plan' | 'billing' | 'manual';
			updatedAt: number;
		} = {
			orgId,
			key: entitlement.key,
			enabled: entitlement.enabled,
			usage: 0,
			source: entitlement.source,
			updatedAt: now
		};
		if (entitlement.limit !== undefined) record.limit = entitlement.limit;
		await ctx.db.insert('entitlements', record);
	}
}

async function createOrganizationForUser(
	ctx: MutationCtx,
	args: {
		name: string;
		userId: string;
		email: string;
		displayName?: string;
	}
) {
	const now = Date.now();
	const orgId = await ctx.db.insert('organizations', {
		name: args.name,
		slug: `${slugify(args.name)}-${randomToken(3)}`,
		ownerUserId: args.userId,
		planKey: 'starter',
		createdAt: now,
		updatedAt: now
	});

	const member: {
		orgId: Id<'organizations'>;
		userId: string;
		email: string;
		displayName?: string;
		role: 'owner';
		status: 'active';
		joinedAt: number;
		updatedAt: number;
	} = {
		orgId,
		userId: args.userId,
		email: normalizeEmail(args.email),
		role: 'owner',
		status: 'active',
		joinedAt: now,
		updatedAt: now
	};
	if (args.displayName) member.displayName = args.displayName;

	await ctx.db.insert('organizationMembers', member);

	await insertDefaultEntitlements(ctx, orgId);
	await ctx.db.insert('notifications', {
		orgId,
		userId: args.userId,
		type: 'system',
		title: 'Workspace ready',
		body: 'Your starter workspace now has members, entitlements, API keys, webhooks, and notifications wired.',
		actionUrl: '/workspace',
		createdAt: now
	});
	await insertAuditLog(ctx, {
		orgId,
		actorUserId: args.userId,
		action: 'organization.created',
		target: orgId,
		metadata: { name: args.name }
	});

	return orgId;
}

export const ensureCurrent = mutation({
	args: {
		workspaceName: v.optional(v.string())
	},
	returns: workspaceOverviewValidator,
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		const existingMembership = await getFirstActiveMembership(ctx, user._id);
		let orgId = existingMembership?.orgId;

		if (!orgId) {
			orgId = await createOrganizationForUser(ctx, {
				name: args.workspaceName?.trim() || `${user.name || 'My'} workspace`,
				userId: user._id,
				email: user.email,
				displayName: user.name
			});
		}

		const overview = await getWorkspaceOverview(ctx, orgId, user._id);
		if (!overview) throw new Error('Workspace was not found after setup.');
		return overview;
	}
});

export const getCurrent = query({
	args: {},
	returns: v.union(workspaceOverviewValidator, v.null()),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;

		const membership = await getFirstActiveMembership(ctx, user._id);
		if (!membership) return null;

		return await getWorkspaceOverview(ctx, membership.orgId, user._id);
	}
});

async function getWorkspaceOverview(
	ctx: QueryCtx | MutationCtx,
	orgId: Id<'organizations'>,
	userId: string
) {
	const organization = await ctx.db.get(orgId);
	const membership = await getMembership(ctx, orgId, userId);
	if (!organization || !membership) return null;

	const members = await ctx.db
		.query('organizationMembers')
		.withIndex('by_orgId', (q) => q.eq('orgId', orgId))
		.take(50);
	const invites = await ctx.db
		.query('organizationInvites')
		.withIndex('by_orgId', (q) => q.eq('orgId', orgId))
		.take(50);
	const entitlements = await ctx.db
		.query('entitlements')
		.withIndex('by_orgId', (q) => q.eq('orgId', orgId))
		.take(50);
	const notifications = await ctx.db
		.query('notifications')
		.withIndex('by_userId', (q) => q.eq('userId', userId))
		.order('desc')
		.take(10);
	const apiKeys = await ctx.db
		.query('apiKeys')
		.withIndex('by_orgId', (q) => q.eq('orgId', orgId))
		.take(20);
	const webhooks = await ctx.db
		.query('webhookEndpoints')
		.withIndex('by_orgId', (q) => q.eq('orgId', orgId))
		.take(20);

	return {
		organization,
		membership,
		members,
		invites: invites.filter((invite) => invite.status === 'pending'),
		entitlements,
		notifications,
		apiKeys: apiKeys.map(({ _id, name, prefix, scopes, lastUsedAt, revokedAt, createdAt }) => ({
			_id,
			name,
			prefix,
			scopes,
			lastUsedAt,
			revokedAt,
			createdAt
		})),
		webhooks: webhooks.map(({ _id, url, description, events, enabled, createdAt, updatedAt }) => ({
			_id,
			url,
			description,
			events,
			enabled,
			createdAt,
			updatedAt
		}))
	};
}

export const inviteMember = mutation({
	args: {
		orgId: v.id('organizations'),
		email: v.string(),
		role: organizationRoleValidator
	},
	returns: inviteValidator,
	handler: async (ctx, args) => {
		const { user } = await requireRole(ctx, args.orgId, 'admin');
		if (args.role === 'owner') {
			throw new Error(
				'Owners cannot be invited directly. Invite an admin, then transfer ownership.'
			);
		}

		const organization = await ctx.db.get(args.orgId);
		if (!organization) throw new Error('Workspace not found.');

		const now = Date.now();
		const normalizedEmail = normalizeEmail(args.email);
		const existing = await ctx.db
			.query('organizationInvites')
			.withIndex('by_orgId_and_email', (q) =>
				q.eq('orgId', args.orgId).eq('email', normalizedEmail)
			)
			.take(10);
		const activeInvite = existing.find((invite) => invite.status === 'pending');
		if (activeInvite) return activeInvite;

		const inviteId = await ctx.db.insert('organizationInvites', {
			orgId: args.orgId,
			email: normalizedEmail,
			role: args.role,
			invitedByUserId: user._id,
			token: randomToken(),
			status: 'pending',
			expiresAt: now + 1000 * 60 * 60 * 24 * 14,
			createdAt: now,
			updatedAt: now
		});

		await insertAuditLog(ctx, {
			orgId: args.orgId,
			actorUserId: user._id,
			action: 'member.invited',
			target: normalizedEmail,
			metadata: { role: args.role }
		});

		const invite = await ctx.db.get(inviteId);
		if (!invite) throw new Error('Invite was not found after creation.');
		return invite;
	}
});

export const getInviteByToken = query({
	args: {
		token: v.string()
	},
	returns: v.union(
		v.object({
			invite: inviteValidator,
			organization: organizationValidator
		}),
		v.null()
	),
	handler: async (ctx, args) => {
		const invite = await ctx.db
			.query('organizationInvites')
			.withIndex('by_token', (q) => q.eq('token', args.token))
			.unique();
		if (!invite || invite.status !== 'pending' || invite.expiresAt < Date.now()) return null;

		const organization = await ctx.db.get(invite.orgId);
		if (!organization) return null;
		return { invite, organization };
	}
});

export const acceptInvite = mutation({
	args: {
		token: v.string()
	},
	returns: memberValidator,
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		const invite = await ctx.db
			.query('organizationInvites')
			.withIndex('by_token', (q) => q.eq('token', args.token))
			.unique();

		if (!invite || invite.status !== 'pending') throw new Error('Invite is not valid.');
		if (invite.expiresAt < Date.now()) throw new Error('Invite has expired.');
		if (normalizeEmail(user.email) !== invite.email) {
			throw new Error('Sign in with the invited email address to accept this invite.');
		}

		const existing = await getMembership(ctx, invite.orgId, user._id);
		if (existing) return existing;

		const now = Date.now();
		const memberRecord: {
			orgId: Id<'organizations'>;
			userId: string;
			email: string;
			displayName?: string;
			role: Role;
			status: 'active';
			joinedAt: number;
			updatedAt: number;
		} = {
			orgId: invite.orgId,
			userId: user._id,
			email: normalizeEmail(user.email),
			role: invite.role,
			status: 'active',
			joinedAt: now,
			updatedAt: now
		};
		if (user.name) memberRecord.displayName = user.name;

		const memberId = await ctx.db.insert('organizationMembers', memberRecord);

		await ctx.db.patch(invite._id, {
			status: 'accepted',
			updatedAt: now
		});
		await ctx.db.insert('notifications', {
			orgId: invite.orgId,
			userId: user._id,
			type: 'invite',
			title: 'Workspace joined',
			body: `You joined the workspace as ${invite.role}.`,
			actionUrl: '/workspace',
			createdAt: now
		});
		await insertAuditLog(ctx, {
			orgId: invite.orgId,
			actorUserId: user._id,
			action: 'member.joined',
			target: user._id,
			metadata: { role: invite.role }
		});

		const member = await ctx.db.get(memberId);
		if (!member) throw new Error('Membership was not found after creation.');
		return member;
	}
});

export const updateMemberRole = mutation({
	args: {
		memberId: v.id('organizationMembers'),
		role: organizationRoleValidator
	},
	returns: memberValidator,
	handler: async (ctx, args) => {
		const member = await ctx.db.get(args.memberId);
		if (!member) throw new Error('Member not found.');
		const { user } = await requireRole(ctx, member.orgId, 'owner');
		if (member.role === 'owner' || args.role === 'owner') {
			throw new Error('Owner changes should use an explicit ownership transfer flow.');
		}

		await ctx.db.patch(member._id, {
			role: args.role,
			updatedAt: Date.now()
		});
		await insertAuditLog(ctx, {
			orgId: member.orgId,
			actorUserId: user._id,
			action: 'member.role_updated',
			target: member.userId,
			metadata: { role: args.role }
		});

		const updated = await ctx.db.get(member._id);
		if (!updated) throw new Error('Member was not found after update.');
		return updated;
	}
});

export const removeMember = mutation({
	args: {
		memberId: v.id('organizationMembers')
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const member = await ctx.db.get(args.memberId);
		if (!member) return null;
		const { user } = await requireRole(ctx, member.orgId, 'admin');
		if (member.role === 'owner') throw new Error('Owners cannot be removed.');

		await ctx.db.patch(member._id, {
			status: 'removed',
			updatedAt: Date.now()
		});
		await insertAuditLog(ctx, {
			orgId: member.orgId,
			actorUserId: user._id,
			action: 'member.removed',
			target: member.userId
		});
		return null;
	}
});

export const revokeInvite = mutation({
	args: {
		inviteId: v.id('organizationInvites')
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const invite = await ctx.db.get(args.inviteId);
		if (!invite) return null;
		const { user } = await requireRole(ctx, invite.orgId, 'admin');

		await ctx.db.patch(invite._id, {
			status: 'revoked',
			updatedAt: Date.now()
		});
		await insertAuditLog(ctx, {
			orgId: invite.orgId,
			actorUserId: user._id,
			action: 'member.invite_revoked',
			target: invite.email
		});
		return null;
	}
});

export const adminListOrganizations = query({
	args: {},
	returns: v.array(
		v.object({
			organization: organizationValidator,
			members: v.array(memberValidator),
			entitlements: v.array(entitlementValidator),
			subscription: v.union(
				v.object({
					planKey: v.string(),
					status: v.string(),
					source: v.string(),
					updatedAt: v.number()
				}),
				v.null()
			)
		})
	),
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (user.role !== 'admin') throw new Error('Admin access required.');

		const organizations = await ctx.db.query('organizations').order('desc').take(50);
		const results: {
			organization: Doc<'organizations'>;
			members: Doc<'organizationMembers'>[];
			entitlements: Doc<'entitlements'>[];
			subscription: {
				planKey: string;
				status: string;
				source: string;
				updatedAt: number;
			} | null;
		}[] = [];
		for (const organization of organizations) {
			const members = await ctx.db
				.query('organizationMembers')
				.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
				.take(20);
			const entitlements = await ctx.db
				.query('entitlements')
				.withIndex('by_orgId', (q) => q.eq('orgId', organization._id))
				.take(20);
			results.push({
				organization,
				members,
				entitlements,
				subscription: {
					planKey: organization.planKey,
					status: organization.planKey === 'starter' ? 'starter' : 'active',
					source: entitlements.some((entitlement) => entitlement.source === 'billing')
						? 'billing'
						: 'plan',
					updatedAt: organization.updatedAt
				}
			});
		}

		return results;
	}
});

export const syncBillingPlan = mutation({
	args: {
		productId: v.optional(v.string()),
		status: v.optional(v.string())
	},
	returns: workspaceOverviewValidator,
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		const membership = await getFirstActiveMembership(ctx, user._id);
		if (!membership) {
			throw new Error('Create a workspace before syncing billing entitlements.');
		}

		const productId = args.status === 'active' ? (args.productId ?? 'starter') : 'starter';
		const plan = billingPlanEntitlements[productId] ?? billingPlanEntitlements.starter;
		const now = Date.now();

		await ctx.db.patch(membership.orgId, {
			planKey: plan.planKey,
			updatedAt: now
		});
		await upsertEntitlements(
			ctx,
			membership.orgId,
			plan.entitlements.map((entitlement) => ({
				...entitlement,
				source: productId === 'starter' ? 'plan' : 'billing'
			}))
		);
		await ctx.db.insert('notifications', {
			orgId: membership.orgId,
			userId: user._id,
			type: 'billing',
			title: 'Billing entitlements synced',
			body: `Workspace plan is now ${plan.planKey}.`,
			actionUrl: '/billing',
			createdAt: now
		});
		await insertAuditLog(ctx, {
			orgId: membership.orgId,
			actorUserId: user._id,
			action: 'billing.entitlements_synced',
			target: plan.planKey,
			metadata: { status: args.status ?? 'none', productId: args.productId ?? 'starter' }
		});

		const overview = await getWorkspaceOverview(ctx, membership.orgId, user._id);
		if (!overview) throw new Error('Workspace was not found after billing sync.');
		return overview;
	}
});

export const adminSetEntitlement = mutation({
	args: {
		orgId: v.id('organizations'),
		key: v.string(),
		enabled: v.boolean(),
		limit: v.optional(v.number())
	},
	returns: entitlementValidator,
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (user.role !== 'admin') throw new Error('Admin access required.');

		const existing = await ctx.db
			.query('entitlements')
			.withIndex('by_orgId_and_key', (q) => q.eq('orgId', args.orgId).eq('key', args.key))
			.unique();
		const now = Date.now();

		if (existing) {
			const patch: {
				enabled: boolean;
				limit?: number;
				source: 'manual';
				updatedAt: number;
			} = {
				enabled: args.enabled,
				source: 'manual',
				updatedAt: now
			};
			if (args.limit !== undefined) patch.limit = args.limit;

			await ctx.db.patch(existing._id, patch);
			const updated = await ctx.db.get(existing._id);
			if (!updated) throw new Error('Entitlement was not found after update.');
			return updated;
		}

		const entitlementRecord: {
			orgId: Id<'organizations'>;
			key: string;
			enabled: boolean;
			limit?: number;
			usage: number;
			source: 'manual';
			updatedAt: number;
		} = {
			orgId: args.orgId,
			key: args.key,
			enabled: args.enabled,
			usage: 0,
			source: 'manual',
			updatedAt: now
		};
		if (args.limit !== undefined) entitlementRecord.limit = args.limit;

		const entitlementId = await ctx.db.insert('entitlements', entitlementRecord);

		const entitlement = await ctx.db.get(entitlementId);
		if (!entitlement) throw new Error('Entitlement was not found after creation.');
		return entitlement;
	}
});
