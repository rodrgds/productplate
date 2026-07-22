import { error } from '@sveltejs/kit';
import { getBlogPost } from '$lib/content/blog';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const post = getBlogPost(params.slug);
	if (!post) error(404, 'Article not found.');
	return { post };
};
