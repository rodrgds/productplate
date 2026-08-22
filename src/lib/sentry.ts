/** The subset of Sentry event fields this scrubber reads or deletes. */
interface SentryLikeEvent {
	message?: string;
	exception?: { values?: Array<{ value?: string } & Record<string, JsonValue>> };
	request?: {
		headers?: Record<string, string>;
		data?: JsonValue;
		url?: string;
	};
	user?: { id?: string };
	extra?: Record<string, JsonValue>;
	contexts?: Record<string, JsonValue>;
	breadcrumbs?: Array<{ data?: Record<string, JsonValue>; message?: string }>;
	tags?: Record<string, string>;
}

interface SentryContext {
	requestId?: string;
	gitSha?: string;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const sensitiveHeaders = new Set([
	'authorization',
	'cookie',
	'proxy-authorization',
	'set-cookie',
	'x-api-key'
]);

// SAFETY: Sentry events arrive as arbitrary JSON from the SDK; only the fields
// declared in SentryLikeEvent are read or deleted, and the rest passes through.
export function scrubSentryEvent<Event>(event: Event, context: SentryContext = {}): Event {
	// SAFETY: Sentry events are arbitrary SDK JSON; only SentryLikeEvent fields are touched.
	const scrubbed = structuredClone(event) as Event & SentryLikeEvent;
	scrubEventFields(scrubbed, context);
	return scrubbed;
}

function scrubEventFields(scrubbed: SentryLikeEvent, context: SentryContext): void {
	delete scrubbed.message;
	if (scrubbed.exception?.values) {
		scrubbed.exception.values = scrubbed.exception.values.map((entry) => {
			const next = { ...entry };
			if (next.value) next.value = 'Application error';
			else delete next.value;
			return next;
		});
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
	const tags: Record<string, string> = scrubbed.tags ?? {};
	if (context.requestId) tags.request_id = context.requestId;
	if (context.gitSha) tags.git_sha = context.gitSha;
	scrubbed.tags = tags;
}
