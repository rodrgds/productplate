import { describe, expect, it } from 'vitest';
import {
	createUnsubscribeToken,
	hashWaitlistFingerprint,
	normalizeWaitlistEmail,
	readUnsubscribeToken
} from './waitlist';

describe('waitlist security helpers', () => {
	const secret = 'server-secret-with-enough-entropy';

	it('normalizes email addresses for idempotent storage', () => {
		expect(normalizeWaitlistEmail('  Ada@Example.COM ')).toBe('ada@example.com');
	});

	it('hashes the requester identifier without exposing it', async () => {
		const fingerprint = await hashWaitlistFingerprint('203.0.113.42', secret);
		expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
		expect(fingerprint).not.toContain('203.0.113.42');
		expect(
			await hashWaitlistFingerprint('203.0.113.42', 'different-secure-server-secret')
		).not.toBe(fingerprint);
	});

	it('signs, validates, expires, and rejects modified unsubscribe tokens', async () => {
		const now = 2_000_000;
		const token = await createUnsubscribeToken('Ada@Example.COM', secret, now + 60_000);
		expect(await readUnsubscribeToken(token, secret, now)).toEqual({
			emailNormalized: 'ada@example.com',
			expiresAt: now + 60_000
		});
		expect(await readUnsubscribeToken(`${token}x`, secret, now)).toBeNull();
		expect(await readUnsubscribeToken(token, secret, now + 60_001)).toBeNull();
	});
});
