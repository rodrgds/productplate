import changelog from '../../../CHANGELOG.md?raw';
import { parseChangelog } from '$lib/changelog.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ releases: parseChangelog(changelog) });
