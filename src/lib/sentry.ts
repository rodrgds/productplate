interface SentryLikeEvent {
	message?: string;
	exception?: { values?: Array<{ value?: string; [key: string]: unknown }> };
	request?: {
		headers?: Record<string, string>;
		data?: unknown;
		url?: string;
		[key: string]: unknown;
	};
	user?: { id?: string; [key: string]: unknown };
	extra?: Record<string, unknown>;
	contexts?: Record<string, unknown>;
	breadcrumbs?: Array<{
		data?: Record<string, unknown>;
		message?: string;
		[key: string]: unknown;
	}>;
	tags?: Record<string, string>;
	[key: string]: unknown;
}

interface SentryContext {
	requestId?: string;
	gitSha?: string;
}

const sensitiveHeaders = new Set([
	'authorization',
	'cookie',
	'proxy-authorization',
	'set-cookie',
	'x-api-key'
]);

export function scrubSentryEvent<Event>(event: Event, context: SentryContext = {}): Event {
	const scrubbed = structuredClone(event) as Event & SentryLikeEvent;
	delete scrubbed.message;
	if (scrubbed.exception?.values) {
		scrubbed.exception.values = scrubbed.exception.values.map((value) => ({
			...value,
			value: value.value ? 'Application error' : undefined
		}));
	}
	if (scrubbed.request) {
		delete scrubbed.request.data;
		if (scrubbed.request.url) {
			try {
				const url = new URL(scrubbed.request.url);
				url.search = '';
				scrubbed.request.url = url.toString();
			} catch {
				delete scrubbed.request.url;
			}
		}
		if (scrubbed.request.headers) {
			for (const key of Object.keys(scrubbed.request.headers)) {
				if (sensitiveHeaders.has(key.toLowerCase())) delete scrubbed.request.headers[key];
			}
		}
	}
	if (scrubbed.user) scrubbed.user = scrubbed.user.id ? { id: scrubbed.user.id } : {};
	delete scrubbed.extra;
	delete scrubbed.contexts;
	if (scrubbed.breadcrumbs) {
		scrubbed.breadcrumbs = scrubbed.breadcrumbs.map((breadcrumb) => {
			const scrubbedBreadcrumb = { ...breadcrumb };
			delete scrubbedBreadcrumb.data;
			delete scrubbedBreadcrumb.message;
			return scrubbedBreadcrumb;
		});
	}
	scrubbed.tags = {
		...scrubbed.tags,
		...(context.requestId ? { request_id: context.requestId } : {}),
		...(context.gitSha ? { git_sha: context.gitSha } : {})
	};
	return scrubbed;
}
