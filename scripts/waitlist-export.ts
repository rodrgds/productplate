#!/usr/bin/env bun
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../src/convex/_generated/api.js';

const convexUrl = process.env.PUBLIC_CONVEX_URL;
const secret = process.env.WAITLIST_EXPORT_SECRET;
if (!convexUrl || !secret) {
	console.error('PUBLIC_CONVEX_URL and WAITLIST_EXPORT_SECRET are required.');
	process.exit(1);
}

function csv(value: string | number | undefined) {
	const text = value === undefined ? '' : String(value);
	return `"${text.replaceAll('"', '""')}"`;
}

const client = new ConvexHttpClient(convexUrl);
let cursor: string | null = null;
const rows: Array<Array<string | number | undefined>> = [];
do {
	const page = await client.query(api.waitlist.exportPage, {
		secret,
		paginationOpts: { cursor, numItems: 200 }
	});
	for (const subscriber of page.page) {
		rows.push([
			subscriber.email,
			subscriber.status,
			subscriber.source,
			subscriber.utmSource,
			subscriber.utmMedium,
			subscriber.utmCampaign,
			subscriber.createdAt,
			subscriber.updatedAt,
			subscriber.unsubscribedAt
		]);
	}
	cursor = page.isDone ? null : page.continueCursor;
} while (cursor);

console.log(
	[
		'email',
		'status',
		'source',
		'utmSource',
		'utmMedium',
		'utmCampaign',
		'createdAt',
		'updatedAt',
		'unsubscribedAt'
	]
		.map(csv)
		.join(',')
);
for (const row of rows) console.log(row.map(csv).join(','));
