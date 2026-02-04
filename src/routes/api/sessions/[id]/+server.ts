import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();
	const update: Record<string, unknown> = {};

	if (body.ended_at !== undefined) update.ended_at = body.ended_at;
	if (body.ending_word_count !== undefined) update.ending_word_count = body.ending_word_count;
	if (body.words_added !== undefined) update.words_added = body.words_added;
	if (body.words_deleted !== undefined) update.words_deleted = body.words_deleted;
	if (body.duration_seconds !== undefined) update.duration_seconds = body.duration_seconds;
	if (body.idle_seconds !== undefined) update.idle_seconds = body.idle_seconds;

	if (Object.keys(update).length === 0) {
		throw error(400, 'No fields to update');
	}

	const { error: updateError } = await supabase
		.from('writing_sessions')
		.update(update)
		.eq('id', params.id)
		.eq('user_id', user.id);

	if (updateError) {
		throw error(500, 'Failed to update session');
	}

	return json({ success: true });
};

export const GET: RequestHandler = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const { data, error: selectError } = await supabase
		.from('writing_sessions')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', user.id)
		.single();

	if (selectError) {
		throw error(500, 'Failed to fetch session');
	}

	return json({ session: data });
};
