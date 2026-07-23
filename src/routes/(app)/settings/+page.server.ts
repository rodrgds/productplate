import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { feedbackFormSchema } from '$lib/forms/schemas';
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { api } from '$convex/_generated/api.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	feedbackForm: await superValidate(zod(feedbackFormSchema))
});

export const actions: Actions = {
	feedback: async ({ request, locals }) => {
		const form = await superValidate(request, zod(feedbackFormSchema));
		if (!form.valid) return fail(400, { form });
		if (!locals.token) return fail(401, { form });
		const client = createConvexHttpClient({ token: locals.token });
		await client.mutation(api.feedback.create, {
			category: form.data.category,
			message: form.data.message,
			requestId: locals.requestId ?? crypto.randomUUID()
		});
		return message(form, 'Feedback sent.');
	}
};
