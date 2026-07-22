export type ProductEmailTemplate =
	| 'verify-email'
	| 'password-reset'
	| 'email-change-approval'
	| 'welcome'
	| 'workspace-invite'
	| 'waitlist-confirmation'
	| 'subscription-status';

interface RenderProductEmailOptions {
	template: ProductEmailTemplate;
	productName: string;
	recipientName?: string;
	actionUrl?: string;
	workspaceName?: string;
	status?: string;
}

interface DeliverProductEmailOptions {
	to: string;
	subject: string;
	html: string;
	replyTo?: string;
}

interface ProductEmailDeliveryConfig {
	apiKey?: string;
	from: string;
	fetcher?: typeof fetch;
}

const templateCopy: Record<
	ProductEmailTemplate,
	{ heading: string; body: (options: RenderProductEmailOptions) => string; action: string }
> = {
	'verify-email': {
		heading: 'Verify your email',
		body: () => 'Confirm this address to finish setting up your account.',
		action: 'Verify email'
	},
	'password-reset': {
		heading: 'Reset your password',
		body: () =>
			'Use this secure link to choose a new password. Ignore this message if you did not request it.',
		action: 'Reset password'
	},
	'email-change-approval': {
		heading: 'Approve your email change',
		body: () => 'Confirm the requested change to your account email address.',
		action: 'Approve change'
	},
	welcome: {
		heading: 'Welcome',
		body: (options) => `Your ${options.productName} account is ready.`,
		action: 'Open your account'
	},
	'workspace-invite': {
		heading: 'You have been invited',
		body: (options) =>
			options.workspaceName
				? `Join ${options.workspaceName} and start working with the team.`
				: 'Join the workspace and start working with the team.',
		action: 'Accept invite'
	},
	'waitlist-confirmation': {
		heading: 'You are on the list',
		body: (options) => `We will send useful launch updates for ${options.productName}.`,
		action: 'Unsubscribe'
	},
	'subscription-status': {
		heading: 'Subscription update',
		body: (options) =>
			options.status
				? `Your subscription status is now ${options.status}.`
				: 'Your subscription status changed.',
		action: 'Review billing'
	}
};

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

export function renderProductEmail(options: RenderProductEmailOptions) {
	const copy = templateCopy[options.template];
	const greeting = options.recipientName ? `Hello ${escapeHtml(options.recipientName)},` : 'Hello,';
	const action = options.actionUrl
		? `<p><a href="${escapeHtml(options.actionUrl)}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#171717;color:#fff;text-decoration:none">${escapeHtml(copy.action)}</a></p>
<p style="font-size:12px;color:#737373;word-break:break-all">${escapeHtml(options.actionUrl)}</p>`
		: '';
	return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#171717">
<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#737373">${escapeHtml(options.productName)}</p>
<h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(copy.heading)}</h1>
<p>${greeting}</p>
<p>${escapeHtml(copy.body(options))}</p>
${action}
<p style="font-size:12px;color:#737373;margin-top:28px">This message was sent by ${escapeHtml(options.productName)}.</p>
</div>`;
}

export async function deliverProductEmail(
	options: DeliverProductEmailOptions,
	config: ProductEmailDeliveryConfig
) {
	if (!config.apiKey) {
		return { status: 'preview' as const, ...options };
	}
	const response = await (config.fetcher ?? fetch)('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.apiKey}`
		},
		body: JSON.stringify({
			from: config.from,
			to: options.to,
			subject: options.subject,
			html: options.html,
			...(options.replyTo ? { reply_to: options.replyTo } : {})
		})
	});
	if (!response.ok) throw new Error(`Resend rejected the email with status ${response.status}.`);
	const payload = (await response.json()) as { id?: string };
	return { status: 'sent' as const, ...options, providerId: payload.id };
}
