import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTelemetry, type AnalyticsAdapter } from './telemetry';

describe('product telemetry', () => {
	let adapter: AnalyticsAdapter;

	beforeEach(() => {
		adapter = { capture: vi.fn(), identify: vi.fn(), reset: vi.fn() };
	});

	it('is a no-op without a key', () => {
		const telemetry = createTelemetry({ key: undefined, consent: 'granted', adapter });
		telemetry.capture('landing_cta_clicked', { path: '/', profile: 'prelaunch' });
		expect(adapter.capture).not.toHaveBeenCalled();
	});

	it('requires consent before capture or identity', () => {
		const telemetry = createTelemetry({ key: 'ph_test', consent: 'required', adapter });
		telemetry.capture('signup_completed', { source: 'email' });
		telemetry.identify('internal-user-id');
		expect(adapter.capture).not.toHaveBeenCalled();
		expect(adapter.identify).not.toHaveBeenCalled();

		telemetry.setConsent('granted');
		telemetry.capture('signup_completed', { source: 'email' });
		telemetry.identify('internal-user-id');
		expect(adapter.capture).toHaveBeenCalledWith('signup_completed', { source: 'email' });
		expect(adapter.identify).toHaveBeenCalledWith('internal-user-id');
	});

	it('only forwards the allowlisted property shape', () => {
		const telemetry = createTelemetry({ key: 'ph_test', consent: 'granted', adapter });
		telemetry.capture('first_value_completed', {
			path: '/dashboard',
			plan: 'starter',
			profile: 'solo-saas',
			email: 'private@example.com',
			prompt: 'private prompt'
		} as never);
		expect(adapter.capture).toHaveBeenCalledWith('first_value_completed', {
			path: '/dashboard',
			plan: 'starter',
			profile: 'solo-saas'
		});
	});
});
