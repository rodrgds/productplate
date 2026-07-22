import { describe, expect, it, vi } from 'vitest';
import { smokeDeployment } from '../../scripts/smoke-deploy';

describe('deployment smoke', () => {
	it('retries a temporary Cloudflare 404 before accepting rendered HTML', async () => {
		const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(new Response('Not found', { status: 404 }))
			.mockResolvedValueOnce(new Response('<html><main>Ready</main></html>', { status: 200 }));
		const wait = vi.fn().mockResolvedValue(undefined);

		await smokeDeployment('https://preview.example.com', {
			fetcher,
			wait,
			attempts: 3,
			delayMs: 1
		});

		expect(fetcher).toHaveBeenCalledTimes(2);
		expect(wait).toHaveBeenCalledOnce();
		expect(warning).toHaveBeenCalledOnce();
		warning.mockRestore();
	});

	it('fails after the bounded retry budget', async () => {
		const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const fetcher = vi.fn().mockResolvedValue(new Response('Not found', { status: 404 }));

		await expect(
			smokeDeployment('https://preview.example.com', {
				fetcher,
				wait: async () => {},
				attempts: 2,
				delayMs: 1
			})
		).rejects.toThrow('Deployment smoke failed with 404.');
		expect(fetcher).toHaveBeenCalledTimes(2);
		expect(warning).toHaveBeenCalledOnce();
		warning.mockRestore();
	});
});
