import { z } from 'zod/v3';

const authCredentialsSchema = z.object({
	email: z.string().trim().email('Enter a valid email address.').default(''),
	password: z.string().min(8, 'Password must be at least 8 characters.').default('')
});

export const authSignInFormSchema = authCredentialsSchema;

export const authSignUpFormSchema = authCredentialsSchema.extend({
	name: z.string().trim().min(2, 'Name must be at least 2 characters.').default('')
});

export const authFormSchema = authSignUpFormSchema;

export const onboardingFormSchema = z.object({
	displayName: z.string().trim().min(2, 'Add the name you want people to see.').default(''),
	bio: z
		.string()
		.trim()
		.min(10, 'Add a short bio with at least 10 characters.')
		.max(280)
		.default(''),
	role: z.string().trim().min(2, 'Tell us what you are here to build.').default(''),
	workspaceName: z.string().trim().min(2, 'Name your workspace.').default('')
});

export const accountFormSchema = z.object({
	name: z.string().trim().min(2, 'Name must be at least 2 characters.').default(''),
	image: z.string().trim().url('Use a valid image URL.').or(z.literal('')).default(''),
	bio: z
		.string()
		.trim()
		.min(10, 'Add a short bio with at least 10 characters.')
		.max(280, 'Bio must be 280 characters or less.')
		.default('')
});

export const accountProfileUpdateSchema = z.object({
	displayName: z.string().trim().min(2, 'Name must be at least 2 characters.').default(''),
	image: z.string().trim().url('Use a valid image URL.').or(z.literal('')).optional(),
	bio: z
		.string()
		.trim()
		.min(10, 'Add a short bio with at least 10 characters.')
		.max(280, 'Bio must be 280 characters or less.')
		.default('')
});

export const emailFormSchema = z.object({
	newEmail: z.string().trim().email('Enter a valid email address.').default('')
});

export const passwordFormSchema = z
	.object({
		currentPassword: z.string().min(1, 'Enter your current password.').default(''),
		newPassword: z.string().min(8, 'Password must be at least 8 characters.').default(''),
		confirmPassword: z.string().min(8, 'Confirm your new password.').default(''),
		revokeOtherSessions: z.boolean().default(true)
	})
	.refine((value) => value.newPassword === value.confirmPassword, {
		message: 'New passwords do not match.',
		path: ['confirmPassword']
	});

const optionalAttribution = z
	.string()
	.trim()
	.max(200, 'Keep attribution under 200 characters.')
	.optional();

export const waitlistFormSchema = z.object({
	email: z.string().trim().email('Enter a valid email address.').max(320).default(''),
	source: z.string().trim().max(100, 'Keep the source under 100 characters.').optional(),
	utmSource: optionalAttribution,
	utmMedium: optionalAttribution,
	utmCampaign: optionalAttribution,
	website: z.string().max(0, 'Unable to accept this submission.').optional().default('')
});

export const feedbackFormSchema = z.object({
	category: z.enum(['bug', 'idea', 'question', 'other']).default('idea'),
	message: z.string().trim().min(10, 'Add at least 10 characters.').max(2_000).default(''),
	currentPath: z.string().trim().max(500).default('/settings')
});

export type OnboardingForm = z.infer<typeof onboardingFormSchema>;
export type AccountForm = z.infer<typeof accountFormSchema>;
export type AccountProfileUpdate = z.infer<typeof accountProfileUpdateSchema>;
export type AuthSignInForm = z.infer<typeof authSignInFormSchema>;
export type AuthSignUpForm = z.infer<typeof authSignUpFormSchema>;
export type AuthForm = AuthSignInForm & Partial<Pick<AuthSignUpForm, 'name'>>;
export type EmailForm = z.infer<typeof emailFormSchema>;
export type PasswordForm = z.infer<typeof passwordFormSchema>;
export type WaitlistForm = z.infer<typeof waitlistFormSchema>;
export type FeedbackForm = z.infer<typeof feedbackFormSchema>;
