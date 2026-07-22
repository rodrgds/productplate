export const profiles = ['prelaunch', 'solo-saas', 'team-saas', 'ai-saas'] as const;
export const themes = ['product-plate', 'claude', 'zen', 'neutral'] as const;

export type ProductProfile = (typeof profiles)[number];
export type ProductTheme = (typeof themes)[number];

export interface ProductPlateManifest {
	schemaVersion: 1;
	generatorVersion: string;
	templateVersion: string;
	profile: ProductProfile;
	product: {
		name: string;
		slug: string;
		description: string;
		productionUrl: string | null;
	};
	theme: ProductTheme;
	capabilities: Array<string>;
	providers: {
		data: 'convex';
		auth: 'better-auth' | 'none';
		billing: 'autumn' | 'none';
		email: 'resend' | 'none';
		analytics: 'posthog';
		errors: 'sentry';
		hosting: 'cloudflare-pages';
	};
}

export interface ProfileDefinition {
	id: ProductProfile;
	capabilities: Array<string>;
	removePaths: Array<string>;
	removeDependencies: Array<string>;
	providers: ProductPlateManifest['providers'];
}

export interface GenerateProjectOptions {
	destination: string;
	templatePath?: string;
	profile: ProductProfile;
	name: string;
	description: string;
	theme: ProductTheme;
	templateVersion?: string;
	generatorVersion?: string;
	productionUrl?: string | null;
	install: boolean;
	git: boolean;
}

export interface DoctorCheck {
	id: string;
	label: string;
	status: 'pass' | 'warning' | 'failure';
	message: string;
}

export interface DoctorResult {
	schemaVersion: 1;
	profile: ProductProfile;
	strict: boolean;
	live: boolean;
	checks: Array<DoctorCheck>;
	summary: {
		pass: number;
		warning: number;
		failure: number;
	};
}
