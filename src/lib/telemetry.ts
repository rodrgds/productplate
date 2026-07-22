export type ProductEvent =
	| 'landing_cta_clicked'
	| 'waitlist_subscribed'
	| 'signup_completed'
	| 'onboarding_completed'
	| 'checkout_started'
	| 'checkout_completed'
	| 'first_value_completed';

export interface ProductEventProperties {
	path?: string;
	source?: string;
	plan?: string;
	profile?: 'prelaunch' | 'solo-saas' | 'team-saas' | 'ai-saas';
}

export type AnalyticsConsent = 'required' | 'granted' | 'denied';

export interface AnalyticsAdapter {
	capture(event: ProductEvent, properties: ProductEventProperties): void;
	identify(internalUserId: string): void;
	reset(): void;
}

interface CreateTelemetryOptions {
	key?: string;
	consent?: AnalyticsConsent;
	adapter: AnalyticsAdapter;
}

function safeProperties(properties: ProductEventProperties) {
	const safe: ProductEventProperties = {};
	if (typeof properties.path === 'string') safe.path = properties.path.slice(0, 500);
	if (typeof properties.source === 'string') safe.source = properties.source.slice(0, 100);
	if (typeof properties.plan === 'string') safe.plan = properties.plan.slice(0, 100);
	if (
		properties.profile === 'prelaunch' ||
		properties.profile === 'solo-saas' ||
		properties.profile === 'team-saas' ||
		properties.profile === 'ai-saas'
	) {
		safe.profile = properties.profile;
	}
	return safe;
}

export function createTelemetry(options: CreateTelemetryOptions) {
	let consent: AnalyticsConsent = options.consent ?? 'required';
	return {
		capture(event: ProductEvent, properties: ProductEventProperties = {}) {
			if (!options.key || consent !== 'granted') return;
			options.adapter.capture(event, safeProperties(properties));
		},
		identify(internalUserId: string) {
			if (!options.key || consent !== 'granted' || !internalUserId.trim()) return;
			options.adapter.identify(internalUserId);
		},
		reset() {
			if (!options.key || consent !== 'granted') return;
			options.adapter.reset();
		},
		setConsent(nextConsent: AnalyticsConsent) {
			consent = nextConsent;
		},
		getConsent() {
			return consent;
		}
	};
}
