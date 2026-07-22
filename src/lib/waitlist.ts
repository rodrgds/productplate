export const WAITLIST_MAX_BODY_BYTES = 8 * 1024;
export const WAITLIST_RATE_LIMIT = 5;
export const WAITLIST_RATE_WINDOW_MS = 10 * 60 * 1000;
export const WAITLIST_UNSUBSCRIBE_TTL_MS = 180 * 24 * 60 * 60 * 1000;

interface UnsubscribePayload {
	emailNormalized: string;
	expiresAt: number;
}

export function normalizeWaitlistEmail(email: string) {
	return email.trim().toLowerCase();
}

function bytesToHex(bytes: Uint8Array) {
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64Url(bytes: Uint8Array) {
	const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
	return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string) {
	try {
		const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
		return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
	} catch {
		return null;
	}
}

async function hmac(value: string, secret: string) {
	if (secret.length < 16)
		throw new Error('Waitlist signing secrets must be at least 16 characters.');
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
	if (left.length !== right.length) return false;
	let difference = 0;
	for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
	return difference === 0;
}

export async function hashWaitlistFingerprint(identifier: string, secret: string) {
	return bytesToHex(await hmac(identifier || 'unknown', secret));
}

export function getWaitlistNetworkIdentifier(headers: Headers) {
	return (
		headers.get('cf-connecting-ip') ??
		headers.get('x-real-ip') ??
		headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'unknown'
	);
}

export async function createUnsubscribeToken(
	email: string,
	secret: string,
	expiresAt = Date.now() + WAITLIST_UNSUBSCRIBE_TTL_MS
) {
	const payload: UnsubscribePayload = {
		emailNormalized: normalizeWaitlistEmail(email),
		expiresAt
	};
	const encodedPayload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
	const signature = bytesToBase64Url(await hmac(encodedPayload, secret));
	return `${encodedPayload}.${signature}`;
}

export async function readUnsubscribeToken(token: string, secret: string, now = Date.now()) {
	const [encodedPayload, encodedSignature, extra] = token.split('.');
	if (!encodedPayload || !encodedSignature || extra) return null;
	const signature = base64UrlToBytes(encodedSignature);
	const payloadBytes = base64UrlToBytes(encodedPayload);
	if (!signature || !payloadBytes) return null;
	const expectedSignature = await hmac(encodedPayload, secret);
	if (!constantTimeEqual(signature, expectedSignature)) return null;
	try {
		const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as UnsubscribePayload;
		if (
			typeof payload.emailNormalized !== 'string' ||
			typeof payload.expiresAt !== 'number' ||
			payload.expiresAt < now ||
			normalizeWaitlistEmail(payload.emailNormalized) !== payload.emailNormalized
		) {
			return null;
		}
		return payload;
	} catch {
		return null;
	}
}
