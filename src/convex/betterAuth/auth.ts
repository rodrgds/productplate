import { betterAuth } from 'better-auth';
import { createAuthOptions } from '../auth';
import type { GenericCtx } from '@convex-dev/better-auth';
import type { DataModel } from '../_generated/dataModel';

// Export a static instance for Better Auth schema generation
export const auth = betterAuth(
	createAuthOptions({} as GenericCtx<DataModel>, { optionsOnly: true })
);
