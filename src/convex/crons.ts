import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
	'expire pending organization invites',
	{ hours: 1 },
	internal.maintenance.expireOldInvites,
	{}
);
crons.cron('prune read notifications', '30 3 * * *', internal.maintenance.pruneReadNotifications, {
	olderThanDays: 45
});
crons.interval(
	'expire disposable demo accounts',
	{ hours: 1 },
	internal.lifecycle.expireDemoAccounts,
	{}
);
crons.cron(
	'prune operational records',
	'45 3 * * *',
	internal.maintenance.pruneOperationalData,
	{}
);

export default crons;
