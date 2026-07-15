import { createClient, type AuthFunctions, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { components, internal } from './_generated/api';
import { type DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import { v } from 'convex/values';
import { betterAuth } from 'better-auth';
import type { BetterAuthOptions } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import authSchema from './betterAuth/schema';
import authConfig from './auth.config';
import { queueUserDeletionForAuth } from './lifecycle';

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

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

async function sendAuthEmail(args: { to: string; subject: string; html: string }) {
	const resendApiKey = process.env.RESEND_API_KEY;
	if (!resendApiKey) {
		throw new Error('Email delivery is unavailable because RESEND_API_KEY is not configured.');
	}

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${resendApiKey}`
		},
		body: JSON.stringify({
			from: process.env.RESET_EMAIL_FROM || 'App <no-reply@yourdomain.com>',
			to: args.to,
			subject: args.subject,
			...(process.env.RESET_EMAIL_REPLY_TO ? { reply_to: process.env.RESET_EMAIL_REPLY_TO } : {}),
			html: args.html
		})
	});

	if (!response.ok) {
		throw new Error(`Email delivery failed with status ${response.status}.`);
	}
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
			useSecureCookies: siteUrl.startsWith('https://')
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
				sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
					await sendAuthEmail({
						to: user.email,
						subject: 'Approve email change',
						html: `<p>Hello ${escapeHtml(user.name ?? 'there')},</p>
<p>We received a request to change your email address to <strong>${escapeHtml(newEmail)}</strong>.</p>
<p>Click the button below to approve this change:</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;border-radius:6px;text-decoration:none">Approve Email Change</a></p>
<p>If the button doesn't work, copy and paste this URL into your browser:</p>
						<p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
<p>If you didn't request this change, please ignore this email or contact support.</p>`
					});
				}
			}
		},
		// Configure simple, non-verified email/password to get started
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			// Send password reset emails via Resend
			sendResetPassword: async ({ user, url }) => {
				await sendAuthEmail({
					to: user.email,
					subject: 'Reset your password',
					html: `<p>Hello ${escapeHtml(user.name ?? 'there')},</p>
<p>We received a request to reset your password. Click the button below to set a new password:</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;border-radius:6px;text-decoration:none">Reset Password</a></p>
<p>If the button doesn't work, copy and paste this URL into your browser:</p>
					<p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>`
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
			admin()
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
