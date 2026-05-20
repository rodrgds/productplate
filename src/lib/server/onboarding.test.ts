import { describe, expect, it } from 'vitest';
import { shouldRedirectToOnboarding } from './onboarding';

describe('shouldRedirectToOnboarding', () => {
	it('redirects app routes when the authenticated user has no profile', () => {
		expect(shouldRedirectToOnboarding('/dashboard', '/onboarding', null)).toBe(true);
		expect(shouldRedirectToOnboarding('/settings', '/onboarding', null)).toBe(true);
	});

	it('allows the onboarding page when the authenticated user has no profile', () => {
		expect(shouldRedirectToOnboarding('/onboarding', '/onboarding', null)).toBe(false);
		expect(shouldRedirectToOnboarding('/app/onboarding', '/app/onboarding', null)).toBe(false);
	});

	it('allows app routes after onboarding creates a profile', () => {
		expect(shouldRedirectToOnboarding('/dashboard', '/onboarding', { _id: 'profile-id' })).toBe(
			false
		);
	});
});
