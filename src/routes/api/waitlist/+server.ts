import { env } from '$env/dynamic/private';
import { z } from 'zod/v3';
import { env as publicEnv } from '$env/dynamic/public';
import { APP_NAME } from '$lib/constants';
import { deliverProductEmail, renderProductEmail } from '$lib/email/service';
import { waitlistFormSchema } from '$lib/forms/schemas';
import {
	createUnsubscribeToken,
	getWaitlistNetworkIdentifier,
	hashWaitlistFingerprint,
	WAITLIST_MAX_BODY_BYTES
} from '$lib/waitlist';
import { api } from '$convex/_generated/api.js';
import { ConvexHttpClient } from 'convex/browser';
import { json, type RequestHandler } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const acceptedResponse = { accepted: true } as const;

// The honeypot field must look filled for the submission to be dropped as spam.
const honeypotSchema = z.object({ website: z.string() });

function parseFormBody(body: string) {
	const form = new URLSearchParams(body);
	return {
		email: form.get('email'),
		source: form.get('source') ?? undefined,
		utmSource: form.get('utmSource') ?? undefined,
		utmMedium: form.get('utmMedium') ?? undefined,
		utmCampaign: form.get('utmCampaign') ?? undefined,
		website: form.get('website') ?? ''
	};
}

export const POST: RequestHandler = async ({ request, url }) => {
	const declaredLength = Number(request.headers.get('content-length') ?? 0);
	if (declaredLength > WAITLIST_MAX_BODY_BYTES) {
		return json({ accepted: false, error: 'Request body is too large.' }, { status: 413 });
	}
	const body = await request.text();
	if (new TextEncoder().encode(body).byteLength > WAITLIST_MAX_BODY_BYTES) {
		return json({ accepted: false, error: 'Request body is too large.' }, { status: 413 });
	}

	let parsedBody: unknown;
	try {
		if (request.headers.get('content-type')?.includes('application/json')) {
			parsedBody = JSON.parse(body);
		} else {
			parsedBody = parseFormBody(body);
		}
	} catch {
		return json({ accepted: false, error: 'Use a valid JSON or form body.' }, { status: 400 });
	}
	const honeypot = honeypotSchema.safeParse(parsedBody);
	if (honeypot.success && honeypot.data.website.trim()) {
		return json(acceptedResponse, { status: 202 });
	}
	const parsedSubmission = waitlistFormSchema.safeParse(parsedBody);
	if (!parsedSubmission.success) {
		return json({ accepted: false, error: 'Check the form and try again.' }, { status: 400 });
	}
	const submission = await superValidate(parsedSubmission.data, zod(waitlistFormSchema));
	if (!submission.valid) {
		return json({ accepted: false, error: 'Check the form and try again.' }, { status: 400 });
	}

	const convexUrl = publicEnv.PUBLIC_CONVEX_URL;
	const fingerprintSecret = env.WAITLIST_FINGERPRINT_SECRET;
	const exportSecret = env.WAITLIST_EXPORT_SECRET;
	if (!convexUrl || !fingerprintSecret || !exportSecret) {
		return json({ accepted: false, error: 'Waitlist setup is incomplete.' }, { status: 503 });
	}
	const fingerprint = await hashWaitlistFingerprint(
		getWaitlistNetworkIdentifier(request.headers),
		fingerprintSecret
	);
	const client = new ConvexHttpClient(convexUrl);
	try {
		const result = await client.mutation(api.waitlist.subscribe, {
			email: submission.data.email,
			fingerprint,
			source: submission.data.source,
			utmSource: submission.data.utmSource,
			utmMedium: submission.data.utmMedium,
			utmCampaign: submission.data.utmCampaign,
			now: Date.now()
		});
		if (result.shouldSendEmail && env.RESEND_API_KEY) {
			const token = await createUnsubscribeToken(submission.data.email, exportSecret);
			const unsubscribeUrl = `${url.origin}/api/waitlist/unsubscribe?token=${encodeURIComponent(token)}`;
			await deliverProductEmail(
				{
					to: submission.data.email,
					subject: `You are on the ${APP_NAME} waitlist`,
					html: renderProductEmail({
						template: 'waitlist-confirmation',
						productName: APP_NAME,
						actionUrl: unsubscribeUrl
					})
				},
				{
					apiKey: env.RESEND_API_KEY,
					from: env.TRANSACTIONAL_EMAIL_FROM ?? `${APP_NAME} <no-reply@example.com>`
				}
			);
		}
		return json(acceptedResponse, { status: 202 });
	} catch (error) {
		if (error instanceof Error && error.message.includes('WAITLIST_RATE_LIMITED')) {
			return json({ accepted: false, error: 'Try again in a few minutes.' }, { status: 429 });
		}
		console.error('waitlist.subscription_failed', {
			error: error instanceof Error ? error.message : 'unknown'
		});
		return json({ accepted: false, error: 'Unable to join right now.' }, { status: 503 });
	}
};
