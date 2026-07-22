import { z } from 'zod/v3';

const blogMetadataSchema = z.object({
	title: z.string().trim().min(1).max(120),
	description: z.string().trim().min(1).max(240),
	author: z.string().trim().min(1).max(100),
	published: z
		.string()
		.refine((value) => !Number.isNaN(Date.parse(value)), 'Use a valid published date.'),
	updated: z
		.string()
		.refine((value) => !Number.isNaN(Date.parse(value)), 'Use a valid updated date.')
		.optional(),
	tags: z.array(z.string().trim().min(1).max(50)).max(20),
	draft: z.boolean(),
	canonicalUrl: z.string().url(),
	socialImage: z.string().trim().min(1)
});

export interface BlogPostMetadata extends z.infer<typeof blogMetadataSchema> {
	slug: string;
}

interface BlogModule {
	metadata?: unknown;
}

const modules = import.meta.glob<BlogModule>('/content/blog/*.svx', { eager: true });

export function parseBlogMetadata(slug: string, metadata: unknown): BlogPostMetadata {
	const result = blogMetadataSchema.safeParse(metadata);
	if (!result.success)
		throw new Error(`Invalid blog metadata for ${slug}: ${result.error.message}`);
	return { slug, ...result.data };
}

export function getAllBlogPosts() {
	return Object.entries(modules)
		.map(([path, module]) =>
			parseBlogMetadata(
				path
					.split('/')
					.at(-1)!
					.replace(/\.svx$/, ''),
				module.metadata
			)
		)
		.sort((left, right) => Date.parse(right.published) - Date.parse(left.published));
}

export function getPublishedBlogPosts() {
	return getAllBlogPosts().filter((post) => !post.draft);
}

export function getBlogPost(slug: string) {
	return getAllBlogPosts().find((post) => post.slug === slug && !post.draft) ?? null;
}
