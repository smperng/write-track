import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const { data, error: selectError } = await supabase
		.from('goals')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', user.id)
		.single();

	if (selectError) {
		throw error(500, 'Failed to fetch goal');
	}

	return json({ goal: data });
};

export const PUT: RequestHandler = async ({ params, request, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();
	const update: Record<string, unknown> = {};

	if (body.title !== undefined) update.title = body.title;
	if (body.goal_type !== undefined) update.goal_type = body.goal_type;
	if (body.goal_scope !== undefined) update.goal_scope = body.goal_scope;
	if (body.status !== undefined) update.status = body.status;
	if (body.target_value !== undefined) update.target_value = body.target_value;
	if (body.target_date !== undefined) update.target_date = body.target_date;
	if (body.current_value !== undefined) update.current_value = body.current_value;
	if (body.is_recurring !== undefined) update.is_recurring = body.is_recurring;

	if (Object.keys(update).length === 0) {
		throw error(400, 'No fields to update');
	}

	const { data, error: updateError } = await supabase
		.from('goals')
		.update(update)
		.eq('id', params.id)
		.eq('user_id', user.id)
		.select()
		.single();

	if (updateError) {
		throw error(500, 'Failed to update goal');
	}

	return json({ goal: data });
};

export const DELETE: RequestHandler = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const { error: deleteError } = await supabase
		.from('goals')
		.delete()
		.eq('id', params.id)
		.eq('user_id', user.id);

	if (deleteError) {
		throw error(500, 'Failed to delete goal');
	}

	return json({ success: true });
};
