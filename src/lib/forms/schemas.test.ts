import { describe, expect, it } from 'vitest';
import {
	authSignInFormSchema,
	authSignUpFormSchema,
	onboardingFormSchema,
	passwordFormSchema
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
			bio: 'Building a useful hackathon demo.'
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
});
