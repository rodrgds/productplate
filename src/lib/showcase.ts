import entries from '../../data/showcase.json';

export interface ShowcaseEntry {
	name: string;
	description: string;
	url: string;
	repository?: string;
}

export const showcaseEntries: ShowcaseEntry[] = entries;
