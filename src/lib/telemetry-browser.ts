import { createTelemetry, type AnalyticsAdapter, type AnalyticsConsent } from './telemetry';

export const ANALYTICS_CONSENT_STORAGE_KEY = 'product-analytics-consent';

function postHogAdapter(key: string, host?: string): AnalyticsAdapter {
	let clientPromise: Promise<typeof import('posthog-js').default> | undefined;
	const client = () => {
		clientPromise ??= import('posthog-js').then(({ default: posthog }) => {
			posthog.init(key, {
				api_host: host,
				capture_pageview: false,
				capture_pageleave: true,
				person_profiles: 'identified_only',
				persistence: 'localStorage'
			});
			return posthog;
		});
		return clientPromise;
	};
	return {
		capture(event, properties) {
			void client().then((posthog) => posthog.capture(event, properties));
		},
		identify(internalUserId) {
			void client().then((posthog) => posthog.identify(internalUserId));
		},
		reset() {
			void client().then((posthog) => posthog.reset());
		}
	};
}

export function readAnalyticsConsent(): AnalyticsConsent {
	const stored = localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
	return stored === 'granted' || stored === 'denied' ? stored : 'required';
}

export function createBrowserTelemetry(key?: string, host?: string) {
	const telemetry = createTelemetry({
		key,
		consent: readAnalyticsConsent(),
		adapter: postHogAdapter(key ?? '', host)
	});
	return {
		...telemetry,
		setConsent(consent: AnalyticsConsent) {
			localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
			telemetry.setConsent(consent);
		}
	};
}

let sharedTelemetry: ReturnType<typeof createBrowserTelemetry> | undefined;

export function getBrowserTelemetry(key?: string, host?: string) {
	sharedTelemetry ??= createBrowserTelemetry(key, host);
	return sharedTelemetry;
}
