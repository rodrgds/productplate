/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from 'convex-test';
import { describe, expect, test } from 'vitest';
import { api } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

describe('waitlist subscriptions', () => {
	test('normalizes addresses and makes repeated submissions idempotent', async () => {
		const convex = convexTest(schema, modules);
		const first = await convex.mutation(api.waitlist.subscribe, {
			email: ' Ada@Example.COM ',
			fingerprint: 'fingerprint-a',
			source: 'landing',
			now: 1_000
		});
		const repeated = await convex.mutation(api.waitlist.subscribe, {
			email: 'ada@example.com',
			fingerprint: 'fingerprint-a',
			source: 'footer',
			now: 2_000
		});

		expect(first.accepted).toBe(true);
		expect(repeated.accepted).toBe(true);
		const subscribers = await convex.run(async (ctx) =>
			ctx.db.query('waitlistSubscribers').withIndex('by_emailNormalized').take(10)
		);
		expect(subscribers).toHaveLength(1);
		expect(subscribers[0]).toMatchObject({
			emailNormalized: 'ada@example.com',
			status: 'subscribed',
			source: 'landing'
		});
	});

	test('enforces a bounded fingerprint rate limit', async () => {
		const convex = convexTest(schema, modules);
		for (let index = 0; index < 5; index += 1) {
			await convex.mutation(api.waitlist.subscribe, {
				email: `person-${index}@example.com`,
				fingerprint: 'fingerprint-b',
				now: 10_000 + index
			});
		}
		await expect(
			convex.mutation(api.waitlist.subscribe, {
				email: 'blocked@example.com',
				fingerprint: 'fingerprint-b',
				now: 10_010
			})
		).rejects.toThrow('WAITLIST_RATE_LIMITED');
	});
});
