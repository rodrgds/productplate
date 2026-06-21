import { createSvelteKitHandler } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import type { RequestHandler } from './$types';

const authHandler = createSvelteKitHandler();

function isAbortError(error: unknown) {
	return error instanceof Error && error.name === 'AbortError';
}

function handleAuthRequest(handler: RequestHandler): RequestHandler {
	return async (event) => {
		try {
			return await handler(event);
		} catch (error) {
			if (isAbortError(error)) {
				return new Response(null, { status: 204 });
			}
			throw error;
		}
	};
}

export const GET = handleAuthRequest(authHandler.GET);
export const POST = handleAuthRequest(authHandler.POST);
