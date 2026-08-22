import { createSvelteKitHandler } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import type { RequestHandler } from './$types';

const authHandler = createSvelteKitHandler();

function handleAuthRequest(handler: RequestHandler): RequestHandler {
	return async (event) => {
		try {
			return await handler(event);
		} catch (error) {
			// Aborted auth probes are routine; surface every other failure.
			if (error instanceof Error && error.name === 'AbortError') {
				return new Response(null, { status: 204 });
			}
			throw error;
		}
	};
}

export const GET = handleAuthRequest(authHandler.GET);
export const POST = handleAuthRequest(authHandler.POST);
