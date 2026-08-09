import { z } from 'zod';

export const profiles = ['prelaunch', 'solo-saas', 'team-saas', 'ai-saas'] as const;
export const themes = ['product-plate', 'claude', 'zen', 'neutral'] as const;
export const SEMANTIC_VERSION_PATTERN =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export const semanticVersionSchema = z
	.string()
	.regex(SEMANTIC_VERSION_PATTERN, 'Expected a semantic version.');
export const productProfileSchema = z.enum(profiles);
export const productThemeSchema = z.enum(themes);
export const productNameSchema = z
	.string()
	.trim()
	.min(1, 'Product name cannot be empty.')
	.refine((value) => !/[\r\n\u2028\u2029]/u.test(value), 'Product name must be a single line.')
	.refine(
		(value) =>
			!Array.from(value).some((character) => {
				const code = character.charCodeAt(0);
				return code <= 31 || (code >= 127 && code <= 159);
			}),
		'Product name cannot contain control characters.'
	);

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

export const productPlateManifestSchema: z.ZodType<ProductPlateManifest> = z
	.object({
		schemaVersion: z.literal(1),
		generatorVersion: semanticVersionSchema,
		templateVersion: semanticVersionSchema,
		profile: productProfileSchema,
		product: z
			.object({
				name: productNameSchema,
				slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
				description: z.string().trim().min(1),
				productionUrl: z.string().url().nullable()
			})
			.strict(),
		theme: productThemeSchema,
		capabilities: z.array(z.string().min(1)),
		providers: z
			.object({
				data: z.literal('convex'),
				auth: z.enum(['better-auth', 'none']),
				billing: z.enum(['autumn', 'none']),
				email: z.enum(['resend', 'none']),
				analytics: z.literal('posthog'),
				errors: z.literal('sentry'),
				hosting: z.literal('cloudflare-pages')
			})
			.strict()
	})
	.strict();

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
