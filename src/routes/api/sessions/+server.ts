import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();

	const { data, error: insertError } = await supabase
		.from('writing_sessions')
		.insert({
			user_id: user.id,
			project_id: body.project_id || null,
			scene_id: body.scene_id || null,
			starting_word_count: body.starting_word_count ?? 0
		})
		.select('id')
		.single();

	if (insertError) {
		throw error(500, 'Failed to create session');
	}

	return json({ id: data.id });
};

export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const active = url.searchParams.get('active');

	let query = supabase
		.from('writing_sessions')
		.select('*')
		.eq('user_id', user.id)
		.order('started_at', { ascending: false });

	if (active === 'true') {
		query = query.is('ended_at', null);
	}

	const { data, error: selectError } = await query;

	if (selectError) {
		throw error(500, 'Failed to fetch sessions');
	}

	return json({ sessions: data });
};
