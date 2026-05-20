import { z } from 'zod/v3';

export const schema = z.object({
	id: z.number(),
	header: z.string(),
	type: z.string(),
	status: z.string(),
	target: z.string(),
	limit: z.string(),
	reviewer: z.string()
});

export type Schema = z.infer<typeof schema>;
