import { createClient, type AuthFunctions, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { components, internal } from './_generated/api';
import { type DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import { v } from 'convex/values';
import { betterAuth } from 'better-auth';
import type { BetterAuthOptions } from 'better-auth/minimal';
import { admin, magicLink } from 'better-auth/plugins';
import authSchema from './betterAuth/schema';
import authConfig from './auth.config';
import { queueUserDeletionForAuth } from './lifecycle';
import {
	deliverProductEmail,
	renderProductEmail,
	type ProductEmailTemplate
} from '../lib/email/service';

function getRuntimeEnv(key: string) {
	return typeof process === 'undefined' ? undefined : process.env[key];
}

function trimTrailingSlash(value: string) {
	return value.endsWith('/') ? value.slice(0, -1) : value;
}

function getSiteUrl() {
	return trimTrailingSlash(
		getRuntimeEnv('SITE_URL') ?? getRuntimeEnv('BETTER_AUTH_URL') ?? 'http://localhost:5173'
	);
}

function getTrustedOrigins(siteUrl: string) {
	return Array.from(
		new Set(
			[
				'http://localhost:5173',
				'http://localhost:4173',
				'http://localhost:4174',
				'http://127.0.0.1:5173',
				'http://127.0.0.1:4173',
				'http://127.0.0.1:4174',
				'https://productplate.pages.dev',
				getRuntimeEnv('CF_PAGES_URL'),
				getRuntimeEnv('BETTER_AUTH_URL'),
				siteUrl
			]
				.filter(Boolean)
				.map((origin) => trimTrailingSlash(origin as string))
		)
	);
}

const authUserValidator = v.object({
	_id: v.string(),
	_creationTime: v.number(),
	name: v.string(),
	email: v.string(),
	emailVerified: v.boolean(),
	image: v.optional(v.union(v.null(), v.string())),
	createdAt: v.number(),
	updatedAt: v.number(),
	userId: v.optional(v.union(v.null(), v.string())),
	role: v.optional(v.union(v.null(), v.string())),
	banned: v.optional(v.union(v.null(), v.boolean())),
	banReason: v.optional(v.union(v.null(), v.string())),
	banExpires: v.optional(v.union(v.null(), v.number()))
});

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel, typeof authSchema>(components.betterAuth, {
	local: {
		schema: authSchema
	},
	authFunctions,
	triggers: {
		user: {
			onDelete: async (ctx, user) => {
				await queueUserDeletionForAuth(ctx, user._id);
			}
		}
	}
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

async function sendAuthEmail(args: {
	to: string;
	subject: string;
	template: ProductEmailTemplate;
	actionUrl?: string;
	recipientName?: string;
}) {
	const productName = getRuntimeEnv('PRODUCT_NAME') ?? 'Product Plate';
	return await deliverProductEmail(
		{
			to: args.to,
			subject: args.subject,
			replyTo: getRuntimeEnv('RESET_EMAIL_REPLY_TO'),
			html: renderProductEmail({
				template: args.template,
				productName,
				actionUrl: args.actionUrl,
				recipientName: args.recipientName
			})
		},
		{
			apiKey: getRuntimeEnv('RESEND_API_KEY'),
			from:
				getRuntimeEnv('TRANSACTIONAL_EMAIL_FROM') ??
				getRuntimeEnv('RESET_EMAIL_FROM') ??
				`${productName} <no-reply@example.com>`
		}
	);
}

export const createAuthOptions = (
	ctx: GenericCtx<DataModel>,
	{ optionsOnly } = { optionsOnly: false }
) => {
	// Read runtime environment variables lazily. Cloudflare installs its env
	// bindings after module imports, so reading SITE_URL at module scope makes
	// the server expect localhost's insecure cookie in production.
	const siteUrl = getSiteUrl();

	return {
		// disable logging when createAuth is called just to generate options.
		// this is not required, but there's a lot of noise in logs without it.
		logger: {
			disabled: optionsOnly
		},
		baseURL: siteUrl,
		trustedOrigins: getTrustedOrigins(siteUrl),
		advanced: {
			useSecureCookies: siteUrl.startsWith('https://'),
			ipAddress: {
				ipAddressHeaders: ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for']
			}
		},
		rateLimit: {
			enabled: true,
			window: 60,
			max: 30,
			storage: 'memory',
			customRules: {
				'/sign-in/email': { window: 60, max: 5 },
				'/sign-up/email': { window: 60, max: 5 },
				'/request-password-reset': { window: 300, max: 3 },
				'/send-verification-email': { window: 300, max: 3 }
			}
		},
		account: {
			accountLinking: {
				enabled: true,
				disableImplicitLinking: true,
				trustedProviders: ['google']
			}
		},
		database: authComponent.adapter(ctx),
		// User configuration
		user: {
			deleteUser: { enabled: true },
			changeEmail: {
				enabled: true,
				sendChangeEmailConfirmation: async ({ user, url }) => {
					await sendAuthEmail({
						to: user.email,
						subject: 'Approve email change',
						template: 'email-change-approval',
						actionUrl: url,
						recipientName: user.name
					});
				}
			}
		},
		emailVerification: {
			sendOnSignUp: true,
			sendOnSignIn: true,
			autoSignInAfterVerification: true,
			sendVerificationEmail: async ({ user, url }) => {
				await sendAuthEmail({
					to: user.email,
					subject: 'Verify your email',
					template: 'verify-email',
					actionUrl: url,
					recipientName: user.name
				});
			},
			afterEmailVerification: async (user) => {
				await sendAuthEmail({
					to: user.email,
					subject: 'Welcome',
					template: 'welcome',
					actionUrl: `${siteUrl}/onboarding`,
					recipientName: user.name
				});
			}
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: getRuntimeEnv('AUTH_REQUIRE_EMAIL_VERIFICATION') === 'true',
			revokeSessionsOnPasswordReset: true,
			sendResetPassword: async ({ user, url }) => {
				await sendAuthEmail({
					to: user.email,
					subject: 'Reset your password',
					template: 'password-reset',
					actionUrl: url,
					recipientName: user.name
				});
			}
		},
		socialProviders: {
			...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
				? {
						google: {
							clientId: process.env.GOOGLE_CLIENT_ID,
							clientSecret: process.env.GOOGLE_CLIENT_SECRET
						}
					}
				: {})
		},
		plugins: [
			// The Convex plugin is required for Convex compatibility
			convex({ authConfig }),
			// Admin plugin for roles/impersonation/banning APIs
			admin(),
			...(getRuntimeEnv('AUTH_MAGIC_LINK_ENABLED') === 'true'
				? [
						magicLink({
							disableSignUp: true,
							rateLimit: { window: 60, max: 3 },
							sendMagicLink: async ({ email, url }) => {
								await sendAuthEmail({
									to: email,
									subject: 'Your sign-in link',
									template: 'verify-email',
									actionUrl: url
								});
							}
						})
					]
				: [])
		]
	} satisfies BetterAuthOptions;
};

export const createAuth = (
	ctx: GenericCtx<DataModel>,
	options: { optionsOnly?: boolean } = { optionsOnly: false }
) => betterAuth(createAuthOptions(ctx, { optionsOnly: options.optionsOnly ?? false }));

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
	args: {},
	returns: v.union(authUserValidator, v.null()),
	handler: async (ctx) => {
		return (await authComponent.safeGetAuthUser(ctx)) ?? null;
	}
});
