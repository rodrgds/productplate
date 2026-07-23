import { describe, expect, it } from 'vitest';
import {
	authSignInFormSchema,
	authSignUpFormSchema,
	accountProfileUpdateSchema,
	feedbackFormSchema,
	onboardingFormSchema,
	passwordFormSchema,
	waitlistFormSchema
} from './schemas';

describe('baseline form schemas', () => {
	it('accepts sign-in without a name', () => {
		const result = authSignInFormSchema.safeParse({
			email: 'ada@example.com',
			password: 'correct-password'
		});

		expect(result.success).toBe(true);
	});

	it('requires a name for sign-up', () => {
		const result = authSignUpFormSchema.safeParse({
			name: '',
			email: 'ada@example.com',
			password: 'correct-password'
		});

		expect(result.success).toBe(false);
	});

	it('accepts a complete onboarding payload', () => {
		const result = onboardingFormSchema.safeParse({
			displayName: 'Ada Lovelace',
			workspaceName: 'Analytical Engine',
			role: 'Prototype builder',
			bio: 'Building a useful product demo.'
		});

		expect(result.success).toBe(true);
	});

	it('accepts an account profile update payload with displayName', () => {
		const result = accountProfileUpdateSchema.safeParse({
			displayName: 'Ada Lovelace',
			bio: 'Building a useful product demo.'
		});

		expect(result.success).toBe(true);
	});

	it('rejects mismatched passwords', () => {
		const result = passwordFormSchema.safeParse({
			currentPassword: 'old-password',
			newPassword: 'new-password',
			confirmPassword: 'different-password',
			revokeOtherSessions: true
		});

		expect(result.success).toBe(false);
	});

	it('normalizes valid waitlist input and rejects bots or oversized attribution', () => {
		const valid = waitlistFormSchema.safeParse({
			email: '  Ada@Example.COM ',
			source: 'landing'
		});
		expect(valid.success).toBe(true);
		if (valid.success) expect(valid.data.email).toBe('Ada@Example.COM');

		expect(
			waitlistFormSchema.safeParse({ email: 'ada@example.com', website: 'https://spam.example' })
				.success
		).toBe(false);
		expect(
			waitlistFormSchema.safeParse({ email: 'ada@example.com', utmCampaign: 'x'.repeat(201) })
				.success
		).toBe(false);
	});

	it('accepts feedback without route context', () => {
		const result = feedbackFormSchema.parse({
			category: 'idea',
			message: 'Add keyboard shortcuts.',
			currentPath: '/settings'
		});

		expect(result).toEqual({
			category: 'idea',
			message: 'Add keyboard shortcuts.'
		});
	});
});
