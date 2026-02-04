import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();
	const update: Record<string, unknown> = {};

	if (body.content !== undefined) update.content = body.content;
	if (body.word_count !== undefined) update.word_count = body.word_count;
	if (body.status !== undefined) update.status = body.status;

	if (Object.keys(update).length === 0) {
		throw error(400, 'No fields to update');
	}

	const { error: updateError } = await supabase
		.from('scenes')
		.update(update)
		.eq('id', params.sceneId)
		.eq('user_id', user.id);

	if (updateError) {
		throw error(500, 'Failed to update scene');
	}

	return json({ success: true });
};
