import { describe, expect, it } from 'vitest';
import { scrubSentryEvent } from './sentry';

describe('Sentry event scrubbing', () => {
	it('removes credentials, request bodies, and user content while attaching release context', () => {
		const event = scrubSentryEvent(
			{
				message: 'private support message',
				exception: { values: [{ type: 'Error', value: 'private prompt' }] },
				request: {
					url: 'https://app.example.com/fail?email=private@example.com',
					headers: {
						authorization: 'Bearer secret',
						cookie: 'session=secret',
						accept: 'text/html'
					},
					data: { prompt: 'private prompt', email: 'private@example.com' }
				},
				user: { id: 'internal-id', email: 'private@example.com', username: 'Ada' },
				extra: { form: { message: 'private support message' } },
				breadcrumbs: [{ message: 'private support message', data: { prompt: 'private prompt' } }]
			},
			{ requestId: 'request-123', gitSha: 'abc123' }
		);
		expect(JSON.stringify(event)).not.toContain('secret');
		expect(JSON.stringify(event)).not.toContain('private prompt');
		expect(JSON.stringify(event)).not.toContain('private@example.com');
		expect(JSON.stringify(event)).not.toContain('private support message');
		expect(event).toMatchObject({
			request: { url: 'https://app.example.com/fail', headers: { accept: 'text/html' } },
			exception: { values: [{ type: 'Error', value: 'Application error' }] },
			user: { id: 'internal-id' },
			tags: { request_id: 'request-123', git_sha: 'abc123' }
		});
	});
});
