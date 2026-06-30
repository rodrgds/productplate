import { httpRouter, makeFunctionReference, type FunctionReference } from 'convex/server';
import { httpAction } from './_generated/server';
import { authComponent, createAuth } from './auth';
import type { Id } from './_generated/dataModel';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

type ApiKeyRecord = {
	_id: Id<'apiKeys'>;
	orgId: Id<'organizations'>;
	keyHash: string;
	scopes: string[];
	revokedAt?: number;
};

const getApiKeyByPrefixRef = makeFunctionReference<
	'query',
	{ prefix: string },
	ApiKeyRecord | null
>('developer:getApiKeyByPrefix') as unknown as FunctionReference<
	'query',
	'internal',
	{ prefix: string },
	ApiKeyRecord | null
>;

const touchApiKeyRef = makeFunctionReference<'mutation', { apiKeyId: Id<'apiKeys'> }, null>(
	'developer:touchApiKey'
) as unknown as FunctionReference<'mutation', 'internal', { apiKeyId: Id<'apiKeys'> }, null>;

async function sha256Hex(value: string) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function jsonResponse(data: unknown, init?: ResponseInit) {
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

		const apiKey = await ctx.runQuery(getApiKeyByPrefixRef, {
			prefix: token.slice(0, 16)
		});
		if (!apiKey || apiKey.revokedAt || apiKey.keyHash !== (await sha256Hex(token))) {
			return jsonResponse({ error: 'Invalid API key.' }, { status: 401 });
		}
		if (!apiKey.scopes.includes('events:write') && !apiKey.scopes.includes('*')) {
			return jsonResponse({ error: 'API key is missing the events:write scope.' }, { status: 403 });
		}

		let payload: unknown = {};
		try {
			payload = await request.json();
		} catch {
			return jsonResponse({ error: 'Request body must be JSON.' }, { status: 400 });
		}

		await ctx.runMutation(touchApiKeyRef, { apiKeyId: apiKey._id });

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
