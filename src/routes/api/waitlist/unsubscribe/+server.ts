import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { APP_NAME } from '$lib/constants';
import { readUnsubscribeToken } from '$lib/waitlist';
import { api } from '$convex/_generated/api.js';
import { ConvexHttpClient } from 'convex/browser';
import { error, type RequestHandler } from '@sveltejs/kit';

function page(title: string, message: string) {
	return new Response(
		`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title></head><body style="font-family:system-ui;max-width:40rem;margin:5rem auto;padding:0 1.5rem"><h1>${title}</h1><p>${message}</p><p><a href="/">Return to ${APP_NAME}</a></p></body></html>`,
		{ headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }
	);
}

export const GET: RequestHandler = async ({ url }) => {
	const secret = env.WAITLIST_EXPORT_SECRET;
	const convexUrl = publicEnv.PUBLIC_CONVEX_URL;
	if (!secret || !convexUrl) error(503, 'Waitlist setup is incomplete.');
	const token = url.searchParams.get('token');
	if (!token) return page('Invalid link', 'This unsubscribe link is incomplete.');
	const payload = await readUnsubscribeToken(token, secret);
	if (!payload) return page('Expired link', 'This unsubscribe link is invalid or has expired.');
	const client = new ConvexHttpClient(convexUrl);
	await client.mutation(api.waitlist.unsubscribe, {
		emailNormalized: payload.emailNormalized,
		secret,
		now: Date.now()
	});
	return page('Unsubscribed', 'You will no longer receive waitlist email.');
};
