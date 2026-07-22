import { describe, expect, it, vi } from 'vitest';
import { deliverProductEmail, renderProductEmail, type ProductEmailTemplate } from './service';

const templates: ProductEmailTemplate[] = [
	'verify-email',
	'password-reset',
	'email-change-approval',
	'welcome',
	'workspace-invite',
	'waitlist-confirmation',
	'subscription-status'
];

describe('product email service', () => {
	it('escapes user values in rendered email', () => {
		const html = renderProductEmail({
			template: 'waitlist-confirmation',
			productName: 'Launch <List>',
			actionUrl: 'https://example.com/unsubscribe?token=signed',
			recipientName: 'Ada <script>'
		});
		expect(html).toContain('Launch &lt;List&gt;');
		expect(html).toContain('Ada &lt;script&gt;');
		expect(html).toContain('Unsubscribe');
	});

	it.each(templates)('matches the %s HTML snapshot', (template) => {
		expect(
			renderProductEmail({
				template,
				productName: 'Launch List',
				recipientName: 'Ada',
				actionUrl: 'https://example.com/action',
				workspaceName: 'Founders',
				status: 'active'
			})
		).toMatchSnapshot();
	});

	it('stays in preview mode without a Resend key', async () => {
		const fetcher = vi.fn();
		const result = await deliverProductEmail(
			{
				to: 'ada@example.com',
				subject: 'Welcome',
				html: '<p>Welcome</p>'
			},
			{ apiKey: undefined, from: 'Launch List <hello@example.com>', fetcher }
		);
		expect(result.status).toBe('preview');
		expect(fetcher).not.toHaveBeenCalled();
	});
});
