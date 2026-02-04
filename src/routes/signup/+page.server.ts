import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters', email });
		}

		const { error } = await supabase.auth.signUp({ email, password });

		if (error) {
			return fail(400, { error: error.message, email });
		}

		redirect(303, '/projects');
	}
};
