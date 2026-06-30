import { action } from './_generated/server';
import { v } from 'convex/values';
import { authComponent } from './auth';
import { api } from './_generated/api';

const emailResultValidator = v.object({
	status: v.union(v.literal('sent'), v.literal('preview')),
	to: v.string(),
	subject: v.string(),
	html: v.string(),
	providerId: v.optional(v.string())
});

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function renderTransactionalEmail(args: {
	productName: string;
	heading: string;
	body: string;
	actionLabel?: string;
	actionUrl?: string;
}) {
	const action =
		args.actionLabel && args.actionUrl
			? `<p><a href="${escapeHtml(args.actionUrl)}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#f97316;color:#fff;text-decoration:none">${escapeHtml(args.actionLabel)}</a></p>`
			: '';

	return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#171717">
<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#737373">${escapeHtml(args.productName)}</p>
<h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(args.heading)}</h1>
<p>${escapeHtml(args.body)}</p>
${action}
<p style="font-size:12px;color:#737373;margin-top:28px">Sent from your Product Plate transactional email template.</p>
</div>`;
}

async function deliverEmail(args: { to: string; subject: string; html: string }) {
	const resendApiKey = process.env.RESEND_API_KEY;
	const from = process.env.TRANSACTIONAL_EMAIL_FROM ?? 'Product Plate <no-reply@example.com>';

	if (!resendApiKey) {
		const preview: {
			status: 'preview';
			to: string;
			subject: string;
			html: string;
		} = {
			status: 'preview',
			to: args.to,
			subject: args.subject,
			html: args.html
		};
		return preview;
	}

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${resendApiKey}`
		},
		body: JSON.stringify({
			from,
			to: args.to,
			subject: args.subject,
			html: args.html
		})
	});

	if (!response.ok) {
		throw new Error(`Resend rejected the email with status ${response.status}.`);
	}

	const payload = (await response.json()) as { id?: string };
	const result: {
		status: 'sent';
		to: string;
		subject: string;
		html: string;
		providerId?: string;
	} = {
		status: 'sent',
		to: args.to,
		subject: args.subject,
		html: args.html
	};
	if (payload.id) result.providerId = payload.id;

	return result;
}

export const sendTransactional = action({
	args: {
		to: v.string(),
		subject: v.string(),
		heading: v.string(),
		body: v.string(),
		actionLabel: v.optional(v.string()),
		actionUrl: v.optional(v.string()),
		productName: v.optional(v.string())
	},
	returns: emailResultValidator,
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (user.role !== 'admin') {
			throw new Error('Only Better Auth admins can send template transactional emails.');
		}

		const html = renderTransactionalEmail({
			productName: args.productName ?? 'Product Plate',
			heading: args.heading,
			body: args.body,
			actionLabel: args.actionLabel,
			actionUrl: args.actionUrl
		});
		return await deliverEmail({ to: args.to, subject: args.subject, html });
	}
});

export const sendWorkspaceInvite = action({
	args: {
		to: v.string(),
		organizationName: v.string(),
		inviteUrl: v.string()
	},
	returns: emailResultValidator,
	handler: async (ctx, args) => {
		await authComponent.getAuthUser(ctx);
		const overview = await ctx.runQuery(api.organizations.getCurrent, {});
		if (!overview || !['owner', 'admin'].includes(overview.membership.role)) {
			throw new Error('Only workspace owners and admins can send invite emails.');
		}

		const html = renderTransactionalEmail({
			productName: 'Product Plate',
			heading: `Join ${args.organizationName}`,
			body: 'You have been invited to collaborate in a Product Plate workspace.',
			actionLabel: 'Accept invite',
			actionUrl: args.inviteUrl
		});

		return await deliverEmail({
			to: args.to,
			subject: `Join ${args.organizationName}`,
			html
		});
	}
});
