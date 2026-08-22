import { httpRouter } from 'convex/server';
import { z } from 'zod/v3';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import { authComponent, createAuth } from './auth';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

async function sha256Hex(value: string) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.null(),
		z.array(jsonValueSchema),
		z.record(jsonValueSchema)
	])
);

const jsonObjectSchema = z.record(jsonValueSchema);

// JSON.stringify accepts any JSON-serializable value; this endpoint echoes known fields.
function jsonResponse(data: JsonValue, init?: ResponseInit) {
	return new Response(JSON.stringify(data, null, 2), {
		...init,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			...init?.headers
		}
	});
}

http.route({
	path: '/api/template-event',
	method: 'POST',
	handler: httpAction(async (ctx, request) => {
		const authorization = request.headers.get('authorization') ?? '';
		const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';
		if (!token) {
			return jsonResponse({ error: 'Missing bearer token.' }, { status: 401 });
		}

		const apiKey = await ctx.runQuery(internal.developer.getApiKeyByPrefix, {
			prefix: token.slice(0, 16)
		});
		if (!apiKey || apiKey.revokedAt || apiKey.keyHash !== (await sha256Hex(token))) {
			return jsonResponse({ error: 'Invalid API key.' }, { status: 401 });
		}
		if (!apiKey.scopes.includes('events:write') && !apiKey.scopes.includes('*')) {
			return jsonResponse({ error: 'API key is missing the events:write scope.' }, { status: 403 });
		}

		let payload: { [key: string]: JsonValue } = {};
		try {
			const parsed = jsonObjectSchema.safeParse(await request.json());
			if (parsed.success) payload = parsed.data;
		} catch {
			return jsonResponse({ error: 'Request body must be JSON.' }, { status: 400 });
		}

		await ctx.runMutation(internal.developer.touchApiKey, { apiKeyId: apiKey._id });

		return jsonResponse({
			ok: true,
			event: 'template.event.created',
			workspaceId: apiKey.orgId,
			receivedAt: new Date().toISOString(),
			payload
		});
	})
});

export default http;
