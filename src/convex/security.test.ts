/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from 'convex-test';
import { describe, expect, test, vi } from 'vitest';
import { api, components, internal } from './_generated/api';
import schema from './schema';
import betterAuthSchema from './betterAuth/schema';

const modules = import.meta.glob('./**/!(*.test).ts');
const betterAuthModules = import.meta.glob('./betterAuth/**/*.ts');

function createTestBackend() {
	const t = convexTest(schema, modules);
	t.registerComponent('betterAuth', betterAuthSchema, betterAuthModules);
	return t;
}

async function createAuthenticatedUser(
	t: ReturnType<typeof createTestBackend>,
	args: { id: string; sessionId: string; email: string; role?: string }
) {
	const now = Date.now();
	const user = (await t.mutation(components.betterAuth.adapter.create, {
		input: {
			model: 'user',
			data: {
				name: args.id,
				email: args.email,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
				...(args.role ? { role: args.role } : {})
			}
		}
	})) as { _id: string };
	const session = (await t.mutation(components.betterAuth.adapter.create, {
		input: {
			model: 'session',
			data: {
				expiresAt: now + 60_000,
				token: `token-${args.sessionId}`,
				createdAt: now,
				updatedAt: now,
				userId: user._id
			}
		}
	})) as { _id: string };

	return {
		userId: user._id,
		client: t.withIdentity({
			subject: user._id,
			sessionId: session._id,
			issuer: 'https://test.convex.cloud',
			tokenIdentifier: `https://test.convex.cloud|${user._id}`
		})
	};
}

describe('authorization boundaries', () => {
	test('only workspace administrators receive member emails and invite tokens', async () => {
		const t = createTestBackend();
		const owner = await createAuthenticatedUser(t, {
			id: 'owner',
			sessionId: 'owner-session',
			email: 'owner@example.com'
		});
		const workspace = await owner.client.mutation(api.organizations.ensureCurrent, {
			workspaceName: 'Secure workspace'
		});
		const viewer = await createAuthenticatedUser(t, {
			id: 'viewer',
			sessionId: 'viewer-session',
			email: 'viewer@example.com'
		});

		await t.run(async (ctx) => {
			await ctx.db.insert('organizationMembers', {
				orgId: workspace.organization._id,
				userId: viewer.userId,
				email: 'viewer@example.com',
				role: 'viewer',
				status: 'active',
				joinedAt: Date.now(),
				updatedAt: Date.now()
			});
			await ctx.db.insert('organizationInvites', {
				orgId: workspace.organization._id,
				email: 'invitee@example.com',
				role: 'member',
				invitedByUserId: 'owner',
				token: 'secret-invite-token',
				status: 'pending',
				expiresAt: Date.now() + 60_000,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});

		expect(await viewer.client.query(api.organizations.getMemberAdministration, {})).toBeNull();
		const administration = await owner.client.query(api.organizations.getMemberAdministration, {});
		expect(administration?.members.map((member) => member.email)).toContain('viewer@example.com');
		expect(administration?.invites[0]?.token).toBe('secret-invite-token');
	});

	test('users cannot resolve storage objects owned by another user', async () => {
		const t = createTestBackend();
		const owner = await createAuthenticatedUser(t, {
			id: 'image-owner',
			sessionId: 'image-owner-session',
			email: 'owner@example.com'
		});
		const stranger = await createAuthenticatedUser(t, {
			id: 'stranger',
			sessionId: 'stranger-session',
			email: 'stranger@example.com'
		});
		const storageId = await t.run(async (ctx) => {
			const id = await ctx.storage.store(new Blob(['image'], { type: 'image/png' }));
			await ctx.db.insert('uploadedFiles', {
				storageId: id,
				userId: owner.userId,
				purpose: 'profile_image',
				contentType: 'image/png',
				size: 5,
				createdAt: Date.now()
			});
			return id;
		});

		expect(await stranger.client.query(api.storage.getImageUrl, { storageId })).toBeNull();
		expect(await owner.client.query(api.storage.getImageUrl, { storageId })).toMatch(
			/^https?:\/\//
		);
	});

	test('maintenance continues past the first batch', async () => {
		vi.useFakeTimers();
		const t = createTestBackend();
		const orgId = await t.run(async (ctx) => {
			return await ctx.db.insert('organizations', {
				name: 'Maintenance',
				slug: 'maintenance',
				ownerUserId: 'owner',
				planKey: 'starter',
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		});
		await t.run(async (ctx) => {
			for (let index = 0; index < 125; index += 1) {
				await ctx.db.insert('organizationInvites', {
					orgId,
					email: `expired-${index}@example.com`,
					role: 'member',
					invitedByUserId: 'owner',
					token: `expired-${index}`,
					status: 'pending',
					expiresAt: Date.now() - 1,
					createdAt: Date.now(),
					updatedAt: Date.now()
				});
			}
		});

		await t.mutation(internal.maintenance.expireOldInvites, {});
		await t.finishAllScheduledFunctions(() => vi.runAllTimers());
		const pending = await t.run(async (ctx) => {
			return await ctx.db
				.query('organizationInvites')
				.withIndex('by_orgId_and_status', (q) => q.eq('orgId', orgId).eq('status', 'pending'))
				.take(200);
		});
		expect(pending).toHaveLength(0);
		vi.useRealTimers();
	});
});
