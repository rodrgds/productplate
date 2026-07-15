import {
	internalMutation,
	internalQuery,
	mutation,
	query,
	type MutationCtx,
	type QueryCtx
} from './_generated/server';
import { v } from 'convex/values';
import { paginationOptsValidator, paginationResultValidator } from 'convex/server';
import { authComponent } from './auth';
import type { Doc, Id } from './_generated/dataModel';
import { onboardingFormSchema } from '../lib/forms/schemas.js';
import { isDemoAccountEmail } from '../lib/demo-account.js';

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

const workspaceSummaryValidator = v.object({
	organization: organizationValidator,
	membership: memberValidator
});

const workspaceListItemValidator = v.object({
	organization: organizationValidator,
	membership: memberValidator
});

const memberAdministrationValidator = v.object({
	members: v.array(memberValidator),
	invites: v.array(inviteValidator)
});

const billingOverviewValidator = v.object({
	organization: organizationValidator,
	membership: memberValidator,
	entitlements: v.array(entitlementValidator)
});

type Role = Doc<'organizationMembers'>['role'];
type EntitlementPatch = {
	key: string;
	enabled: boolean;
	limit?: number;
	source: 'plan' | 'billing' | 'manual';
};

interface CurrentAuthUser {
	_id: string;
	email: string;
	name: string;
	role?: string | null;
}

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

async function getProfile(ctx: QueryCtx | MutationCtx, userId: string) {
	return await ctx.db
		.query('userProfiles')
		.withIndex('by_userId', (q) => q.eq('userId', userId))
		.first();
}

async function getActiveMembership(ctx: QueryCtx | MutationCtx, userId: string) {
	const profile = await getProfile(ctx, userId);
	if (profile?.activeOrganizationId) {
		const selected = await getMembership(ctx, profile.activeOrganizationId, userId);
		if (selected) return selected;
	}

	const membership = await ctx.db
		.query('organizationMembers')
		.withIndex('by_userId_and_status', (q) => q.eq('userId', userId).eq('status', 'active'))
		.first();

	return membership ?? null;
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

async function requireCurrentUser(ctx: QueryCtx | MutationCtx): Promise<CurrentAuthUser> {
	const user = await authComponent.safeGetAuthUser(ctx);
	if (!user) {
		throw new Error('Your session is still connecting. Refresh the page or sign in again.');
	}

	return user;
}

async function requireRole(
	ctx: QueryCtx | MutationCtx,
	orgId: Id<'organizations'>,
	minimumRole: Role
) {
	const user = await requireCurrentUser(ctx);
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

async function assertMemberCapacity(ctx: MutationCtx, orgId: Id<'organizations'>) {
	const entitlement = await ctx.db
		.query('entitlements')
		.withIndex('by_orgId_and_key', (q) => q.eq('orgId', orgId).eq('key', 'members'))
		.unique();
	if (!entitlement?.enabled) throw new Error('The members entitlement is not enabled.');
	if (entitlement.limit === undefined) return;

	const members = await ctx.db
		.query('organizationMembers')
		.withIndex('by_orgId', (q) => q.eq('orgId', orgId))
		.take(entitlement.limit);
	const pendingInvites = await ctx.db
		.query('organizationInvites')
		.withIndex('by_orgId_and_status', (q) => q.eq('orgId', orgId).eq('status', 'pending'))
		.take(entitlement.limit);
	if (
		members.filter((member) => member.status === 'active').length + pendingInvites.length >=
		entitlement.limit
	) {
		throw new Error('The workspace member limit has been reached.');
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

async function ensureWorkspaceForUser(
	ctx: MutationCtx,
	user: CurrentAuthUser,
	workspaceName?: string
) {
	const existingMembership = await getActiveMembership(ctx, user._id);
	if (existingMembership) return existingMembership.orgId;

	const orgId = await createOrganizationForUser(ctx, {
		name: workspaceName?.trim() || `${user.name || 'My'} workspace`,
		userId: user._id,
		email: user.email,
		displayName: user.name
	});
	const profile = await getProfile(ctx, user._id);
	if (profile) {
		await ctx.db.patch(profile._id, { activeOrganizationId: orgId, updatedAt: Date.now() });
	}
	return orgId;
}

export const completeOnboarding = mutation({
	args: {
		displayName: v.string(),
		bio: v.string(),
		role: v.string(),
		workspaceName: v.string(),
		image: v.optional(v.string())
	},
	returns: workspaceSummaryValidator,
	handler: async (ctx, args) => {
		const validation = onboardingFormSchema.safeParse(args);
		if (!validation.success) {
			throw new Error(validation.error.issues[0]?.message ?? 'Invalid form data.');
		}

		const user = await requireCurrentUser(ctx);
		const now = Date.now();
		const orgId = await ensureWorkspaceForUser(ctx, user, validation.data.workspaceName);
		const existingProfile = await getProfile(ctx, user._id);
		const profileData = {
			displayName: validation.data.displayName,
			bio: validation.data.bio,
			role: validation.data.role,
			workspaceName: validation.data.workspaceName,
			image: args.image,
			activeOrganizationId: orgId,
			updatedAt: now
		};

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, profileData);
		} else {
			await ctx.db.insert('userProfiles', {
				userId: user._id,
				...profileData,
				onboardingCompletedAt: now
			});
		}

		const summary = await getWorkspaceSummary(ctx, orgId, user._id);
		if (!summary) throw new Error('Workspace was not found after onboarding.');
		return summary;
	}
});

export const ensureCurrent = mutation({
	args: {
		workspaceName: v.optional(v.string())
	},
	returns: workspaceSummaryValidator,
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		const orgId = await ensureWorkspaceForUser(ctx, user, args.workspaceName);

		const summary = await getWorkspaceSummary(ctx, orgId, user._id);
		if (!summary) throw new Error('Workspace was not found after setup.');
		return summary;
	}
});

export const getCurrent = query({
	args: {},
	returns: v.union(workspaceSummaryValidator, v.null()),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;

		const membership = await getActiveMembership(ctx, user._id);
		if (!membership) return null;

		return await getWorkspaceSummary(ctx, membership.orgId, user._id);
	}
});

export const listCurrent = query({
	args: {},
	returns: v.array(workspaceListItemValidator),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return [];
		const memberships = await ctx.db
			.query('organizationMembers')
			.withIndex('by_userId_and_status', (q) => q.eq('userId', user._id).eq('status', 'active'))
			.take(50);
		const workspaces = await Promise.all(
			memberships.map(async (membership) => {
				const organization = await ctx.db.get(membership.orgId);
				return organization ? { organization, membership } : null;
			})
		);
		return workspaces
			.filter((workspace): workspace is NonNullable<typeof workspace> => workspace !== null)
			.sort((a, b) => a.organization.name.localeCompare(b.organization.name));
	}
});

export const setCurrent = mutation({
	args: { orgId: v.id('organizations') },
	returns: workspaceSummaryValidator,
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		const membership = await getMembership(ctx, args.orgId, user._id);
		if (!membership) throw new Error('You do not have access to this workspace.');
		const organization = await ctx.db.get(args.orgId);
		if (!organization) throw new Error('Workspace not found.');
		const profile = await getProfile(ctx, user._id);
		if (!profile) throw new Error('Complete onboarding before selecting a workspace.');

		await ctx.db.patch(profile._id, {
			activeOrganizationId: args.orgId,
			workspaceName: organization.name,
			updatedAt: Date.now()
		});
		return { organization, membership };
	}
});

async function getWorkspaceSummary(
	ctx: QueryCtx | MutationCtx,
	orgId: Id<'organizations'>,
	userId: string
) {
	const organization = await ctx.db.get(orgId);
	const membership = await getMembership(ctx, orgId, userId);
	if (!organization || !membership) return null;

	return { organization, membership };
}

export const getMemberAdministration = query({
	args: {},
	returns: v.union(memberAdministrationValidator, v.null()),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;
		const profile = await getProfile(ctx, user._id);
		if (profile?.isDemo) return null;
		const membership = await getActiveMembership(ctx, user._id);
		if (!membership || roleRank[membership.role] < roleRank.admin) return null;

		const members = await ctx.db
			.query('organizationMembers')
			.withIndex('by_orgId', (q) => q.eq('orgId', membership.orgId))
			.take(100);
		const invites = await ctx.db
			.query('organizationInvites')
			.withIndex('by_orgId_and_status', (q) =>
				q.eq('orgId', membership.orgId).eq('status', 'pending')
			)
			.take(100);

		return { members, invites };
	}
});

export const getBillingOverview = query({
	args: {},
	returns: v.union(billingOverviewValidator, v.null()),
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return null;
		const profile = await getProfile(ctx, user._id);
		if (profile?.isDemo) return null;
		const membership = await getActiveMembership(ctx, user._id);
		if (!membership || roleRank[membership.role] < roleRank.admin) return null;
		const organization = await ctx.db.get(membership.orgId);
		if (!organization) return null;
		const entitlements = await ctx.db
			.query('entitlements')
			.withIndex('by_orgId', (q) => q.eq('orgId', membership.orgId))
			.take(50);
		return { organization, membership, entitlements };
	}
});

export const inviteMember = mutation({
	args: {
		orgId: v.id('organizations'),
		email: v.string(),
		role: organizationRoleValidator
	},
	returns: inviteValidator,
	handler: async (ctx, args) => {
		const { user } = await requireRole(ctx, args.orgId, 'admin');
		if (isDemoAccountEmail(user.email)) {
			throw new Error('Workspace invitations are unavailable in demo accounts.');
		}
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
			.withIndex('by_orgId_and_email_and_status', (q) =>
				q.eq('orgId', args.orgId).eq('email', normalizedEmail).eq('status', 'pending')
			)
			.first();
		const activeInvite = existing;
		if (activeInvite) return activeInvite;
		await assertMemberCapacity(ctx, args.orgId);

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
		const user = await requireCurrentUser(ctx);
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
		const profile = await getProfile(ctx, user._id);
		if (profile) {
			const organization = await ctx.db.get(invite.orgId);
			await ctx.db.patch(profile._id, {
				activeOrganizationId: invite.orgId,
				...(organization ? { workspaceName: organization.name } : {}),
				updatedAt: now
			});
		}
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
	args: { paginationOpts: paginationOptsValidator },
	returns: paginationResultValidator(
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
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		if (user.role !== 'admin') throw new Error('Admin access required.');

		const organizationsPage = await ctx.db
			.query('organizations')
			.order('desc')
			.paginate(args.paginationOpts);
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
		for (const organization of organizationsPage.page) {
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

		return { ...organizationsPage, page: results };
	}
});

export const applyVerifiedBillingPlan = internalMutation({
	args: {
		orgId: v.id('organizations'),
		actorUserId: v.string(),
		productId: v.union(v.string(), v.null()),
		status: v.string()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const orgId = args.orgId;
		const organization = await ctx.db.get(orgId);
		if (!organization) throw new Error('Workspace not found.');
		const productId = args.status === 'active' && args.productId ? args.productId : 'starter';
		const plan = billingPlanEntitlements[productId] ?? billingPlanEntitlements.starter;
		const now = Date.now();
		const planChanged = organization.planKey !== plan.planKey;

		await ctx.db.patch(orgId, {
			planKey: plan.planKey,
			updatedAt: now
		});
		await upsertEntitlements(
			ctx,
			orgId,
			plan.entitlements.map((entitlement) => ({
				...entitlement,
				source: productId === 'starter' ? 'plan' : 'billing'
			}))
		);
		if (planChanged) {
			await ctx.db.insert('notifications', {
				orgId,
				userId: args.actorUserId,
				type: 'billing',
				title: 'Billing entitlements synced',
				body: `Workspace plan is now ${plan.planKey}.`,
				actionUrl: '/billing',
				createdAt: now
			});
			await insertAuditLog(ctx, {
				orgId,
				action: 'billing.entitlements_synced',
				target: plan.planKey,
				metadata: { status: args.status, productId: args.productId ?? 'starter' }
			});
		}
		return null;
	}
});

export const getCurrentBillingContext = internalQuery({
	args: {},
	returns: v.object({
		orgId: v.id('organizations'),
		customerId: v.string(),
		organizationName: v.string(),
		actorUserId: v.string(),
		actorEmail: v.string()
	}),
	handler: async (ctx) => {
		const user = await requireCurrentUser(ctx);
		const profile = await getProfile(ctx, user._id);
		if (profile?.isDemo) throw new Error('Billing is unavailable in demo accounts.');
		const membership = await getActiveMembership(ctx, user._id);
		if (!membership || roleRank[membership.role] < roleRank.admin) {
			throw new Error('Billing requires a workspace owner or administrator.');
		}
		const organization = await ctx.db.get(membership.orgId);
		if (!organization) throw new Error('Workspace not found.');
		return {
			orgId: organization._id,
			customerId: `org_${organization._id}`,
			organizationName: organization.name,
			actorUserId: user._id,
			actorEmail: user.email
		};
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
		const user = await requireCurrentUser(ctx);
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
