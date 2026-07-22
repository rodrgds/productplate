import { env } from '$env/dynamic/public';
import { handleErrorWithSentry, init } from '@sentry/sveltekit';
import { scrubSentryEvent } from '$lib/sentry';

init({
	dsn: env.PUBLIC_SENTRY_DSN,
	enabled: Boolean(env.PUBLIC_SENTRY_DSN),
	sendDefaultPii: false,
	beforeSend: (event) => scrubSentryEvent(event)
});

export const handleError = handleErrorWithSentry();
