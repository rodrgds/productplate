import { error } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { createDemoAccountCredentials } from '$lib/demo-account.js';
import type { RequestHandler } from './$types';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { api } from '$convex/_generated/api.js';
import { ConvexHttpClient } from 'convex/browser';

const authJsonHeaders = {
	accept: 'application/json',
	'content-type': 'application/json'
};

function getSetCookieHeaders(headers: Headers) {
	const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
	const values = getSetCookie?.call(headers);
	if (values?.length) return values;

	const header = headers.get('set-cookie');
	return header ? [header] : [];
}

async function readAuthFailure(response: Response) {
	const text = await response.text();
	if (!text) return `HTTP ${response.status}`;

	try {
		const data = JSON.parse(text) as { message?: string; error?: string };
		return data.message ?? data.error ?? text;
	} catch {
		return text;
	}
}

async function postAuth(fetch: typeof globalThis.fetch, url: URL, path: string, body: object) {
	return await fetch(new URL(`/api/auth/${path}`, url), {
		method: 'POST',
		headers: {
			...authJsonHeaders,
			origin: url.origin,
			referer: new URL(resolve('/auth/demo'), url).toString()
		},
		body: JSON.stringify(body),
		redirect: 'manual'
	});
}

function isSuccessfulAuthResponse(response: Response) {
	return response.status >= 200 && response.status < 400;
}

function redirectWithAuthCookies(response: Response) {
	const headers = new Headers({
		location: resolve('/dashboard')
	});

	for (const cookie of getSetCookieHeaders(response.headers)) {
		headers.append('set-cookie', cookie);
	}

	return new Response(null, {
		status: 303,
		headers
	});
}

async function sha256(value: string) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const POST: RequestHandler = async ({ fetch, getClientAddress, request, url }) => {
	if (privateEnv.DEMO_ENABLED === 'false') error(404, 'The public demo is disabled.');
	if (!privateEnv.BETTER_AUTH_SECRET || !publicEnv.PUBLIC_CONVEX_URL) {
		error(503, 'Demo account creation is not configured.');
	}

	let clientAddress = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-real-ip');
	if (!clientAddress) {
		try {
			clientAddress = getClientAddress();
		} catch {
			clientAddress = 'unknown';
		}
	}
	const fingerprint = await sha256(`${privateEnv.BETTER_AUTH_SECRET}:${clientAddress}`);
	const convex = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);
	try {
		await convex.mutation(api.demo.reserveCreation, {
			secret: privateEnv.BETTER_AUTH_SECRET,
			fingerprint
		});
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Demo creation is unavailable.';
		error(message.includes('limit') ? 429 : 503, message);
	}

	const demoAccount = createDemoAccountCredentials();
	const signInBody = {
		email: demoAccount.email,
		password: demoAccount.password,
		rememberMe: true
	};

	const signUp = await postAuth(fetch, url, 'sign-up/email', {
		name: demoAccount.name,
		email: demoAccount.email,
		password: demoAccount.password
	});

	if (!isSuccessfulAuthResponse(signUp)) {
		error(502, `Demo account setup failed: ${await readAuthFailure(signUp)}`);
	}

	if (getSetCookieHeaders(signUp.headers).length > 0) {
		return redirectWithAuthCookies(signUp);
	}

	const signIn = await postAuth(fetch, url, 'sign-in/email', signInBody);

	if (!isSuccessfulAuthResponse(signIn)) {
		error(502, `Demo account sign-in failed: ${await readAuthFailure(signIn)}`);
	}

	const cookies = getSetCookieHeaders(signIn.headers);
	if (cookies.length === 0) {
		error(502, 'Demo account sign-in did not return a session cookie.');
	}

	return redirectWithAuthCookies(signIn);
};
