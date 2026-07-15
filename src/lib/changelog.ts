export interface ChangelogGroup {
	title: string;
	items: string[];
}

export interface ChangelogRelease {
	version: string;
	date?: string;
	groups: ChangelogGroup[];
}

export function parseChangelog(markdown: string): ChangelogRelease[] {
	const releases: ChangelogRelease[] = [];
	let currentRelease: ChangelogRelease | undefined;
	let currentGroup: ChangelogGroup | undefined;

	for (const line of markdown.split('\n')) {
		const releaseMatch = /^## (?:\[([^\]]+)\]|(.+?))(?: - (\d{4}-\d{2}-\d{2}))?$/.exec(line);
		if (releaseMatch) {
			const version = releaseMatch[1] ?? releaseMatch[2];
			if (!version) continue;
			currentRelease = {
				version,
				...(releaseMatch[3] ? { date: releaseMatch[3] } : {}),
				groups: []
			};
			releases.push(currentRelease);
			currentGroup = undefined;
			continue;
		}

		const groupMatch = /^### (.+)$/.exec(line);
		if (groupMatch && currentRelease) {
			currentGroup = { title: groupMatch[1], items: [] };
			currentRelease.groups.push(currentGroup);
			continue;
		}

		const itemMatch = /^- (.+)$/.exec(line);
		if (itemMatch && currentGroup) currentGroup.items.push(itemMatch[1]);
	}

	return releases.filter((release) => release.groups.some((group) => group.items.length > 0));
}
