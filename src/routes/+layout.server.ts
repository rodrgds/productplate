import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({
	supportEmail: env.SUPPORT_EMAIL ?? null,
	requestId: locals.requestId ?? null
});
