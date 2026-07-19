import { describe, expect, it } from 'vitest';
import { getOAuthErrorMessage } from './auth-errors.js';

describe('getOAuthErrorMessage', () => {
	it('explains account-linking failures', () => {
		expect(getOAuthErrorMessage('account_not_linked')).toBe(
			'That Google account could not be linked. Sign in with email first, then try Google again.'
		);
	});

	it('uses a safe fallback for unknown provider errors', () => {
		expect(getOAuthErrorMessage('provider_failure')).toBe('Google sign-in failed. Try again.');
	});

	it('returns null when there is no OAuth error', () => {
		expect(getOAuthErrorMessage(null)).toBeNull();
	});
});
