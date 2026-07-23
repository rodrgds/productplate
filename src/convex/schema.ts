import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const organizationRole = v.union(
	v.literal('owner'),
	v.literal('admin'),
	v.literal('member'),
	v.literal('viewer')
);

export default defineSchema({
	userProfiles: defineTable({
		userId: v.string(),
		displayName: v.string(),
		bio: v.string(),
		role: v.string(),
		workspaceName: v.string(),
		activeOrganizationId: v.optional(v.id('organizations')),
		isDemo: v.optional(v.boolean()),
		demoExpiresAt: v.optional(v.number()),
		image: v.optional(v.string()),
		imageStorageId: v.optional(v.id('_storage')),
		onboardingCompletedAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_userId', ['userId'])
		.index('by_demo_and_expiry', ['isDemo', 'demoExpiresAt']),
	organizations: defineTable({
		name: v.string(),
		slug: v.string(),
		ownerUserId: v.string(),
		planKey: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_ownerUserId', ['ownerUserId'])
		.index('by_slug', ['slug']),
	organizationMembers: defineTable({
		orgId: v.id('organizations'),
		userId: v.string(),
		email: v.string(),
		displayName: v.optional(v.string()),
		role: organizationRole,
		status: v.union(v.literal('active'), v.literal('removed')),
		joinedAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_orgId', ['orgId'])
		.index('by_userId', ['userId'])
		.index('by_userId_and_status', ['userId', 'status'])
		.index('by_orgId_and_userId', ['orgId', 'userId'])
		.index('by_orgId_and_role', ['orgId', 'role']),
	organizationInvites: defineTable({
		orgId: v.id('organizations'),
		email: v.string(),
		role: organizationRole,
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
	})
		.index('by_token', ['token'])
		.index('by_orgId', ['orgId'])
		.index('by_orgId_and_email', ['orgId', 'email'])
		.index('by_orgId_and_email_and_status', ['orgId', 'email', 'status'])
		.index('by_orgId_and_status', ['orgId', 'status'])
		.index('by_status_and_expiresAt', ['status', 'expiresAt']),
	entitlements: defineTable({
		orgId: v.id('organizations'),
		key: v.string(),
		enabled: v.boolean(),
		limit: v.optional(v.number()),
		usage: v.number(),
		source: v.union(v.literal('plan'), v.literal('billing'), v.literal('manual')),
		updatedAt: v.number()
	})
		.index('by_orgId', ['orgId'])
		.index('by_orgId_and_key', ['orgId', 'key']),
	notifications: defineTable({
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
	})
		.index('by_userId', ['userId'])
		.index('by_userId_and_readAt', ['userId', 'readAt'])
		.index('by_readAt', ['readAt'])
		.index('by_orgId', ['orgId']),
	apiKeys: defineTable({
		orgId: v.id('organizations'),
		name: v.string(),
		prefix: v.string(),
		keyHash: v.string(),
		scopes: v.array(v.string()),
		createdByUserId: v.string(),
		lastUsedAt: v.optional(v.number()),
		revokedAt: v.optional(v.number()),
		createdAt: v.number()
	})
		.index('by_orgId', ['orgId'])
		.index('by_orgId_and_revokedAt', ['orgId', 'revokedAt'])
		.index('by_prefix', ['prefix']),
	// Deprecated compatibility storage. No active webhook delivery pipeline uses these tables.
	webhookEndpoints: defineTable({
		orgId: v.id('organizations'),
		url: v.string(),
		description: v.string(),
		secretHash: v.string(),
		events: v.array(v.string()),
		enabled: v.boolean(),
		createdByUserId: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_orgId', ['orgId'])
		.index('by_orgId_and_enabled', ['orgId', 'enabled']),
	uploadedFiles: defineTable({
		storageId: v.id('_storage'),
		userId: v.string(),
		purpose: v.literal('profile_image'),
		contentType: v.string(),
		size: v.number(),
		createdAt: v.number()
	})
		.index('by_storageId', ['storageId'])
		.index('by_userId', ['userId']),
	uploadRateLimits: defineTable({
		userId: v.string(),
		windowStart: v.number(),
		count: v.number(),
		updatedAt: v.number()
	})
		.index('by_userId_and_windowStart', ['userId', 'windowStart'])
		.index('by_userId', ['userId'])
		.index('by_updatedAt', ['updatedAt']),
	chatRateLimits: defineTable({
		userId: v.string(),
		windowStart: v.number(),
		count: v.number(),
		updatedAt: v.number()
	})
		.index('by_userId_and_windowStart', ['userId', 'windowStart'])
		.index('by_userId', ['userId'])
		.index('by_updatedAt', ['updatedAt']),
	demoCreationLimits: defineTable({
		fingerprint: v.string(),
		windowStart: v.number(),
		count: v.number(),
		updatedAt: v.number()
	})
		.index('by_fingerprint_and_windowStart', ['fingerprint', 'windowStart'])
		.index('by_updatedAt', ['updatedAt']),
	webhookDeliveries: defineTable({
		orgId: v.id('organizations'),
		endpointId: v.id('webhookEndpoints'),
		eventType: v.string(),
		status: v.union(v.literal('pending'), v.literal('delivered'), v.literal('failed')),
		attempts: v.number(),
		lastStatusCode: v.optional(v.number()),
		nextAttemptAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_orgId', ['orgId'])
		.index('by_endpointId', ['endpointId'])
		.index('by_status_and_nextAttemptAt', ['status', 'nextAttemptAt'])
		.index('by_updatedAt', ['updatedAt']),
	auditLogs: defineTable({
		orgId: v.optional(v.id('organizations')),
		actorUserId: v.optional(v.string()),
		action: v.string(),
		target: v.string(),
		metadata: v.record(v.string(), v.string()),
		createdAt: v.number()
	})
		.index('by_orgId_and_createdAt', ['orgId', 'createdAt'])
		.index('by_actorUserId', ['actorUserId'])
		.index('by_createdAt', ['createdAt']),
	usageCounters: defineTable({
		orgId: v.id('organizations'),
		key: v.string(),
		periodStart: v.number(),
		periodEnd: v.number(),
		value: v.number(),
		updatedAt: v.number()
	})
		.index('by_orgId_and_key_and_periodStart', ['orgId', 'key', 'periodStart'])
		.index('by_orgId', ['orgId']),
	accountDeletionJobs: defineTable({
		userId: v.string(),
		status: v.union(v.literal('pending'), v.literal('running')),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_userId', ['userId']),
	waitlistSubscribers: defineTable({
		email: v.string(),
		emailNormalized: v.string(),
		status: v.union(v.literal('subscribed'), v.literal('unsubscribed')),
		source: v.optional(v.string()),
		utmSource: v.optional(v.string()),
		utmMedium: v.optional(v.string()),
		utmCampaign: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
		unsubscribedAt: v.optional(v.number())
	})
		.index('by_emailNormalized', ['emailNormalized'])
		.index('by_status_and_createdAt', ['status', 'createdAt']),
	waitlistRateLimits: defineTable({
		fingerprint: v.string(),
		windowStart: v.number(),
		count: v.number(),
		updatedAt: v.number()
	})
		.index('by_fingerprint_and_windowStart', ['fingerprint', 'windowStart'])
		.index('by_updatedAt', ['updatedAt']),
	feedback: defineTable({
		category: v.union(
			v.literal('bug'),
			v.literal('idea'),
			v.literal('question'),
			v.literal('other')
		),
		message: v.string(),
		// Deprecated. Kept optional so feedback created before its removal remains valid.
		currentPath: v.optional(v.string()),
		userId: v.string(),
		requestId: v.string(),
		status: v.union(v.literal('open'), v.literal('in_progress'), v.literal('closed')),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_userId_and_createdAt', ['userId', 'createdAt'])
		.index('by_status_and_createdAt', ['status', 'createdAt'])
});
