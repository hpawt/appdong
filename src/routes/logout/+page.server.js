import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		if (event.locals.session) await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);
		redirect(303, '/');
	}
};
