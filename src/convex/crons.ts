import { cronJobs, makeFunctionReference, type FunctionReference } from 'convex/server';

const expireOldInvitesRef = makeFunctionReference<'mutation', Record<string, never>, number>(
	'maintenance:expireOldInvites'
) as unknown as FunctionReference<'mutation', 'internal', Record<string, never>, number>;

const pruneReadNotificationsRef = makeFunctionReference<
	'mutation',
	{ olderThanDays?: number },
	number
>('maintenance:pruneReadNotifications') as unknown as FunctionReference<
	'mutation',
	'internal',
	{ olderThanDays?: number },
	number
>;

const queueWebhookRetriesRef = makeFunctionReference<'mutation', Record<string, never>, number>(
	'maintenance:queueWebhookRetries'
) as unknown as FunctionReference<'mutation', 'internal', Record<string, never>, number>;

const crons = cronJobs();

crons.interval('expire pending organization invites', { hours: 1 }, expireOldInvitesRef, {});
crons.cron('prune read notifications', '30 3 * * *', pruneReadNotificationsRef, {
	olderThanDays: 45
});
crons.interval('queue failed webhook retries', { minutes: 5 }, queueWebhookRetriesRef, {});

export default crons;
