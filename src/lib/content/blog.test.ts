import { describe, expect, it } from 'vitest';
import { parseBlogMetadata } from './blog';

describe('blog metadata', () => {
	it('accepts the complete article contract', () => {
		expect(
			parseBlogMetadata('launch-notes', {
				title: 'Launch notes',
				description: 'What changed in this release.',
				author: 'Product team',
				published: '2026-07-22',
				updated: '2026-07-22',
				tags: ['release'],
				draft: false,
				canonicalUrl: 'https://example.com/blog/launch-notes',
				socialImage: '/og.png'
			})
		).toMatchObject({ slug: 'launch-notes', title: 'Launch notes', draft: false });
	});

	it('rejects incomplete or invalid dates and URLs', () => {
		expect(() => parseBlogMetadata('bad', { title: 'Bad' })).toThrow('metadata');
		expect(() =>
			parseBlogMetadata('bad', {
				title: 'Bad',
				description: 'Bad metadata.',
				author: 'Product team',
				published: 'not-a-date',
				tags: [],
				draft: false,
				canonicalUrl: 'relative',
				socialImage: '/og.png'
			})
		).toThrow('metadata');
	});
});
